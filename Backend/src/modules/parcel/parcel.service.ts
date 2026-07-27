import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException, Inject, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Parcel, ParcelStatus } from '../../models/parcel.model';
import { ParcelStatusHistory } from '../../models/parcel-status-history.model';
import { UpdateParcelStatusDto } from '../../utils/dto/update-parcel-status.dto';
import { STORAGE_SERVICE, type IStorageService } from '../../storage/storage.interface';
import { EmailService } from '../../email/email.service';
import { PricingService } from '../../pricing/pricing.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TrackingRequest, TrackingRequestStatus } from '../../models/tracking-request.model';
import { Customer } from '../../models/customer.model';

type WarehouseRole = 'origin' | 'destination' | null;

const TRANSITION_OWNER: Record<string, Record<string, WarehouseRole>> = {
  [ParcelStatus.PENDING]: {
    [ParcelStatus.SCANNED]: 'origin',
    [ParcelStatus.RETURNED]: 'origin',
  },
  [ParcelStatus.SCANNED]: {
    [ParcelStatus.SHIPPED]: 'origin',
    [ParcelStatus.RETURNED]: 'origin',
  },
  [ParcelStatus.SHIPPED]: {
    [ParcelStatus.AVAILABLE_FOR_PICKUP]: 'destination',
    [ParcelStatus.RETURNED]: 'destination',
  },
  [ParcelStatus.AVAILABLE_FOR_PICKUP]: {
    [ParcelStatus.COMPLETED]: 'destination',
    [ParcelStatus.RETURNED]: 'destination',
  },
  [ParcelStatus.PAYMENT_UNDER_REVIEW]: {
    [ParcelStatus.COMPLETED]: 'destination',
    [ParcelStatus.AVAILABLE_FOR_PICKUP]: 'destination',
  },
  [ParcelStatus.RETURNED]: {
    [ParcelStatus.PENDING]: 'origin',
  },
};

