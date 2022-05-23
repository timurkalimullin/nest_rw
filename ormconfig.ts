import { DataSourceOptions } from 'typeorm';
import path from 'path';

export const config: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: Number(process.env['POSTGRES_PORT']) ?? 5432,
  username: process.env['POSTGRES_USER'],
  password: process.env['POSTGRES_PASSWORD'],
  database: process.env['POSTGRES_DB'],
  uuidExtension: 'pgcrypto',
  synchronize: false,
  entities: [path.join(__dirname, '/**/entities/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, '/migrations/**/*{.ts,.js}')],
};
