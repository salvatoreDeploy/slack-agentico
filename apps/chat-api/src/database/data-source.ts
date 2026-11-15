import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { validateEnv } from '../config/env.schema.js';
import { BASE_DATA_SOURCE_OPTIONS } from './database-options.js';

const PROJECT_ROOT = join(import.meta.dirname, '..', '..');

/**
 * Data source do CLI das migrações, carregado pelo `tsx` nos scripts `migration:*`. A aplicação
 * não o usa: ela registra o TypeORM pelo `DatabaseModule`. Como o `tsx` não emite os metadados
 * de tipo, toda coluna das entidades declara o tipo explicitamente.
 */
export default new DataSource({
  ...BASE_DATA_SOURCE_OPTIONS,
  url: validateEnv(process.env).DATABASE_URL,
  entities: [join(PROJECT_ROOT, 'src/**/*.entity.ts')],
  migrations: [join(PROJECT_ROOT, 'migrations/*.ts')],
});
