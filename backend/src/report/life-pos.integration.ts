import { Injectable } from '@nestjs/common';

@Injectable()
export class LifePosIntegrationService {
  private static readonly BASE_URL = 'https://api.life-pos.ru/orgs/32c5af98-db2f-4246-8f6b-9ca7319bb83d/deals/sales';
  private static readonly HEADERS = {
    'X-LP-Client-Identifier': '32c5af98-db2f-4246-8f6b-9ca7319bb83d',
    'X-LP-Client-Type': 'App',
    'Content-Type': 'application/json-patch+json',
    'Accept': 'application/json',
    'Accept-Language': 'ru-RU',
    'Authorization': '8pNV0ksXWNXD-gICILT36LV6J4YePYtOlySVsalnBsuN\t',
  };

  async getSalesPage(page_token?: string): Promise<any> {
    let url = LifePosIntegrationService.BASE_URL;
    if (page_token) {
      const params = new URLSearchParams({ page_token });
      url += `?${params.toString()}`;
    }
    const response = await fetch(url, {
      method: 'GET',
      headers: LifePosIntegrationService.HEADERS as any,
    });
    if (!response.ok) {
      throw new Error(`LifePos API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }

  async getAllPositions(): Promise<any[]> {
    const positions: any[] = [];
    let nextPageToken: string | undefined = undefined;
    let pageNumber = 0;
    do {
      const page = await this.getSalesPage(nextPageToken);
      if (page.items) {
        for (const item of page.items) {
          if (
            item.state === "Completed" &&
            item.payment_status === "Paid" &&
            item.shipping_status === "Shipped" &&
            item.total_sum &&
            item.total_sum.value > 0 &&
            Array.isArray(item.positions) &&
            item.positions.length > 0
          ) {
            positions.push(...item.positions);
          }
        }
      }
      nextPageToken = page.next_page_token;
      pageNumber++;
      if (pageNumber > 50) break;
    } while (nextPageToken);
    return positions;
  }

  async getAllSales(): Promise<any[]> {
    const sales: any[] = [];
    let nextPageToken: string | undefined = undefined;
    let pageNumber = 0;
    do {
      const page = await this.getSalesPage(nextPageToken);
      if (page.items) {
        sales.push(...page.items);
      }
      nextPageToken = page.next_page_token;
      pageNumber++;
      if (pageNumber > 50) break;
    } while (nextPageToken);
    return sales;
  }
} 