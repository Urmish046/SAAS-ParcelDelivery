import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Roles('super_admin')
  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.create(createCompanyDto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.companyService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.companyService.findOne(id, user);
  }

  @Roles('super_admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompanyDto: any) {
    return this.companyService.update(id, updateCompanyDto); 
  }

  @Roles('super_admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companyService.remove(id); 
  }
}