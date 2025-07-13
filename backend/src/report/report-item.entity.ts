import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('report_item')
export class ReportItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('float')
  sale_price: number;

  @Column('float')
  amount: number;

  @Column('float')
  total: number;

  @Column('float')
  commission: number;

  @Column('float')
  authorAmount: number;

  @Column('float', { nullable: true })
  rest: number;

  @Column()
  group: string;

  @Column('timestamp')
  sale_date: Date;

  @Column()
  source: string;

  @UpdateDateColumn()
  updated_at: Date;
} 