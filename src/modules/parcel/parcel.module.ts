import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParcelService } from './parcel.service';
import { ParcelController } from './parcel.controller';
import { Parcel } from '../../models/parcel.model';
import { ParcelStatusHistory } from '../../models/parcel-status-history.model';

@Module({
  imports: [TypeOrmModule.forFeature([Parcel, ParcelStatusHistory])],
  controllers: [ParcelController],
  providers: [ParcelService],
  exports: [ParcelService],
})
export class ParcelModule {}