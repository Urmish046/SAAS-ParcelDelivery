import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ParcelService } from './parcel.service';
import { CreateParcelDto } from '../../utils/dto/create-parcel.dto';
import { UpdateParcelStatusDto } from '../../utils/dto/update-parcel-status.dto';
import { Roles } from '../../decorators/roles.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';

@Controller('parcels')
export class ParcelController {
  constructor(private readonly parcelService: ParcelService) {}

  @Post()
  @Roles('company_admin', 'warehouse_staff', 'customer')
  create(@Body() createParcelDto: CreateParcelDto, @CurrentUser() user: any) {
    return this.parcelService.create(createParcelDto, user.companyId, user);
  }

  @Get()
  @Roles('company_admin', 'warehouse_staff', 'customer')
  findAll(@CurrentUser() user: any) {
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

  @Delete(':id')
  @Roles('company_admin')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.parcelService.remove(id, user.companyId, user);
  }
}