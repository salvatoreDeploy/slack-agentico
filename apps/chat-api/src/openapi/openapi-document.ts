import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { join } from 'node:path';

/** O snapshot do contrato, gravado no repositório (LLD, "Onde mora cada fato"). */
export const OPENAPI_SNAPSHOT_PATH = join(import.meta.dirname, '..', '..', 'openapi.json');

/** Gera o contrato REST da API do chat a partir dos controllers e dos DTOs. */
export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('API do chat')
    .setDescription('Contrato REST da API do chat do Full Cycle Chat.')
    .setVersion('1')
    .build();
  return SwaggerModule.createDocument(app, config);
}
