import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fandom } from './fandom.entity';

@Injectable()
export class FandomService {
  constructor(
    @InjectRepository(Fandom)
    private fandomRepository: Repository<Fandom>,
  ) {}

  async findAll(): Promise<Fandom[]> {
    return this.fandomRepository.find();
  }

  async create(name: string, imageUrl: string): Promise<Fandom> {
    const fandom = this.fandomRepository.create({ name, image_url: imageUrl });
    return this.fandomRepository.save(fandom);
  }

  async remove(id: number): Promise<void> {
    await this.fandomRepository.delete(id);
  }

  async findOne(id: number): Promise<Fandom | null> {
    return this.fandomRepository.findOne({ where: { id } });
  }

  async updateImageUrl(id: number, imageUrl: string): Promise<void> {
    await this.fandomRepository.update(id, { image_url: imageUrl });
  }
} 