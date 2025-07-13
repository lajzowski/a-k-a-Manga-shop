import { Injectable } from '@nestjs/common';
import { ReportItem } from './report-item.entity';

@Injectable()
export class ReportAggregationService {
  /**
   * Агрегирует продажи по группам и позициям
   */
  aggregate(items: ReportItem[]): Map<string, any> {
    const groupMap = new Map<string, any>();
    for (const item of items) {
      const groupNumber = item.group || 'unknown';
      if (!groupMap.has(groupNumber)) {
        groupMap.set(groupNumber, {
          groupNumber,
          totalSales: 0,
          commission: 0,
          authorAmount: 0,
          listSells: [],
        });
      }
      const groupObj = groupMap.get(groupNumber);
      // --- Агрегация позиций внутри listSells ---
      // Ключ для поиска: name + sale_price
      let existing = groupObj.listSells.find((sell: any) => sell.name === item.name && sell.sale_price === item.sale_price);
      if (existing) {
        existing.amount += item.amount;
        existing.total += item.total;
        existing.rest = item.rest ?? existing.rest;
      } else {
        existing = {
          name: item.name,
          sale_price: item.sale_price,
          amount: item.amount,
          total: item.total,
          commission: 0,
          authorAmount: 0,
          rest: item.rest,
        };
        groupObj.listSells.push(existing);
      }
      // Групповые суммы
      groupObj.totalSales += item.total;
    }
    return groupMap;
  }
} 