import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('pricing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PricingController {
  constructor(private pricingService: PricingService) {}

  @Get('tiers')
  @Roles('company_admin')
  getTiers(@CurrentUser() user: any) {
    return this.pricingService.getTiers(user.companyId);
  }

  @Post('tiers')
  @Roles('company_admin')
  addTier(
    @CurrentUser() user: any, 
    @Body() body: { minWeight: number; maxWeight: number | null; pricePerKg: number }
  ) {
    return this.pricingService.createTier(
      user.companyId, 
      body.minWeight, 
      body.maxWeight, 
      body.pricePerKg
    );
  }
}