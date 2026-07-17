import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { ParcelStatus } from '../../models/parcel.model';

export class UpdateParcelStatusDto {
  @IsEnum(ParcelStatus)
  status!: ParcelStatus;

  @IsOptional()
  @IsString()
  customerTrackingId?: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsString()
  dimensions?: string;

  @IsOptional()
  @IsNumber()
  shippingCost?: number;
}