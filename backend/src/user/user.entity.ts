import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('shop_user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  role: string;

  @Column({ nullable: true })
  contract_id: string;
} 