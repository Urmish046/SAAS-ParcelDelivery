import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Customer } from '../../models/customer.model';
import { CreateCustomerDto } from '../../utils/dto/create-customer.dto';
import { UpdateCustomerDto } from '../../utils/dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto, companyId: string) {
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
    const { password, ...result } = savedCustomer;
    return result;
  }

  async findAll(companyId: string) {
    const customers = await this.customerRepository.find({ where: { companyId } });
    return customers.map(customer => {
      const { password, ...result } = customer;
      return result;
    });
  }

  async findOne(id: string, companyId: string) {
    const customer = await this.customerRepository.findOne({ where: { id, companyId } });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    const { password, ...result } = customer;
    return result;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto, companyId: string) {
    const customer = await this.customerRepository.findOne({ where: { id, companyId } });
    
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    
    if (updateCustomerDto.password) {
      updateCustomerDto.password = await bcrypt.hash(updateCustomerDto.password, 10);
    }

    await this.customerRepository.update(customer.id, updateCustomerDto);
    return this.findOne(id, companyId);
  }

  async remove(id: string, companyId: string) {
    const customer = await this.customerRepository.findOne({ where: { id, companyId } });
    
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    
    await this.customerRepository.remove(customer);
    const { password, ...result } = customer;
    return result;
  }
}