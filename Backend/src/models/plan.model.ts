import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Company } from './company.model';

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string; 

  @Column('decimal')
  price!: number;

  @Column({ default: 'monthly' })
  billingCycle!: 'monthly' | 'yearly';

  @OneToMany(() => Company, (company) => company.plan)
  companies!: Company[];
}