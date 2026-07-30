import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from './company.model';

@Entity('pricing_tiers')
export class PricingTier {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  companyId!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  minWeight!: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  maxWeight!: number | null; 

  @Column('decimal', { precision: 10, scale: 2 })
  pricePerKg!: number;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company!: Company;
}