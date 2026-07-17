import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parcel, ParcelStatus } from '../../models/parcel.model';
import { ParcelStatusHistory } from '../../models/parcel-status-history.model';
import { CreateParcelDto } from '../../utils/dto/create-parcel.dto';
import { UpdateParcelStatusDto } from '../../utils/dto/update-parcel-status.dto';

@Injectable()
export class ParcelService {
  constructor(
    @InjectRepository(Parcel)
    private parcelRepository: Repository<Parcel>,
    @InjectRepository(ParcelStatusHistory)
    private historyRepository: Repository<ParcelStatusHistory>,
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

    if (updateDto.status === ParcelStatus.CONFIRMED_BY_CUSTOMER) {
      throw new ForbiddenException('Manual confirmation by staff is not allowed. Only customers can confirm this stage.');
    }

    const allowedNextStatuses = {
      [ParcelStatus.PENDING]: [ParcelStatus.RECEIVED_AT_ORIGIN, ParcelStatus.RETURNED],
      [ParcelStatus.RECEIVED_AT_ORIGIN]: [ParcelStatus.SCANNED, ParcelStatus.RETURNED],
      [ParcelStatus.SCANNED]: [ParcelStatus.AWAITING_CONFIRMATION, ParcelStatus.RETURNED],
      [ParcelStatus.AWAITING_CONFIRMATION]: [ParcelStatus.RETURNED], 
      [ParcelStatus.CONFIRMED_BY_CUSTOMER]: [ParcelStatus.SHIPPED, ParcelStatus.RETURNED],
      [ParcelStatus.SHIPPED]: [ParcelStatus.RECEIVED_AT_DESTINATION, ParcelStatus.RETURNED],
      [ParcelStatus.RECEIVED_AT_DESTINATION]: [ParcelStatus.AVAILABLE_FOR_PICKUP, ParcelStatus.RETURNED],
      [ParcelStatus.AVAILABLE_FOR_PICKUP]: [ParcelStatus.PAID, ParcelStatus.RETURNED],
      [ParcelStatus.PAID]: [ParcelStatus.COMPLETED],
      [ParcelStatus.COMPLETED]: [], 
      [ParcelStatus.RETURNED]: [ParcelStatus.PENDING]
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
  // 4. NEW METHOD: For Customer Confirmation Endpoint
  async confirmShipment(id: string, companyId: string, currentUser: any) {
    const parcel = await this.findOne(id, companyId, currentUser);

    if (parcel.status !== ParcelStatus.AWAITING_CONFIRMATION) {
      throw new BadRequestException('Parcel cannot be confirmed at this stage.');
    }

    parcel.status = ParcelStatus.CONFIRMED_BY_CUSTOMER;
    await this.parcelRepository.save(parcel);

    await this.historyRepository.save(
      this.historyRepository.create({
        parcelId: parcel.id,
        status: ParcelStatus.CONFIRMED_BY_CUSTOMER,
        changedById: currentUser.userId,
        changedByType: 'customer',
      })
    );

    return parcel;
  }

  async remove(id: string, companyId: string, currentUser: any) {
    const parcel = await this.findOne(id, companyId, currentUser);
    return this.parcelRepository.remove(parcel);
  }
}