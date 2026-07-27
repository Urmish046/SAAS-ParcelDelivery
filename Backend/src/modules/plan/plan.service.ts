import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from '../../models/plan.model';
import { CreatePlanDto } from '../../utils/dto/create-plan.dto';
@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private planRepo: Repository<Plan>,
  ) {}

  async findAll() {
    return await this.planRepo.find();
  }

  async findOne(id: string) {
    const plan = await this.planRepo.findOneBy({ id });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  async create(dto: CreatePlanDto) {
    const plan = this.planRepo.create(dto);
    return await this.planRepo.save(plan);
  }

  async remove(id: string) {
    await this.findOne(id); 
    await this.planRepo.delete(id);
    return { message: 'Plan deleted successfully' };
  }
}