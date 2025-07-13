import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Fandom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  image_url: string;
} 