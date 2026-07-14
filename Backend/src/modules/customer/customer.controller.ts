import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateCustomerDto } from '../../utils/dto/create-customer.dto';
import { UpdateCustomerDto } from '../../utils/dto/update-customer.dto';
import { Roles } from '../../decorators/roles.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { CustomerService } from './customer.service';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @Roles('company_admin', 'warehouse_staff')
  create(@Body() createCustomerDto: CreateCustomerDto, @CurrentUser() user: any) {
    return this.customerService.create(createCustomerDto, user.companyId);
  }

  @Get()
  @Roles('company_admin', 'warehouse_staff')
  findAll(@CurrentUser() user: any) {
    return this.customerService.findAll(user.companyId);
  }

  @Get(':id')
  @Roles('company_admin', 'warehouse_staff')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.customerService.findOne(id, user.companyId);
  }

  @Patch(':id')
  @Roles('company_admin', 'warehouse_staff')
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @CurrentUser() user: any
  ) {
    return this.customerService.update(id, updateCustomerDto, user.companyId);
  }

  @Delete(':id')
  @Roles('company_admin')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.customerService.remove(id, user.companyId);
  }
}