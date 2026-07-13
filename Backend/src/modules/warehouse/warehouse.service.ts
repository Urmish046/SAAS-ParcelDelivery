import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from '../../models/warehouse.model';
import { CreateWarehouseDto } from '../../utils/dto/create-warehouse.dto';
import { UpdateWarehouseDto } from '../../utils/dto/update-warehouse.dto';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
  ) {}

  async create(createWarehouseDto: CreateWarehouseDto, companyId: string) {
    const warehouse = this.warehouseRepository.create({
      ...createWarehouseDto,
      companyId,
    });
    return this.warehouseRepository.save(warehouse);
  }

  async findAll(companyId: string) {
    return this.warehouseRepository.find({ where: { companyId } });
  }

  async findOne(id: string, companyId: string) {
  const warehouse = await this.warehouseRepository.findOne({ where: { id, companyId } });
  if (!warehouse) {
    throw new NotFoundException('Warehouse not found.');
  }
  return warehouse;
}

  async update(id: string, updateWarehouseDto: UpdateWarehouseDto, companyId: string) {
    const warehouse = await this.findOne(id, companyId);
    await this.warehouseRepository.update(warehouse.id, updateWarehouseDto);
    return this.findOne(id, companyId);
  }

  async remove(id: string, companyId: string) {
    const warehouse = await this.findOne(id, companyId);
    return this.warehouseRepository.remove(warehouse);
  }
}