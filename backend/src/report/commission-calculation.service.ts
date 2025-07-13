import { Injectable } from '@nestjs/common';

@Injectable()
export class CommissionCalculationService {
  /**
   * Пересчитывает commission и authorAmount для каждой позиции и группы
   */
  recalculate(groups: Iterable<any>): void {
    for (const groupObj of groups) {
      let groupCommission = 0;
      let groupAuthorAmount = 0;
      for (const item of groupObj.listSells) {
        item.commission = Math.round(item.total * 0.1 * 100) / 100;
        item.authorAmount = Math.round((item.total - item.commission) * 100) / 100;
        groupCommission += item.commission;
        groupAuthorAmount += item.authorAmount;
      }
      groupObj.commission = Math.round(groupCommission * 100) / 100;
      groupObj.authorAmount = Math.round(groupAuthorAmount * 100) / 100;
      groupObj.totalSales = Math.round(groupObj.totalSales * 100) / 100;
    }
  }
} 