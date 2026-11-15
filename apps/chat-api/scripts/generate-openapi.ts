// Regrava o snapshot do contrato (`pnpm openapi`). Sobe a aplicação em modo de prévia, que lê os
// controllers sem instanciar os providers, então não precisa do banco.
import { NestFactory } from '@nestjs/core';
import { writeFile } from 'node:fs/promises';
import { AppModule } from '../src/app.module.js';
import { buildOpenApiDocument, OPENAPI_SNAPSHOT_PATH } from '../src/openapi/openapi-document.js';

const app = await NestFactory.create(AppModule, { preview: true, logger: false });
const document = buildOpenApiDocument(app);
await writeFile(OPENAPI_SNAPSHOT_PATH, `${JSON.stringify(document, null, 2)}\n`);
await app.close();
console.log(`Contrato gravado em ${OPENAPI_SNAPSHOT_PATH}`);
