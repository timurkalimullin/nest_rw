import path from 'path';
import { DataSource } from 'typeorm';
import { config } from './ormconfig';

export const ormseedconfig = {
  ...config,
  migrations: [path.join(__dirname, '/src/common/seeds/**/*{.ts,.js}')],
};

const dataSource = new DataSource(ormseedconfig);

export default dataSource;
