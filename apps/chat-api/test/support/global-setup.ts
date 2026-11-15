import { execFileSync } from 'node:child_process';
import pg from 'pg';
import { TEST_DATABASE_NAME, testDatabaseUrl } from './test-database-url.js';

const UNDEFINED_DATABASE = '3D000';

/**
 * Zera o schema do chat_test e roda as migrações, uma vez por execução da suíte.
 * O banco não é apagado: o papel chat é dono dele, mas não tem CREATEDB
 * (LLD, "Ambiente de desenvolvimento").
 */
export default async function setup(): Promise<void> {
  const url = testDatabaseUrl();
  await resetSchema(url);
  execFileSync('pnpm', ['migration:run'], {
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'pipe',
  });
}

async function resetSchema(url: string): Promise<void> {
  const client = new pg.Client({ connectionString: url });
  try {
    await client.connect();
  } catch (error) {
    if ((error as { code?: string }).code === UNDEFINED_DATABASE) {
      throw new Error(
        `O banco ${TEST_DATABASE_NAME} não existe neste volume. Crie-o uma vez com ` +
          `"docker compose -f compose.yaml exec postgres psql -U postgres -c ` +
          `'CREATE DATABASE ${TEST_DATABASE_NAME} OWNER chat'", ou recomece com ` +
          `"docker compose -f compose.yaml down -v".`,
      );
    }
    throw error;
  }
  try {
    await client.query('DROP SCHEMA public CASCADE');
    await client.query('CREATE SCHEMA public');
  } finally {
    await client.end();
  }
}
