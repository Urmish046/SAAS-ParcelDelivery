import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

    if (updateDto.status === ParcelStatus.SHIPPED && !updateDto.customerTrackingId) {
      throw new BadRequestException('Customer tracking ID must be provided when shipping.');
    }

    parcel.status = updateDto.status;
    
    if (updateDto.customerTrackingId) {
      parcel.customerTrackingId = updateDto.customerTrackingId;
    }

    await this.parcelRepository.save(parcel);

    await this.historyRepository.save(
      this.historyRepository.create({
        parcelId: parcel.id,
        status: updateDto.status,
        changedById: currentUser.userId,
        changedByType: currentUser.role === 'customer' ? 'customer' : 'user',
      })
    );

    return parcel;
  }

  async remove(id: string, companyId: string, currentUser: any) {
    const parcel = await this.findOne(id, companyId, currentUser);
    return this.parcelRepository.remove(parcel);
  }
}