import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, UseGuards, Injectable, ExecutionContext } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ParcelService } from './parcel.service';
import { UpdateParcelStatusDto } from '../../utils/dto/update-parcel-status.dto';
import { Roles } from '../../decorators/roles.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';

@Controller('parcels')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ParcelController {
  constructor(private readonly parcelService: ParcelService) {}

  @Post('scan')
  @Roles('warehouse_staff', 'company_admin')
  async scanBarcode(
    @Body('trackingNumber') trackingNumber: string,
    @Body('customerId') customerId: string,
    @CurrentUser() user: any
  ) {
    if (!trackingNumber) {
      throw new BadRequestException('Tracking number is required for scanning.');
    }
    if (!customerId) {
      throw new BadRequestException('Customer selection is required for new parcels.');
    }
    return this.parcelService.scanAndReceiveParcel(trackingNumber, customerId, user.companyId, user);
  }

  @Post(':id/upload-payment')
  @Roles('customer')
  @UseInterceptors(
    FileInterceptor('receipt', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadPayment(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    if (!file) throw new BadRequestException('No receipt provided');

    const fileUrl = `/uploads/${file.filename}`;
    return this.parcelService.uploadPaymentReceipt(id, fileUrl, user.companyId, user);
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

  @Patch(':id/status')
  @Roles('company_admin', 'warehouse_staff')
  updateStatus(
    @Param('id') id: string,
    @Body() updateParcelStatusDto: UpdateParcelStatusDto,
    @CurrentUser() user: any
  ) {
    return this.parcelService.updateStatus(id, updateParcelStatusDto, user.companyId, user);
  }

  @Patch(':id/confirm')
  @Roles('customer')
  confirmShipment(@Param('id') id: string, @CurrentUser() user: any) {
    return this.parcelService.confirmShipment(id, user.companyId, user);
  }

  @Post(':id/upload-image')
  @Roles('company_admin', 'warehouse_staff')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|pdf)$/)) {
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

    const fileUrl = `/uploads/${file.filename}`;
    await this.parcelService.uploadImage(id, fileUrl, user.companyId, user);

    return { fileName: fileUrl };
  }

  @Delete(':id')
  @Roles('company_admin')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.parcelService.remove(id, user.companyId, user);
  }
}