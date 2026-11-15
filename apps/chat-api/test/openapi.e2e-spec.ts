import { INestApplication } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { App } from 'supertest/types.js';
import { buildOpenApiDocument, OPENAPI_SNAPSHOT_PATH } from '../src/openapi/openapi-document.js';
import { createTestApp } from './support/create-test-app.js';

describe('Contrato da API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('o contrato gerado é igual ao snapshot gravado; rode pnpm openapi para atualizá-lo', async () => {
    const snapshot: unknown = JSON.parse(await readFile(OPENAPI_SNAPSHOT_PATH, 'utf8'));

    const document = buildOpenApiDocument(app);

    expect(document).toEqual(snapshot);
  });
});
