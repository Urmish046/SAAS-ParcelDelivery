import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParcelService } from './parcel.service';
import { ParcelController } from './parcel.controller';
import { Parcel } from '../../models/parcel.model';
import { ParcelStatusHistory } from '../../models/parcel-status-history.model';
import { EmailModule } from '../../email/email.module';
import { PricingModule } from '../../pricing/pricing.module';
import { TrackingRequest } from '../../models/tracking-request.model';
import { Customer } from '../../models/customer.model';
import { PublicTrackingController } from './public-tracking.controller';
@Module({
  imports: [
    TypeOrmModule.forFeature([Parcel, ParcelStatusHistory, TrackingRequest, Customer]),
    EmailModule,
    PricingModule
  ],
  controllers: [ParcelController, PublicTrackingController],
  providers: [ParcelService],
  exports: [ParcelService],
})
export class ParcelModule {}