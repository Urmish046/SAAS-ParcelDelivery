import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm'; 
import { Company } from '../../models/company.model';
import { User, UserRole } from '../../models/user.model'; 
import * as bcrypt from 'bcrypt';
import { CreateCompanyDto } from 'src/utils/dto/create-company.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    private dataSource: DataSource,
  ) {}

  async create(createCompanyDto: CreateCompanyDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newCompany = queryRunner.manager.create(Company, {
        name: createCompanyDto.name,
        subdomain: createCompanyDto.subdomain,
        country: createCompanyDto.country,
        status: 'ACTIVE',
      });
      const savedCompany = await queryRunner.manager.save(newCompany);

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(createCompanyDto.password, saltRounds);

      const newAdmin = queryRunner.manager.create(User, {
        email: createCompanyDto.adminEmail,
        password: hashedPassword,
        role: UserRole.COMPANY_ADMIN,
        companyId: savedCompany.id,
      });
      const savedAdmin = await queryRunner.manager.save(newAdmin);

      await queryRunner.commitTransaction();

      return {
        ...savedCompany,
        adminEmail: savedAdmin.email,
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(user: any) {
    let companies;
    
    if (user.role === 'super_admin') {
      companies = await this.companyRepository.find();
    } else {
      companies = await this.companyRepository.find({
        where: { id: user.companyId },
      });
    }

    if (companies.length === 0) return [];

    const companyIds = companies.map(c => c.id);
    const admins = await this.dataSource.getRepository(User).find({
      where: {
        companyId: In(companyIds),
        role: UserRole.COMPANY_ADMIN,
      },
    });

    return companies.map(company => {
      const adminForCompany = admins.find(a => a.companyId === company.id);
      return {
        ...company,
        adminEmail: adminForCompany ? adminForCompany.email : 'N/A',
      };
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

    const { adminEmail, ...companyFields } = updateCompanyDto;

    if (Object.keys(companyFields).length > 0) {
      await this.companyRepository.update(id, companyFields);
    }

    if (adminEmail) {
      const userRepo = this.dataSource.getRepository(User);
      const adminUser = await userRepo.findOne({
        where: { companyId: id, role: UserRole.COMPANY_ADMIN },
      });

      if (adminUser) {
        await userRepo.update(adminUser.id, { email: adminEmail });
      }
    }

    const updatedCompany = await this.companyRepository.findOneBy({ id });

    const adminForCompany = await this.dataSource.getRepository(User).findOne({
      where: { companyId: id, role: UserRole.COMPANY_ADMIN },
    });

    return {
      ...updatedCompany,
      adminEmail: adminForCompany ? adminForCompany.email : 'N/A',
    };
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