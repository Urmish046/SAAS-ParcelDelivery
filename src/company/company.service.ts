import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './models/company.model';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async create(createCompanyDto: any) {
    const newCompany = this.companyRepository.create({
      name: createCompanyDto.name,
      subdomain: createCompanyDto.subdomain,
      status: 'ACTIVE',
    });
    return await this.companyRepository.save(newCompany);
  }

  async findAll(user: any) {
    if (user.role === 'super_admin') {
      return await this.companyRepository.find();
    }
    return await this.companyRepository.find({
      where: { id: user.companyId },
    });
  }

  async findOne(id: string, user: any) {
    const company = await this.companyRepository.findOneBy({ id });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found in database!`);
    }
    
    if (user.role !== 'super_admin' && company.id !== user.companyId) {
      throw new ForbiddenException('Access denied. You can only view your own company data.');
    }
    
    return company;
  }

  async update(id: string, updateCompanyDto: any) {
    const company = await this.companyRepository.findOneBy({ id });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found in database!`);
    }
    await this.companyRepository.update(id, updateCompanyDto); 
    return this.companyRepository.findOneBy({ id }); 
  }

  async remove(id: string) {
    const company = await this.companyRepository.findOneBy({ id });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found in database!`);
    }
    await this.companyRepository.delete(id); 
    return { message: `Company with ID ${id} has been permanently deleted.` };
  }
}