import { Controller, Get, Query, ForbiddenException, Req } from '@nestjs/common';
import { ReportService } from './report.service';
import { LifePosIntegrationService } from './life-pos.integration';
import { Request } from 'express';
import { Roles } from '../auth/roles.decorator';

@Controller('report')
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
  ) {}

  @Roles('admin')
  @Get('authors')
  async getAuthorsReport(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ): Promise<any[]> {
    // Преобразуем строки в Date, если переданы
    const filter: { dateFrom?: Date; dateTo?: Date } = {};
    if (dateFrom) filter.dateFrom = new Date(dateFrom);
    if (dateTo) filter.dateTo = new Date(dateTo);
    return this.reportService.getAuthorsReportFromDb(filter);
  }

  @Roles('author', 'admin')
  @Get('author')
  async getAuthorReport(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Req() req?: Request,
  ): Promise<any[]> {
    // Получаем contract_id и роль из заголовков (или из user, если будет auth)
    const role = req?.headers['x-role'];
    const contractId = req?.headers['x-contract-id'] || req?.headers['x-contractid'] || req?.headers['contract_id'];
    if (role !== 'author' && role !== 'admin') {
      throw new ForbiddenException('Only authors or admins can access this report');
    }
    if (role === 'author' && !contractId) {
      throw new ForbiddenException('Author must have contract_id');
    }
    // Преобразуем строки в Date, если переданы
    const filter: { dateFrom?: Date; dateTo?: Date; contractId?: string } = {};
    if (role === 'author') filter.contractId = contractId?.toString();
    if (dateFrom) filter.dateFrom = new Date(dateFrom);
    if (dateTo) filter.dateTo = new Date(dateTo);
    return this.reportService.getAuthorsReportFromDb(filter);
  }
} 