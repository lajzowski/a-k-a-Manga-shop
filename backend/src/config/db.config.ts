import { DataSourceOptions } from 'typeorm';

export const typeOrmConfig: DataSourceOptions = {
    type: 'postgres',
    host: '5.23.52.14',
    port: 5432,
    username: 'aka_admin',
    password: 'g%5UcDr7ZMnd',
    database: 'shop_prod',
    entities: ['src/**/*.entity.ts'],
    migrations: ['src/migrations/*.ts'],
    synchronize: true,
};
