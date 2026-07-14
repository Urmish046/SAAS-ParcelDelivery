import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from '../../utils/dto/create-warehouse.dto';
import { UpdateWarehouseDto } from '../../utils/dto/update-warehouse.dto';
import { Roles } from '../../decorators/roles.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';

@Controller('warehouses')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  @Roles('company_admin')
  create(@Body() createWarehouseDto: CreateWarehouseDto, @CurrentUser() user: any) {
    return this.warehouseService.create(createWarehouseDto, user.companyId);
  }

  @Get()
  @Roles('company_admin', 'warehouse_staff')
  findAll(@CurrentUser() user: any) {
    return this.warehouseService.findAll(user.companyId);
  }

  @Get(':id')
  @Roles('company_admin', 'warehouse_staff')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.warehouseService.findOne(id, user.companyId);
  }

  @Patch(':id')
  @Roles('company_admin')
  update(
    @Param('id') id: string,
    @Body() updateWarehouseDto: UpdateWarehouseDto,
    @CurrentUser() user: any
  ) {
    return this.warehouseService.update(id, updateWarehouseDto, user.companyId);
  }

  @Delete(':id')
  @Roles('company_admin')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.warehouseService.remove(id, user.companyId);
  }
}