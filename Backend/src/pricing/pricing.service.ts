import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PricingTier } from '../models/pricing-tier.model'; 
@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(PricingTier)
    private pricingTierRepo: Repository<PricingTier>,
  ) {}

  async getTiers(companyId: string) {
    return this.pricingTierRepo.find({
      where: { companyId },
      order: { minWeight: 'ASC' }
    });
  }

  async createTier(companyId: string, minWeight: number, maxWeight: number | null, pricePerKg: number) {
    const tier = this.pricingTierRepo.create({ companyId, minWeight, maxWeight, pricePerKg });
    return this.pricingTierRepo.save(tier);
  }

  async calculateCost(companyId: string, weight: number): Promise<number> {
    const w = Number(weight);
    if (isNaN(w) || w <= 0) return 0;

    const tiers = await this.getTiers(companyId);

    if (!tiers || tiers.length === 0) {
      return w * 10;
    }

    const matchingTier = tiers.find(t => 
      w >= Number(t.minWeight) && 
      (t.maxWeight === null || w <= Number(t.maxWeight))
    );

    if (matchingTier) {
      return w * Number(matchingTier.pricePerKg);
    }

    const highestTier = tiers[tiers.length - 1];
    return w * Number(highestTier.pricePerKg);
  }
}