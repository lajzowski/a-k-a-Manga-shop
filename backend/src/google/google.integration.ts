import { Injectable } from '@nestjs/common';
import { google, sheets_v4 } from 'googleapis';
import { config as sheetsConfig } from './sheets.config';

@Injectable()
export class GoogleIntegrationService {
  private sheets: sheets_v4.Sheets;

  constructor() {
    const sa = sheetsConfig.serviceAccount;
    const auth = new google.auth.JWT({
      email: sa.client_email,
      key: sa.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    this.sheets = google.sheets({ version: 'v4', auth });
  }

  /**
   * Получить строку из листа "Информация по авторам" по номеру договора
   * @param spreadsheetId id таблицы
   * @param contractNumber номер договора (строка или число)
   */
  async getAuthorInfoByContractNumber(spreadsheetId: string, contractNumber: string | number): Promise<any | null> {
    const sheetName = 'Информация по авторам';
    const range = `${sheetName}!A2:O`; // A2:O — диапазон всех строк, кроме заголовка
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    const rows = res.data.values || [];
    // Индексы колонок
    const columns = [
      'Номер договора', 'Ник', 'Имя', 'Telegram', 'TG ID', 'ВК', 'Стелаж', 'Уровень', 'Сторона', 'Комментарии', 'Последний отчёт', 'Стоимость аренды', 'Выведено', 'Итого'
    ];
    for (const row of rows) {
      if (row[0] && row[0].toString().trim() === contractNumber.toString().trim()) {
        // Собираем объект по колонкам
        const result: any = {};
        columns.forEach((col, idx) => {
          result[col] = row[idx] ?? '';
        });
        return result;
      }
    }
    return null;
  }

  /**
   * Получить все строки из листа "Информация по авторам"
   * @param spreadsheetId id таблицы
   * @returns массив объектов, где ключи — названия колонок
   */
  async getAllAuthorsRows(spreadsheetId: string): Promise<any[]> {
    const sheetName = 'Информация по авторам';
    const range = `${sheetName}!A2:O`;
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    const rows = res.data.values || [];
    const columns = [
      'Номер договора', 'Ник', 'Имя', 'Telegram', 'TG ID', 'ВК', 'Стелаж', 'Уровень', 'Сторона', 'Комментарии', 'Последний отчёт', 'Стоимость аренды', 'Выведено', 'Итого'
    ];
    return rows.map(row => {
      const obj: any = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx] ?? '';
      });
      return obj;
    });
  }

  /**
   * Получить все строки из листа "Проёбы кассы"
   * @param spreadsheetId id таблицы
   * @returns массив объектов, где ключи — названия колонок
   */
  async getLostSalesRows(spreadsheetId: string): Promise<any[]> {
    const sheetName = 'Проёбы кассы';
    const range = `${sheetName}!A2:E`;
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    const rows = res.data.values || [];
    const columns = [
      'Группа', 'Наименование', 'Сумма', 'Тип коррекции', 'Дата'
    ];
    return rows.map(row => {
      const obj: any = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx] ?? '';
      });
      return obj;
    });
  }
} 