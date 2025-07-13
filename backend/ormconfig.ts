import { DataSource } from 'typeorm';
import { typeOrmConfig } from './src/config/db.config';

export const AppDataSource = new DataSource(typeOrmConfig);
