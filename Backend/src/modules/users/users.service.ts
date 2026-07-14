import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../models/user.model';
import { CreateUserDto } from '../../utils/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto, currentUser: any) {
    if (currentUser.role === 'company_admin' && ['super_admin', 'company_admin'].includes(createUserDto.role)) {
      throw new ForbiddenException('You cannot create an admin account.');
    }

    const existingUser = await this.userRepository.findOne({ where: { email: createUserDto.email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists!');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const resolvedCompanyId = currentUser.role === 'super_admin' ? createUserDto.companyId : currentUser.companyId;

    if (createUserDto.role === 'warehouse_staff' && !createUserDto.warehouseId) {
      throw new ConflictException('Warehouse ID is required when creating warehouse staff.');
    }

    const newUser = this.userRepository.create({
      email: createUserDto.email,
      password: hashedPassword,
      role: createUserDto.role,
      companyId: resolvedCompanyId,
      warehouseId: createUserDto.role === 'warehouse_staff' ? createUserDto.warehouseId : undefined,
    });

    const savedUser = await this.userRepository.save(newUser);
    const { password, ...result } = savedUser as any;
    return result;
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['company', 'warehouse'],
    });
  }

  async findAll(user: any) {
    if (user.role === 'super_admin') {
      return await this.userRepository.find({ relations: ['company', 'warehouse'] });
    }

    return await this.userRepository.find({
      where: { companyId: user.companyId },
      relations: ['company', 'warehouse'],
    });
  }

  async findOne(id: string, currentUser: any) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['company', 'warehouse'],
    });

    if (!user) {
      throw new NotFoundException(`User not found!`);
    }

    if (currentUser.role !== 'super_admin' && user.companyId !== currentUser.companyId) {
      throw new ForbiddenException('Access denied. You can only view users from your own company.');
    }

    return user;
  }

  async remove(id: string, currentUser: any) {
    const user = await this.findOne(id, currentUser);
    await this.userRepository.delete(id);
    return { message: `User deleted successfully.` };
  }
}