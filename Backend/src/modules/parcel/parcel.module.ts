import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParcelService } from './parcel.service';
import { ParcelController } from './parcel.controller';
import { Parcel } from '../../models/parcel.model';
import { ParcelStatusHistory } from '../../models/parcel-status-history.model';
import { StorageModule } from '../../storage/storage.module';
import { EmailModule } from '../../email/email.module';
import { PricingModule } from '../../pricing/pricing.module';
import { TrackingRequest } from '../../models/tracking-request.model';
import { Customer } from '../../models/customer.model';
@Module({
  imports: [
    TypeOrmModule.forFeature([Parcel, ParcelStatusHistory, TrackingRequest, Customer]),
    StorageModule,
    EmailModule,
    PricingModule
  ],
  controllers: [ParcelController],
  providers: [ParcelService],
  exports: [ParcelService],
})
export class ParcelModule {}