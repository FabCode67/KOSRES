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
  logging: process.env.NODE_ENV === 'development' && !process.env.QUIET_SQL,
  // Without these, a stalled connection (Neon compute waking up, a lock
  // wait, a dropped network hop) hangs forever with no error -- as seen
  // during the cadastral import. Fail loudly instead of hanging silently.
  connectTimeoutMS: 15000,
  extra: {
    statement_timeout: 60000, // 60s: generous for a 2000-row upsert batch, but not infinite
    query_timeout: 60000,
  },
});
