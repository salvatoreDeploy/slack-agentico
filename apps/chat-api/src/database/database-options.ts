import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

/**
 * As opções que a aplicação e o CLI das migrações compartilham. Nomes em `snake_case` (LLD,
 * "Dados"); o schema só muda por migração.
 */
export const BASE_DATA_SOURCE_OPTIONS = {
  type: 'postgres',
  namingStrategy: new SnakeNamingStrategy(),
  migrationsRun: false,
  synchronize: false,
} as const;
