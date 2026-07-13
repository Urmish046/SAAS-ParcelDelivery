import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Company } from './company.model';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  COMPANY_ADMIN = 'company_admin',
  CHINA_STAFF = 'china_staff',
  NIGERIA_STAFF = 'nigeria_staff',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string; 

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CHINA_STAFF })
  role!: UserRole;
  @Column({ nullable: true })
  companyId!: string;

  @ManyToOne(() => Company, (company) => company.id, { nullable: true, onDelete: 'CASCADE' })
  company!: Company;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}