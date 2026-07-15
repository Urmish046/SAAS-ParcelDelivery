import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Company } from './company.model';
import { Parcel } from './parcel.model';
import { User } from './user.model';

@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  location!: string;

  @Column({ type: 'text', nullable: true })
  address!: string;

  @Column()
  companyId!: string;

  @ManyToOne(() => Company, (company) => company.warehouses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Parcel, (parcel) => parcel.warehouse)
  parcels!: Parcel[];

  @OneToMany(() => User, (user) => user.warehouse)
  staff!: User[];
}