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

    const activeCompanies = await this.companyRepository.find({
      where: { subscriptionStatus: 'active' },
      relations: ['plan'],
    });

    const monthlyRecurringRevenue = activeCompanies.reduce((sum, company) => {
      if (!company.plan) return sum;

      const price = Number(company.plan.price); 
      const monthlyEquivalent =
        company.plan.billingCycle === 'yearly' ? price / 12 : price;

      return sum + monthlyEquivalent;
    }, 0);

    return {
      totalCompanies,
      activeUsers,
      totalRevenue: Math.round(monthlyRecurringRevenue * 100) / 100,
      activeSubscriptions: activeCompanies.length,
    };
  }
}