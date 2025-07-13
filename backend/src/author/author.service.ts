import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthorService {
  /**
   * Строит Map: contractNumber -> rowData
   */
  buildContractToRowMap(allAuthorsRows: any[]): Map<string, any> {
    const contractToRow = new Map<string, any>();
    for (const row of allAuthorsRows) {
      if (row['Номер договора']) {
        contractToRow.set(row['Номер договора'].toString().trim(), row);
      }
    }
    return contractToRow;
  }

  /**
   * Получает стоимость аренды и дату заселения по строке автора
   */
  extractRentAndSettlement(row: any): { rent: string | null, settlementDate: string | null } {
    const rent = row && row['Стоимость аренды'] ? row['Стоимость аренды'] : null;
    let settlementDate: string | null = null;
    if (row && row['Комментарии']) {
      const match = row['Комментарии'].match(/(\d{2}\.\d{2})/);
      if (match) {
        settlementDate = match[1];
      }
    }
    return { rent, settlementDate };
  }
} 