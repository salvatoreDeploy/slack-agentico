import pg from 'pg';

let pool: pg.Pool | undefined;

/**
 * Consulta direta ao chat_test, para o teste conferir a linha que a ação gravou ou preparar um
 * caso no Arrange. O `DATABASE_URL` já aponta para o chat_test (use-test-database).
 */
export async function queryTestDatabase<Row extends pg.QueryResultRow>(
  sql: string,
  params: unknown[] = [],
): Promise<Row[]> {
  pool ??= new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  const result = await pool.query<Row>(sql, params);
  return result.rows;
}

/** Fecha a conexão do arquivo de teste; chamado no `afterAll`. */
export async function closeTestDatabase(): Promise<void> {
  await pool?.end();
  pool = undefined;
}
