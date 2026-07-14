import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from './user.model';
import { Warehouse } from './warehouse.model';
import { Customer } from './customer.model';
import { Parcel } from './parcel.model';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id!: string; 

  @Column()
  name!: string; 

  @Column({ unique: true })
  subdomain!: string; 

  @Column({ nullable: true })
  country!: string;

  @Column({ default: 'ACTIVE' })
  status!: string; 

  @CreateDateColumn()
  createdAt!: Date; 

  @UpdateDateColumn()
  updatedAt!: Date;
  
  @OneToMany(() => User, (user) => user.company)
  users!: User[];

  @OneToMany(() => Warehouse, (warehouse) => warehouse.company)
  warehouses!: Warehouse[];

  @OneToMany(() => Customer, (customer) => customer.company)
  customers!: Customer[];

  @OneToMany(() => Parcel, (parcel) => parcel.company)
  parcels!: Parcel[];
}