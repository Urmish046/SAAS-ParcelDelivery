import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricingService } from './pricing.service';
import { PricingController } from './pricing.controller';
import { PricingTier } from '../models/pricing-tier.model'; 

@Module({
  imports: [TypeOrmModule.forFeature([PricingTier])], 
  providers: [PricingService],
  controllers: [PricingController],
  exports: [PricingService], 
})
export class PricingModule {}