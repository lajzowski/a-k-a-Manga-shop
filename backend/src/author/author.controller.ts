import { Controller, Get, Post, Body, BadRequestException, UseGuards, Param } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import * as bcrypt from 'bcrypt';
import { RolesGuard } from '../auth/roles.guard';
import { GoogleIntegrationService } from '../google/google.integration';

const SPREADSHEET_ID = '1JnpIsytI_reVhb1rSW8pbJO0AjPCUQNNkfBdN7aFK-A';

@UseGuards(RolesGuard)
@Controller('authors')
export class AuthorController {
  constructor(
    private readonly userService: UserService,
    private readonly googleIntegration: GoogleIntegrationService,
  ) {}

  @Get()
  async getAuthors(): Promise<Omit<User, 'password'>[]> {
    const authors = await this.userService.findByRole('author');
    return authors.map(({ password, ...rest }) => rest);
  }

  @Post()
  async createAuthor(
    @Body() body: { username: string; password: string; contract_id: string }
  ): Promise<Omit<User, 'password'>> {
    const { username, password, contract_id } = body;
    if (!username || !password || !contract_id) {
      throw new BadRequestException('username, password, contract_id required');
    }
    const existing = await this.userService.findByUsername(username);
    if (existing) {
      throw new BadRequestException('Username already exists');
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await this.userService.createAuthor(username, hash, contract_id);
    const { password: _, ...rest } = user;
    return rest;
  }

  @UseGuards(RolesGuard)
  @Get('contracts')
  async getContractNumbers(): Promise<string[]> {
    const rows = await this.googleIntegration.getAllAuthorsRows(SPREADSHEET_ID);
    // Получаем все contract_id, занятые в БД
    const busyContracts = new Set((await this.userService.getAllAuthorContractIds()).map(id => id?.toString().trim()));
    // Фильтруем: только уникальные, непустые, Ник не прочерк, и не занятые
    const contracts = Array.from(new Set(
      rows
        .filter(r => r['Номер договора'] && r['Ник'] && r['Ник'].trim() !== '-')
        .map(r => r['Номер договора'].toString().trim())
        .filter(num => num && !busyContracts.has(num))
    ));
    return contracts;
  }

  @UseGuards(RolesGuard)
  @Get('contract/:contractId')
  async getNickByContract(@Param('contractId') contractId: string): Promise<{ nick: string | null }> {
    if (!contractId) return { nick: null };
    // Проверяем, есть ли уже автор с этим contract_id
    const busyContracts = new Set((await this.userService.getAllAuthorContractIds()).map(id => id?.toString().trim()));
    if (busyContracts.has(contractId.toString().trim())) {
      return { nick: null };
    }
    // Получаем строку из Google Sheets
    const rows = await this.googleIntegration.getAllAuthorsRows(SPREADSHEET_ID);
    const row = rows.find(r => r['Номер договора'] && r['Номер договора'].toString().trim() === contractId.toString().trim());
    if (!row) return { nick: null };
    const username = row['Ник'] && row['Ник'].trim() !== '-' ? row['Ник'].trim() : null;
    return { nick: username };
  }
} 