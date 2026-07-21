import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('pricing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PricingController {
  constructor(private pricingService: PricingService) {}

  @Get()
  @Roles('company_admin')
  getPricing(@CurrentUser() user: any) {
    return this.pricingService.getPricing(user.companyId);
  }

  @Put()
  @Roles('company_admin')
  updatePricing(@CurrentUser() user: any, @Body() body: { baseRate: number; perKgRate: number }) {
    return this.pricingService.updatePricing(user.companyId, body.baseRate, body.perKgRate);
  }
}