@Injectable()
export class ParcelService {
  constructor(
    @InjectRepository(Parcel)
    private parcelRepository: Repository<Parcel>,
    @InjectRepository(ParcelStatusHistory)
    private historyRepository: Repository<ParcelStatusHistory>,
    @InjectRepository(TrackingRequest)
    private trackingRequestRepo: Repository<TrackingRequest>,
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
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
        console.error('Error generating receipt URL:', error);
      }
    }

    return parcelPayload;
  }

  private assertWarehouseAuthority(parcel: Parcel, currentUser: any, requiredRole: WarehouseRole) {
    if (currentUser.role !== 'warehouse_staff' || requiredRole === null) return;

    if (!currentUser.warehouseId) {
      throw new ForbiddenException('You are not assigned to any warehouse.');
    }

    const relevantWarehouseId =
      requiredRole === 'origin' ? parcel.originWarehouseId : parcel.destinationWarehouseId;

    if (currentUser.warehouseId !== relevantWarehouseId) {
      throw new ForbiddenException(
        `Only the ${requiredRole} warehouse staff can perform this action on this parcel.`
      );
    }
  }

  async createPreAlert(trackingNumber: string, companyId: string, currentUser: any) {
    if (currentUser.role !== 'customer') {
      throw new ForbiddenException('Only customers can register tracking numbers.');
    }

    const existingRequest = await this.trackingRequestRepo.findOne({
      where: { trackingNumber, companyId }
    });

    if (existingRequest) {
      throw new ConflictException('This tracking number is already registered in the system.');
    }

    const customer = await this.customerRepo.findOne({
      where: { id: currentUser.userId, companyId }
    });

    if (!customer || !customer.destinationWarehouseId) {
      throw new BadRequestException('Your profile is missing a default destination warehouse. Please contact support.');
    }

    const newRequest = this.trackingRequestRepo.create({
      trackingNumber,
      companyId,
      customerId: currentUser.userId,
      destinationWarehouseId: customer.destinationWarehouseId,
    });

    return await this.trackingRequestRepo.save(newRequest);
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

  async scanAndReceiveParcel(trackingNumber: string, companyId: string, currentUser: any) {
    if (currentUser.role !== 'warehouse_staff' || !currentUser.warehouseId) {
      throw new ForbiddenException('Only assigned warehouse staff can scan and receive parcels.');
    }

    const existingParcel = await this.parcelRepository.findOne({
      where: { originalTrackingNumber: trackingNumber, companyId },
      relations: ['originWarehouse', 'destinationWarehouse', 'customer'],
    });

    if (existingParcel) {
      return await this.formatParcelWithSecureUrls(existingParcel);
    }

    const trackingRequest = await this.trackingRequestRepo.findOne({
      where: { trackingNumber, companyId }
    });

    if (!trackingRequest) {
      throw new NotFoundException(
        `Tracking ID "${trackingNumber}" not found! Customer has not registered this parcel.`
      );
    }

    if (currentUser.warehouseId === trackingRequest.destinationWarehouseId) {
      throw new BadRequestException(
        'Origin and Destination warehouses cannot be exactly the same! This warehouse is already set as the destination.'
      );
    }

    const internalTrackingId = `INT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newParcel = this.parcelRepository.create({
      originalTrackingNumber: trackingNumber,
      internalTrackingId,
      companyId,
      description: 'Waiting for details update',
      originWarehouseId: currentUser.warehouseId,
      customerId: trackingRequest.customerId,
      destinationWarehouseId: trackingRequest.destinationWarehouseId,
      status: ParcelStatus.SCANNED,
    });

    const savedParcel = await this.parcelRepository.save(newParcel);

    await this.historyRepository.save(
      this.historyRepository.create({
        parcelId: savedParcel.id,
        status: ParcelStatus.SCANNED,
        changedById: currentUser.userId,
        changedByType: 'user',
      })
    );

    trackingRequest.status = TrackingRequestStatus.MATCHED;
    await this.trackingRequestRepo.save(trackingRequest);

    const completeParcel = await this.parcelRepository.findOne({
      where: { id: savedParcel.id },
      relations: ['originWarehouse', 'destinationWarehouse', 'customer'],
    });

    return await this.formatParcelWithSecureUrls(completeParcel!);
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

  async findAll(companyId: string, currentUser: any) {
    if (currentUser.role === 'customer') {
      const parcels = await this.parcelRepository.find({
        where: { companyId, customerId: currentUser.userId },
        relations: ['originWarehouse', 'destinationWarehouse', 'customer'],
        order: { createdAt: 'DESC' }
      });
      return Promise.all(parcels.map(parcel => this.formatParcelWithSecureUrls(parcel)));
    }

    if (currentUser.role === 'warehouse_staff') {
      if (!currentUser.warehouseId) {
        throw new ForbiddenException('You are not assigned to any warehouse.');
      }
      const parcels = await this.parcelRepository.find({
        where: [
          { companyId, originWarehouseId: currentUser.warehouseId },
          { companyId, destinationWarehouseId: currentUser.warehouseId },
        ],
        relations: ['originWarehouse', 'destinationWarehouse', 'customer'],
        order: { createdAt: 'DESC' }
      });
      return Promise.all(parcels.map(parcel => this.formatParcelWithSecureUrls(parcel)));
    }

    const parcels = await this.parcelRepository.find({
      where: { companyId },
      relations: ['originWarehouse', 'destinationWarehouse', 'customer'],
      order: { createdAt: 'DESC' }
    });
    return Promise.all(parcels.map(parcel => this.formatParcelWithSecureUrls(parcel)));
  }

  async findOne(id: string, companyId: string, currentUser: any) {
    let whereClause: any = { id, companyId };

    if (currentUser.role === 'customer') {
      whereClause = { id, companyId, customerId: currentUser.userId };
    }

    let parcel: Parcel | null;

    if (currentUser.role === 'warehouse_staff') {
      if (!currentUser.warehouseId) {
        throw new ForbiddenException('You are not assigned to any warehouse.');
      }
      parcel = await this.parcelRepository.findOne({
        where: [
          { id, companyId, originWarehouseId: currentUser.warehouseId },
          { id, companyId, destinationWarehouseId: currentUser.warehouseId },
        ],
        relations: ['originWarehouse', 'destinationWarehouse', 'customer'],
      });
    } else {
      parcel = await this.parcelRepository.findOne({
        where: whereClause,
        relations: ['originWarehouse', 'destinationWarehouse', 'customer'],
      });
    }

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

      const requiredRole = TRANSITION_OWNER[originalStatus]?.[updateDto.status] ?? null;
      this.assertWarehouseAuthority(parcel, currentUser, requiredRole);

      parcel.status = updateDto.status as ParcelStatus;
    }

    const isEditingIntakeFields =
      updateDto.weight !== undefined || updateDto.dimensions !== undefined || updateDto.shippingCost !== undefined;

    if (isEditingIntakeFields) {
      this.assertWarehouseAuthority(parcel, currentUser, 'origin');
    }

    if (updateDto.customerTrackingId !== undefined) {
      parcel.customerTrackingId = updateDto.customerTrackingId;
    }
    if (updateDto.weight !== undefined) parcel.weight = updateDto.weight;
    if (updateDto.description !== undefined) parcel.description = updateDto.description;
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

    this.assertWarehouseAuthority(parcel, currentUser, 'origin');

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