import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Customer } from './customer.model';
import { Company } from './company.model';
import { Warehouse } from './warehouse.model';

export enum TrackingRequestStatus {
  PENDING = 'PENDING',
  MATCHED = 'MATCHED',
}

@Entity('tracking_requests')
export class TrackingRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Customer jo tracking ID enter karega
  @Column()
  trackingNumber!: string;

  // Jab staff scan kar lega toh yeh MATCHED ho jayega
  @Column({ type: 'enum', enum: TrackingRequestStatus, default: TrackingRequestStatus.PENDING })
  status!: TrackingRequestStatus;

  @Column()
  customerId!: string;

  @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customerId' })
  customer!: Customer;

  @Column({ nullable: true })
  destinationWarehouseId!: string;

  @ManyToOne(() => Warehouse, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'destinationWarehouseId' })
  destinationWarehouse!: Warehouse;

  @Column()
  companyId!: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}