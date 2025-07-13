import { Injectable } from '@nestjs/common';
import { parseDateFromString } from './date-parsing.util';

@Injectable()
export class LostSalesService {
  /**
   * Фильтрует и возвращает потерянные продажи из массива строк Google Sheets
   */
  filterLostSalesRows(lostSalesRows: any[], dateFrom?: Date, dateTo?: Date): any[] {
    return lostSalesRows.filter(lost => {
      if (!((lost['Тип коррекции'] || '').toLowerCase().includes('потеря'))) return false;
      const dateStr = lost['Дата'];
      let lostDate: Date | null = parseDateFromString(dateStr);
      if (lostDate) {
        if (dateFrom && lostDate < new Date(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate())) return false;
        if (dateTo && lostDate > new Date(dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate())) return false;
      }
      return true;
    });
  }
} 