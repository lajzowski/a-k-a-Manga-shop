import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReportService } from './report.service';

@Injectable()
export class ReportScheduler {
  private readonly logger = new Logger(ReportScheduler.name);

  constructor(private readonly reportService: ReportService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async syncReportItemsFromLifePos() {
    this.logger.log(`[START] syncReportItemsFromLifePos at ${new Date().toISOString()}`);
    const start = Date.now();
    const rawItems = await this.reportService.generateRawReportItemsFromLifePos();
    this.logger.log(`rawItems to upsert: ${rawItems.length}`);
    let upserted = 0;
    for (const item of rawItems) {
      await this.reportService['reportItemRepository'].upsert(item, [
        'source', 'name', 'group', 'sale_price', 'sale_date'
      ]);
      upserted++;
    }
    const ms = Date.now() - start;
    this.logger.log(`syncReportItemsFromLifePos: upserted ${upserted} items in ${ms}ms at ${new Date().toISOString()}`);
  }
} 