import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { Company } from '../../models/company.model';
import { Plan } from '../../models/plan.model';

@Module({
  imports: [TypeOrmModule.forFeature([Company, Plan])],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule {}