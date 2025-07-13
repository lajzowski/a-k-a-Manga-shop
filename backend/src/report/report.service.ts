import { Injectable } from '@nestjs/common';
import { LifePosIntegrationService } from './life-pos.integration';
import { KonturIntegrationService } from './kontur.integration';
import { GoogleIntegrationService } from '../google/google.integration';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportItem } from './report-item.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Logger } from '@nestjs/common';
import { ReportAggregationService } from './report-aggregation.service';
import { LostSalesService } from './lost-sales.service';
import { CommissionCalculationService } from './commission-calculation.service';
import { AuthorService } from '../author/author.service';

@Injectable()
export class ReportService {
  private readonly SPREADSHEET_ID = '1JnpIsytI_reVhb1rSW8pbJO0AjPCUQNNkfBdN7aFK-A';
  private readonly logger = new Logger(ReportService.name);
  constructor(
    private readonly lifePosIntegration: LifePosIntegrationService,
    private readonly konturIntegration: KonturIntegrationService,
    private readonly googleIntegration: GoogleIntegrationService,
    @InjectRepository(ReportItem)
    private readonly reportItemRepository: Repository<ReportItem>,
    private readonly reportAggregationService: ReportAggregationService,
    private readonly lostSalesService: LostSalesService,
    private readonly commissionCalculationService: CommissionCalculationService,
    private readonly authorService: AuthorService,
  ) {}

  // метод getAuthorsReport удалён как неиспользуемый

  /**
   * Получить агрегированный отчёт из БД (только оркестрация)
   */
  async getAuthorsReportFromDb({ dateFrom, dateTo, contractId }: { dateFrom?: Date, dateTo?: Date, contractId?: string } = {}): Promise<any[]> {
    // Получаем все продажи за период и по contractId (group), если передан
    const qb = this.reportItemRepository.createQueryBuilder('item');
    if (dateFrom) qb.andWhere('item.sale_date >= :dateFrom', { dateFrom });
    if (dateTo) qb.andWhere('item.sale_date <= :dateTo', { dateTo });
    if (contractId) qb.andWhere('item.group = :contractId', { contractId });
    const items = await qb.getMany();

    // Агрегируем продажи
    const groupMap = this.reportAggregationService.aggregate(items);
    this.commissionCalculationService.recalculate(groupMap.values());

    // Подгружаем справочную информацию об авторах
    const allAuthorsRows = await this.googleIntegration.getAllAuthorsRows(this.SPREADSHEET_ID);
    const contractToRow = this.authorService.buildContractToRowMap(allAuthorsRows);
    for (const g of groupMap.values()) {
      const row = contractToRow.get(g.groupNumber?.toString().trim());
      const { rent, settlementDate } = this.authorService.extractRentAndSettlement(row);
      g.rent = rent;
      g.settlementDate = settlementDate;
    }

    // Добавляем потерянные продажи
    await this.addLostSalesToGroups(groupMap, dateFrom, dateTo);

    // Финальный перерасчёт комиссий
    this.commissionCalculationService.recalculate(groupMap.values());
    if (contractId) {
      // Оставить только одну группу — contractId
      const filtered = groupMap.has(contractId)
        ? [groupMap.get(contractId)]
        : [];
      return filtered;
    }
    return Array.from(groupMap.values());
  }

  /**
   * Приватный метод: добавляет потерянные продажи в агрегированные группы
   */
  private async addLostSalesToGroups(groupMap: Map<string, any>, dateFrom?: Date, dateTo?: Date) {
    const lostSalesRows = await this.googleIntegration.getLostSalesRows(this.SPREADSHEET_ID);
    const filteredLostSales = this.lostSalesService.filterLostSalesRows(lostSalesRows, dateFrom, dateTo);
    for (const lost of filteredLostSales) {
      const groupNumber = lost['Группа'] || 'unknown';
      const name = lost['Наименование'];
      const amount = 1;
      const sale_price = parseFloat(lost['Сумма']?.toString().replace(',', '.') || '0');
      const total = sale_price * amount;
      let groupObj = groupMap.get(groupNumber);
      if (!groupObj) {
        groupObj = {
          groupNumber,
          totalSales: 0,
          commission: 0,
          authorAmount: 0,
          listSells: [],
          rent: null,
        };
        groupMap.set(groupNumber, groupObj);
      }
      let existing = groupObj.listSells.find((item: any) => item.name === name && item.sale_price === sale_price);
      if (existing) {
        existing.amount += amount;
        existing.total += total;
      } else {
        existing = {
          name,
          sale_price,
          amount,
          total,
          commission: 0,
          authorAmount: 0,
          rest: null,
        };
        groupObj.listSells.push(existing);
      }
      groupObj.totalSales = Math.round((groupObj.totalSales + total) * 100) / 100;
    }
  }

  /**
   * Генерирует сырые позиции для отчёта из Life POS (без агрегации)
   */
  async generateRawReportItemsFromLifePos(): Promise<Partial<ReportItem>[]> {
    const [sales, rests, groups, products] = await Promise.all([
      this.lifePosIntegration.getAllSales(), // теперь все чеки!
      this.konturIntegration.getProductRests(),
      this.konturIntegration.getProductGroups(),
      this.konturIntegration.getProducts(),
    ]);
    // Словари для быстрого доступа
    const restMap = new Map<string, number>();
    for (const rest of rests) {
      restMap.set(rest.name, rest.rest);
    }
    const groupIdToNumber = new Map<string, string>();
    for (const group of groups) {
      groupIdToNumber.set(group.id, group.number || group.name || group.id);
    }
    const productNameToGroupId = new Map<string, string>();
    for (const product of products) {
      productNameToGroupId.set(product.name, product.groupId);
    }
    // Собираем сырые позиции
    const rawItems: Partial<ReportItem>[] = [];
    // sales — теперь массив чеков
    for (const sale of sales) {
      if (
        sale.state === "Completed" &&
        sale.payment_status === "Paid" &&
        sale.shipping_status === "Shipped" &&
        sale.total_sum &&
        sale.total_sum.value > 0 &&
        Array.isArray(sale.positions) &&
        sale.positions.length > 0
      ) {
        for (const pos of sale.positions) {
          const name = pos.name;
          const sale_price = pos.sale_price?.value ? pos.sale_price.value / 100 : 0;
          const amount = pos.quantity || 1;
          const total = sale_price * amount;
          const groupId = productNameToGroupId.get(name) || null;
          const groupNumber = groupId ? groupIdToNumber.get(groupId) || groupId : 'unknown';
          const rest = restMap.get(name) ?? 0;
          const commission = Math.round(total * 0.1 * 100) / 100;
          const authorAmount = Math.round((total - commission) * 100) / 100;
          const sale_date = sale.opened_at ? new Date(sale.opened_at) : new Date();
          rawItems.push({
            name,
            sale_price,
            amount,
            total,
            commission,
            authorAmount,
            rest,
            group: groupNumber,
            sale_date,
            source: 'life-pos',
          });
        }
      }
    }
    return rawItems;
  }
} 