import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParcelService } from './parcel.service';
import { CreateParcelDto } from '../../utils/dto/create-parcel.dto';
import { UpdateParcelStatusDto } from '../../utils/dto/update-parcel-status.dto';
import { Roles } from '../../decorators/roles.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';

@Controller('parcels')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ParcelController {
  constructor(private readonly parcelService: ParcelService) {}

  // Only Staff/Admins can create a physical parcel now
  @Post()
  @Roles('company_admin', 'warehouse_staff')
  create(@Body() createParcelDto: CreateParcelDto, @CurrentUser() user: any) {
    return this.parcelService.create(createParcelDto, user.companyId, user);
  }

  @Post('claim')
  @Roles('customer')
  claimParcel(@Body('internalTrackingId') internalTrackingId: string, @CurrentUser() user: any) {
    
    // Safety check: Agar ID khali aati hai toh yahin se error throw kar dein
    if (!internalTrackingId) {
      throw new BadRequestException('Please provide a valid tracking ID.');
    }

    return this.parcelService.claimParcel(internalTrackingId, user.companyId, user);
  }

  @Post(':id/upload-payment')
  @Roles('customer')
  @UseInterceptors(FileInterceptor('receipt'))
  async uploadPayment(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    if (!file) throw new BadRequestException('No receipt provided');
    return this.parcelService.uploadPaymentReceipt(id, file, user.companyId, user);
  }

  @Get('customer/stats')
  @Roles('customer')
  getCustomerStats(@CurrentUser() user: any) {
    return this.parcelService.getCustomerStats(user.companyId, user.userId);
  }

  @Get()
  @Roles('company_admin', 'warehouse_staff', 'customer')
  findAll(@CurrentUser() user: any) {
    return this.parcelService.findAll(user.companyId, user);
  }

  @Get('my-parcels')
  @Roles('customer')
  findMyParcels(@CurrentUser() user: any) {
    return this.parcelService.findAll(user.companyId, user);
  }

  @Get(':id')
  @Roles('company_admin', 'warehouse_staff', 'customer')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.parcelService.findOne(id, user.companyId, user);
  }

  // Staff Update Status
  @Patch(':id/status')
  @Roles('company_admin', 'warehouse_staff')
  updateStatus(
    @Param('id') id: string,
    @Body() updateParcelStatusDto: UpdateParcelStatusDto,
    @CurrentUser() user: any
  ) {
    return this.parcelService.updateStatus(id, updateParcelStatusDto, user.companyId, user);
  }

  // Customer Confirm Shipment
  @Patch(':id/confirm')
  @Roles('customer')
  confirmShipment(@Param('id') id: string, @CurrentUser() user: any) {
    return this.parcelService.confirmShipment(id, user.companyId, user);
  }

  @Post(':id/upload-image')
  @Roles('company_admin', 'warehouse_staff')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return callback(new BadRequestException('Invalid file type'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadParcelImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    if (!file) throw new BadRequestException('No image provided');
    const fileName = await this.parcelService.uploadImage(id, file, user.companyId, user);
    return { fileName };
  }

  @Delete(':id')
  @Roles('company_admin')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.parcelService.remove(id, user.companyId, user);
  }
}