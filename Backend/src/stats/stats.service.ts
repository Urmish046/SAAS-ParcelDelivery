import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../models/company.model';
import { User } from '../models/user.model';


@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getDashboardStats() {
    const totalCompanies = await this.companyRepository.count();
    const activeUsers = await this.userRepository.count();
    const totalRevenue = 0;

    return {
      totalCompanies,
      activeUsers,
      totalRevenue,
    };
  }
}