import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Company } from './company.model';
import { Warehouse } from './warehouse.model';
import { Customer } from './customer.model';

export enum ParcelStatus {
  PENDING = 'pending',
  RECEIVED_AT_ORIGIN = 'received_at_origin', 
  SCANNED = 'scanned',
  AWAITING_CONFIRMATION = 'awaiting_confirmation',
  CONFIRMED_BY_CUSTOMER = 'confirmed_by_customer',
  SHIPPED = 'shipped',
  RECEIVED_AT_DESTINATION = 'received_at_destination', 
  AVAILABLE_FOR_PICKUP = 'available_for_pickup',
  PAID = 'paid',
  COMPLETED = 'completed',
  RETURNED = 'returned'
}

@Entity('parcels')
@Unique(['companyId', 'customerTrackingId'])
export class Parcel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  originalTrackingNumber!: string;

  @Column({ unique: true })
  internalTrackingId!: string;

  @Column({ nullable: true })
  customerTrackingId!: string;

  @Column()
  description!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight!: number;

  @Column({ nullable: true })
  dimensions!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  shippingCost!: number;

  @Column({ type: 'enum', enum: ParcelStatus, default: ParcelStatus.PENDING })
  status!: ParcelStatus;

  @Column()
  companyId!: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  @Column({ nullable: true })
  warehouseId!: string;

  @ManyToOne(() => Warehouse, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'warehouseId' })
  warehouse!: Warehouse;

  @Column()
  customerId!: string;

  @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customerId' })
  customer!: Customer;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  
}