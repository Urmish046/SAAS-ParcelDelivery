import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException, Inject, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Parcel, ParcelStatus } from '../../models/parcel.model';
import { ParcelStatusHistory } from '../../models/parcel-status-history.model';
import { CreateParcelDto } from '../../utils/dto/create-parcel.dto';
import { UpdateParcelStatusDto } from '../../utils/dto/update-parcel-status.dto';
import { STORAGE_SERVICE, type IStorageService } from '../../storage/storage.interface';
import { EmailService } from '../../email/email.service';
import { PricingService } from '../../pricing/pricing.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ParcelService {
  constructor(
    @InjectRepository(Parcel)
    private parcelRepository: Repository<Parcel>,
    @InjectRepository(ParcelStatusHistory)
    private historyRepository: Repository<ParcelStatusHistory>,
    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
    private readonly emailService: EmailService,
    private readonly pricingService: PricingService,
    private eventEmitter: EventEmitter2,
  ) {}

  private async formatParcelWithSecureUrls(parcel: Parcel) {
    const parcelPayload = { ...parcel };
    
    if (parcelPayload.imageUrls && parcelPayload.imageUrls.length > 0) {
      parcelPayload.imageUrls = await Promise.all(
        parcelPayload.imageUrls.map(async (img) => {
          if (img.startsWith('http')) return img; 
          try {
            return await this.storageService.getFileUrl(img);
          } catch (error) {
            return img;
          }
        })
      );
    }

    if (parcelPayload.paymentReceiptUrl && !parcelPayload.paymentReceiptUrl.startsWith('http')) {
      try {
        parcelPayload.paymentReceiptUrl = await this.storageService.getFileUrl(parcelPayload.paymentReceiptUrl);
      } catch (error) {
        console.error("Error generating receipt URL:", error);
      }
    }

    return parcelPayload;
  }

  async getCustomerStats(companyId: string, userId: string) {
    const activeShipments = await this.parcelRepository.count({
      where: { 
        companyId, 
        customerId: userId, 
        status: In([ParcelStatus.PENDING, ParcelStatus.SCANNED, ParcelStatus.SHIPPED]) 
      }
    });

    const actionRequired = await this.parcelRepository.count({
      where: { 
        companyId, 
        customerId: userId, 
        status: ParcelStatus.SCANNED 
      }
    });

    const readyForPickup = await this.parcelRepository.count({
      where: { 
        companyId, 
        customerId: userId, 
        status: ParcelStatus.AVAILABLE_FOR_PICKUP 
      }
    });

    return { activeShipments, actionRequired, readyForPickup };
  }

  async uploadPaymentReceipt(id: string, file: Express.Multer.File, companyId: string, currentUser: any) {
    const parcel = await this.findOne(id, companyId, currentUser);
    
    const fileName = await this.storageService.uploadFile(file, `payments/${companyId}`);
    
    parcel.status = ParcelStatus.PAYMENT_UNDER_REVIEW; 
    
    parcel.paymentReceiptUrl = fileName; 
    
    await this.parcelRepository.save(parcel);

    await this.historyRepository.save(
      this.historyRepository.create({
        parcelId: parcel.id,
        status: ParcelStatus.PAYMENT_UNDER_REVIEW,
        changedById: currentUser.userId,
        changedByType: 'customer',
      })
    );

    return { receiptUrl: fileName, status: ParcelStatus.PAYMENT_UNDER_REVIEW }; 
  }

  async create(createParcelDto: CreateParcelDto, companyId: string, currentUser: any) {
    const actualCustomerId = currentUser.role === 'customer' ? currentUser.userId : createParcelDto.customerId;

    if (!actualCustomerId) {
      throw new BadRequestException('Customer ID is required.');
    }

    const internalTrackingId = `INT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const parcel = this.parcelRepository.create({
      ...createParcelDto,
      customerId: actualCustomerId,
      internalTrackingId,
      companyId,
    });

    try {
      const savedParcel = await this.parcelRepository.save(parcel);

      await this.historyRepository.save(
        this.historyRepository.create({
          parcelId: savedParcel.id,
          status: ParcelStatus.PENDING,
          changedById: currentUser.userId,
          changedByType: currentUser.role === 'customer' ? 'customer' : 'user',
        })
      );

      return await this.formatParcelWithSecureUrls(savedParcel);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('A parcel with this tracking number already exists.');
      }
      throw new InternalServerErrorException('Failed to create parcel.');
    }
  }

  async claimParcel(trackingId: string, companyId: string, user: any) {
    const parcel = await this.parcelRepository.findOne({ 
      where: { 
        internalTrackingId: trackingId, 
        companyId: companyId 
      }
    });

    if (!parcel) {
      throw new BadRequestException('Invalid Tracking ID. Parcel not found.');
    }

    if (parcel.customerId) {
      if (parcel.customerId === user.userId) {
        return await this.formatParcelWithSecureUrls(parcel);
      }
      throw new BadRequestException('This parcel has already been claimed by another user.');
    }

    parcel.customerId = user.userId;
    const savedParcel = await this.parcelRepository.save(parcel);

    await this.historyRepository.save(
      this.historyRepository.create({
        parcelId: savedParcel.id,
        status: savedParcel.status,
        changedById: user.userId,
        changedByType: 'customer',
      })
    );

    return await this.formatParcelWithSecureUrls(savedParcel);
  }
  // -----------------------------

  async findAll(companyId: string, currentUser: any) {
    const whereClause: any = { companyId };

    if (currentUser.role === 'customer') {
      whereClause.customerId = currentUser.userId;
    }

    if (currentUser.role === 'warehouse_staff') {
      if (!currentUser.warehouseId) {
        throw new ForbiddenException('You are not assigned to any warehouse.');
      }
      whereClause.warehouseId = currentUser.warehouseId;
    }

    const parcels = await this.parcelRepository.find({
      where: whereClause,
      relations: ['warehouse', 'customer'],
      order: { createdAt: 'DESC' }
    });

    return Promise.all(parcels.map(parcel => this.formatParcelWithSecureUrls(parcel)));
  }

  async findOne(id: string, companyId: string, currentUser: any) {
    const whereClause: any = { id, companyId };

    if (currentUser.role === 'customer') {
      whereClause.customerId = currentUser.userId;
    }

    if (currentUser.role === 'warehouse_staff') {
      if (!currentUser.warehouseId) {
        throw new ForbiddenException('You are not assigned to any warehouse.');
      }
      whereClause.warehouseId = currentUser.warehouseId;
    }

    const parcel = await this.parcelRepository.findOne({
      where: whereClause,
      relations: ['warehouse', 'customer'],
    });

    if (!parcel) {
      throw new NotFoundException(`Parcel not found!`);
    }

    return parcel;
  }

  async confirmShipment(id: string, companyId: string, currentUser: any) {
    const parcel = await this.findOne(id, companyId, currentUser);

    if (parcel.status !== ParcelStatus.SCANNED) {
      throw new BadRequestException('Parcel cannot be confirmed yet.');
    }

    parcel.isCustomerConfirmed = true;
    await this.parcelRepository.save(parcel);

    await this.historyRepository.save(
      this.historyRepository.create({
        parcelId: parcel.id,
        status: parcel.status,
        changedById: currentUser.userId,
        changedByType: 'customer',
      })
    );

    return await this.formatParcelWithSecureUrls(parcel);
  }

  async updateStatus(id: string, updateDto: UpdateParcelStatusDto, companyId: string, currentUser: any) {
    const parcel = await this.findOne(id, companyId, currentUser);
    
    const originalStatus = parcel.status;

    if (updateDto.status === ParcelStatus.SHIPPED && !parcel.isCustomerConfirmed) {
      throw new BadRequestException('Access Denied: Cannot ship this parcel until the customer confirms the weight & price.');
    }

    const allowedNextStatuses = {
      [ParcelStatus.PENDING]: [ParcelStatus.SCANNED, ParcelStatus.RETURNED],
      [ParcelStatus.SCANNED]: [ParcelStatus.SHIPPED, ParcelStatus.RETURNED],
      [ParcelStatus.SHIPPED]: [ParcelStatus.AVAILABLE_FOR_PICKUP, ParcelStatus.RETURNED],
      [ParcelStatus.AVAILABLE_FOR_PICKUP]: [ParcelStatus.COMPLETED, ParcelStatus.RETURNED],
      [ParcelStatus.PAYMENT_UNDER_REVIEW]: [ParcelStatus.COMPLETED, ParcelStatus.AVAILABLE_FOR_PICKUP],
      [ParcelStatus.COMPLETED]: [], 
      [ParcelStatus.RETURNED]: [ParcelStatus.PENDING]
    };

    if (updateDto.status && originalStatus !== updateDto.status) {
      const validTransitions = allowedNextStatuses[originalStatus as string] || [];
      if (!validTransitions.includes(updateDto.status as string)) {
        throw new BadRequestException(`Strict Flow: Aap '${originalStatus}' se directly '${updateDto.status}' nahi kar sakte.`);
      }
      parcel.status = updateDto.status as ParcelStatus;
    }
    
    if (updateDto.customerTrackingId !== undefined) {
      parcel.customerTrackingId = updateDto.customerTrackingId;
    }
    if (updateDto.weight !== undefined) parcel.weight = updateDto.weight;
    if (updateDto.dimensions !== undefined) parcel.dimensions = updateDto.dimensions;
    if (updateDto.shippingCost !== undefined) parcel.shippingCost = updateDto.shippingCost;

    await this.parcelRepository.save(parcel);

    if (updateDto.status && originalStatus !== updateDto.status) {
      this.eventEmitter.emit('parcel.status_changed', {
        trackingId: parcel.originalTrackingNumber,
        status: parcel.status,
        email: parcel.customer.email 
      });

      await this.historyRepository.save(
        this.historyRepository.create({
          parcelId: parcel.id,
          status: updateDto.status as ParcelStatus,
          changedById: currentUser.userId,
          changedByType: currentUser.role === 'customer' ? 'customer' : 'user',
        })
      );
    }

    return await this.formatParcelWithSecureUrls(parcel);
  }

  async uploadImage(id: string, file: Express.Multer.File, companyId: string, currentUser: any): Promise<string> {
    const parcel = await this.findOne(id, companyId, currentUser);
    
    const fileName = await this.storageService.uploadFile(file, `parcels/${companyId}`);

    try {
      const currentImages = parcel.imageUrls || [];
      parcel.imageUrls = [...currentImages, fileName];
      await this.parcelRepository.save(parcel);
      
      return await this.storageService.getFileUrl(fileName);
    } catch (error) {
      await this.storageService.deleteFile(fileName);
      throw new InternalServerErrorException('Database update failed');
    }
  }

  async remove(id: string, companyId: string, currentUser: any) {
    const parcel = await this.findOne(id, companyId, currentUser);
    return this.parcelRepository.remove(parcel);
  }
}