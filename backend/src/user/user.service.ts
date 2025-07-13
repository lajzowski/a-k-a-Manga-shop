import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByUsername(username: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { username } });
    return user ?? undefined;
  }

  async findById(id: number): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { id } });
    return user ?? undefined;
  }

  async findByRole(role: string): Promise<User[]> {
    return this.userRepository.find({ where: { role } });
  }

  async createAuthor(username: string, password: string, contract_id: string): Promise<User> {
    const user = this.userRepository.create({ username, password, contract_id, role: 'author' });
    return this.userRepository.save(user);
  }

  async getAllAuthorContractIds(): Promise<string[]> {
    const authors = await this.userRepository.find({ where: { role: 'author' } });
    return authors.map(a => a.contract_id).filter(Boolean);
  }
} 