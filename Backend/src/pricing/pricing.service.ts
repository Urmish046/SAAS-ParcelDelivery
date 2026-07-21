import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pricing } from '../models/pricing.model';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(Pricing)
    private pricingRepo: Repository<Pricing>,
  ) {}

  async getPricing(companyId: string) {
    let pricing = await this.pricingRepo.findOne({ where: { companyId } });
    if (!pricing) {
      pricing = this.pricingRepo.create({ companyId, baseRate: 0, perKgRate: 0 });
      await this.pricingRepo.save(pricing);
    }
    return pricing;
  }

  async updatePricing(companyId: string, baseRate: number, perKgRate: number) {
    const pricing = await this.getPricing(companyId);
    pricing.baseRate = baseRate;
    pricing.perKgRate = perKgRate;
    return this.pricingRepo.save(pricing);
  }
}