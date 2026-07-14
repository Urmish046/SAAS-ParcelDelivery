import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Customer } from 'src/models/customer.model';
import { CreateCustomerDto } from 'src/utils/dto/create-customer.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordMatching = await bcrypt.compare(pass, user.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid email or password');
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
    };
  }

  async customerLogin(email: string, pass: string, companyId: string) {
    const customer = await this.customerRepository.findOne({
      where: { email, companyId },
    });

    if (!customer) {
      throw new UnauthorizedException('Invalid email or company context');
    }

    const isPasswordMatching = await bcrypt.compare(pass, customer.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid email or password');
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
    };
  }
}