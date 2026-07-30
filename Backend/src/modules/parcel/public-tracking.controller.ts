import { Controller, Get, Param, SetMetadata } from '@nestjs/common';
import { ParcelService } from './parcel.service';

@Controller('public/tracking')
export class PublicTrackingController {
  constructor(private readonly parcelService: ParcelService) {}

  @SetMetadata('isPublic', true)
  @Get(':id')
  async track(@Param('id') id: string) {
    const parcel = await this.parcelService.findByAnyTrackingIdPublic(id);

    if (!parcel) {
      return { found: false };
    }

    const hasPrice = parcel.shippingCost !== null && parcel.shippingCost !== undefined && Number(parcel.shippingCost) > 0;
    const formattedPrice = hasPrice ? `${parcel.shippingCost}` : 'Pending';

    return {
      found: true,
      status: parcel.status,
      originWarehouseName: parcel.originWarehouse?.name || null,
      destinationWarehouseName: parcel.destinationWarehouse?.name || null,
      description: parcel.description || null,
      
      price: formattedPrice,
      shippingCost: parcel.shippingCost ? Number(parcel.shippingCost) : null,
      amount: formattedPrice
    };
  }
}