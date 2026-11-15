/** Nome do banco das suítes e2e e de integração (LLD, "Ambiente de desenvolvimento"). */
export const TEST_DATABASE_NAME = 'chat_test';

/** O endereço do `chat_test`, montado a partir do `DATABASE_URL` do contêiner. */
export function testDatabaseUrl(databaseUrl = process.env.DATABASE_URL): string {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL não está definida; os testes montam o chat_test a partir dela.');
  }
  const url = new URL(databaseUrl);
  url.pathname = `/${TEST_DATABASE_NAME}`;
  return url.toString();
}
