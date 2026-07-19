import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { Company } from '../models/company.model';
import { User } from '../models/user.model';

@Module({
  imports: [TypeOrmModule.forFeature([Company, User])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}