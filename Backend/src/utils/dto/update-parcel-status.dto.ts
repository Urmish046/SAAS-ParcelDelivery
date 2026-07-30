import { IsEnum, IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { ParcelStatus } from '../../models/parcel.model';

export class UpdateParcelStatusDto {
  @IsEnum(ParcelStatus)
  status!: ParcelStatus;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  
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
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  shippingCost?: number;
}