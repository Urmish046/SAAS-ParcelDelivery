import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parcel, ParcelStatus } from '../../models/parcel.model';
import { ParcelStatusHistory } from '../../models/parcel-status-history.model';
import { CreateParcelDto } from '../../utils/dto/create-parcel.dto';
import { UpdateParcelStatusDto } from '../../utils/dto/update-parcel-status.dto';
import { STORAGE_SERVICE, type IStorageService } from '../../storage/storage.interface';

@Injectable()
export class ParcelService {
  constructor(
    @InjectRepository(Parcel)
    private parcelRepository: Repository<Parcel>,
    @InjectRepository(ParcelStatusHistory)
    private historyRepository: Repository<ParcelStatusHistory>,
    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
  ) {}

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

    const savedParcel = await this.parcelRepository.save(parcel);

    await this.historyRepository.save(
      this.historyRepository.create({
        parcelId: savedParcel.id,
        status: ParcelStatus.PENDING,
        changedById: currentUser.userId,
        changedByType: currentUser.role === 'customer' ? 'customer' : 'user',
      })
    );

    return savedParcel;
  }

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

    return this.parcelRepository.find({
      where: whereClause,
      relations: ['warehouse', 'customer'],
    });
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

  async updateStatus(id: string, updateDto: UpdateParcelStatusDto, companyId: string, currentUser: any) {
    const parcel = await this.findOne(id, companyId, currentUser);

    // Simplified logic for our 6 new statuses
    const allowedNextStatuses = {
      [ParcelStatus.PENDING]: [ParcelStatus.SCANNED, ParcelStatus.RETURNED],
      [ParcelStatus.SCANNED]: [ParcelStatus.SHIPPED, ParcelStatus.RETURNED],
      [ParcelStatus.SHIPPED]: [ParcelStatus.AVAILABLE_FOR_PICKUP, ParcelStatus.RETURNED],
      [ParcelStatus.AVAILABLE_FOR_PICKUP]: [ParcelStatus.COMPLETED, ParcelStatus.RETURNED],
      [ParcelStatus.COMPLETED]: [], 
      [ParcelStatus.RETURNED]: [ParcelStatus.PENDING] // Allowed to retry if returned
    };

    const validTransitions = allowedNextStatuses[parcel.status as string] || [];
    if (!validTransitions.includes(updateDto.status)) {
      throw new BadRequestException(`Invalid status transition from '${parcel.status}' to '${updateDto.status}'.`);
    }

    if (updateDto.status === ParcelStatus.SHIPPED && !updateDto.customerTrackingId) {
      throw new BadRequestException('Customer tracking ID must be provided when shipping.');
    }

    parcel.status = updateDto.status as ParcelStatus;

    if (updateDto.customerTrackingId) parcel.customerTrackingId = updateDto.customerTrackingId;
    if (updateDto.weight !== undefined) parcel.weight = updateDto.weight;
    if (updateDto.dimensions !== undefined) parcel.dimensions = updateDto.dimensions;
    if (updateDto.shippingCost !== undefined) parcel.shippingCost = updateDto.shippingCost;

    await this.parcelRepository.save(parcel);

    await this.historyRepository.save(
      this.historyRepository.create({
        parcelId: parcel.id,
        status: updateDto.status as ParcelStatus,
        changedById: currentUser.userId,
        changedByType: currentUser.role === 'customer' ? 'customer' : 'user',
      })
    );

    return parcel;
  }

  async uploadImage(id: string, file: Express.Multer.File, companyId: string, currentUser: any): Promise<string> {
    const parcel = await this.findOne(id, companyId, currentUser);
    
    const fileName = await this.storageService.uploadFile(file, `parcels/${companyId}`);

    try {
      const currentImages = parcel.imageUrls || [];
      parcel.imageUrls = [...currentImages, fileName];
      await this.parcelRepository.save(parcel);
      
      return fileName;
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