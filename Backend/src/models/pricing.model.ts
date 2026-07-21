import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from './company.model';
@Entity('pricing')
export class Pricing {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  companyId!: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  baseRate!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  perKgRate!: number;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company!: Company;
}