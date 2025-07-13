import { Injectable } from '@nestjs/common';

@Injectable()
export class KonturIntegrationService {
  private static readonly KONTUR_API_KEY = 'e6f68502-90ef-fab7-eda4-0aad0aa59c4b';
  private static readonly KONTUR_HEADERS = {
    'x-kontur-apikey': KonturIntegrationService.KONTUR_API_KEY,
    'Accept': 'application/json',
  };

  async getProductRests(): Promise<any[]> {
    const url = 'https://api.kontur.ru/market/v1/shops/a6dfb1a3-a9fb-4f8b-9611-6b91813735e6/product-rests';
    const response = await fetch(url, {
      method: 'GET',
      headers: KonturIntegrationService.KONTUR_HEADERS as any,
    });
    if (!response.ok) {
      throw new Error(`Kontur API error (rests): ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.items || [];
  }

  async getProductGroups(): Promise<any[]> {
    const url = 'https://api.kontur.ru/market/v1/shops/a6dfb1a3-a9fb-4f8b-9611-6b91813735e6/product-groups';
    const response = await fetch(url, {
      method: 'GET',
      headers: KonturIntegrationService.KONTUR_HEADERS as any,
    });
    if (!response.ok) {
      throw new Error(`Kontur API error (groups): ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.items || [];
  }

  async getProducts(): Promise<any[]> {
    const url = 'https://api.kontur.ru/market/v1/shops/a6dfb1a3-a9fb-4f8b-9611-6b91813735e6/products';
    const response = await fetch(url, {
      method: 'GET',
      headers: KonturIntegrationService.KONTUR_HEADERS as any,
    });
    if (!response.ok) {
      throw new Error(`Kontur API error (products): ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.items || [];
  }
} 