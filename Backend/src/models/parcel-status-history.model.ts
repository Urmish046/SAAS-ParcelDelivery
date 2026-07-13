import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Parcel, ParcelStatus } from './parcel.model';

@Entity('parcel_status_history')
export class ParcelStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  parcelId!: string;

  @ManyToOne(() => Parcel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parcelId' })
  parcel!: Parcel;

  @Column({ type: 'enum', enum: ParcelStatus })
  status!: ParcelStatus;

  @Column()
  changedById!: string;

  @Column()
  changedByType!: string; // 'user' ya 'customer'

  @CreateDateColumn()
  createdAt!: Date;
}