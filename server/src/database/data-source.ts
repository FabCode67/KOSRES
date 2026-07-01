import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../../.env') });

const isLocalDb = (process.env.DATABASE_URL ?? '').includes('localhost') ||
                  (process.env.DATABASE_URL ?? '').includes('127.0.0.1');

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  // SSL only for external databases (Neon, RDS, etc.)
  // Disabled for self-hosted local PostgreSQL on Contabo
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '../migrations/*{.ts,.js}')],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
