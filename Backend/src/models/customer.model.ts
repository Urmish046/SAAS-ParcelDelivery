import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Company } from './company.model';
import { Warehouse } from './warehouse.model';

@Entity('customers')
@Unique(['companyId', 'email'])
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column()
  password!: string;

  @Column()
  phone!: string;

  @Column({ type: 'text', nullable: true })
  address!: string;

  @Column()
  companyId!: string;

  @Column({ nullable: true }) 
  destinationWarehouseId!: string;

  @ManyToOne(() => Warehouse, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'destinationWarehouseId' })
  destinationWarehouse!: Warehouse;

  @ManyToOne(() => Company, (company) => company.customers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}