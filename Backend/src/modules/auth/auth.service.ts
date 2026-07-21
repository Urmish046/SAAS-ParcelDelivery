import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Customer } from '../../models/customer.model';
import { CreateCustomerDto } from '../../utils/dto/create-customer.dto';
import { Company } from '../../models/company.model';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user || user.role === 'super_admin') {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordMatching = await bcrypt.compare(pass, user.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid email or password');
    }
          
    let subdomain;

    if(user.companyId){
      const company = await this.companyRepository.findOne({ where: { id: user.companyId } });
      if (!company) {
        throw new UnauthorizedException('Company not found for this user');
      }
      subdomain = company.subdomain;
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      warehouseId: user.warehouseId,
    };

    return {
      message: 'Login successful!',
      access_token: this.jwtService.sign(payload),
      subdomain: subdomain,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        warehouseId: user.warehouseId,
      }
    };
  }

  async superAdminLogin(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user || user.role !== 'super_admin') {
      throw new UnauthorizedException('Access denied');
    }

    const isPasswordMatching = await bcrypt.compare(pass, user.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      message: 'Super Admin login successful!',
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      }
    };
  }

async customerLogin(email: string, pass: string) {
    // Sirf email se search kar rahe hain
    const customer = await this.customerRepository.findOne({
      where: { email },
    });

    if (!customer) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordMatching = await bcrypt.compare(pass, customer.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: customer.id,
      email: customer.email,
      role: 'customer',
      companyId: customer.companyId,
    };

    return {
      message: 'Customer login successful!',
      access_token: this.jwtService.sign(payload),
      user: {
        id: customer.id,
        email: customer.email,
        role: 'customer',
        companyId: customer.companyId,
      }
    };
  }

  async customerRegister(createCustomerDto: CreateCustomerDto, companyId: string) {
    const existingCustomer = await this.customerRepository.findOne({
      where: { email: createCustomerDto.email, companyId },
    });

    if (existingCustomer) {
      throw new ConflictException('Email already registered for this company.');
    }

    const hashedPassword = await bcrypt.hash(createCustomerDto.password, 10);

    const customer = this.customerRepository.create({
      ...createCustomerDto,
      password: hashedPassword,
      companyId,
    });

    const savedCustomer = await this.customerRepository.save(customer);

    const payload = {
      sub: savedCustomer.id,
      email: savedCustomer.email,
      role: 'customer',
      companyId: savedCustomer.companyId,
    };

    return {
      message: 'Customer registration successful!',
      access_token: this.jwtService.sign(payload),
      user: {
        id: savedCustomer.id,
        email: savedCustomer.email,
        role: 'customer',
        companyId: savedCustomer.companyId,
      }
    };
  }
}