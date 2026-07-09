import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from './user.model';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id!: string; 

  @Column()
  name!: string; 

  @Column({ unique: true })
  subdomain!: string; 

  @Column({ default: 'ACTIVE' })
  status!: string; 

  @CreateDateColumn()
  createdAt!: Date; 

  @UpdateDateColumn()
  updatedAt!: Date;
  
  @OneToMany(() => User, (user) => user.company)
  users!: User[];
}