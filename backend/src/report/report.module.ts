import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { LifePosIntegrationService } from './life-pos.integration';
import { KonturIntegrationService } from './kontur.integration';
import { GoogleIntegrationService } from '../google/google.integration';
import { ReportItem } from './report-item.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { ReportScheduler } from './report.scheduler';
import { ReportAggregationService } from './report-aggregation.service';
import { LostSalesService } from './lost-sales.service';
import { CommissionCalculationService } from './commission-calculation.service';
import { AuthorService } from '../author/author.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReportItem]), ScheduleModule.forRoot()],
  controllers: [ReportController],
  providers: [ReportService, LifePosIntegrationService, KonturIntegrationService, GoogleIntegrationService, ReportScheduler, ReportAggregationService, LostSalesService, CommissionCalculationService, AuthorService],
})
export class ReportModule {} 