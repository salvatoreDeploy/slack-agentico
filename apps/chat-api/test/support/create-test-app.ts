import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Logger } from 'nestjs-pino';
import { App } from 'supertest/types.js';
import { AppModule } from '../../src/app.module.js';

/**
 * Sobe a aplicação inteira, contra o chat_test, como o `main.ts` a sobe. Quem chama fecha com
 * `app.close()` no fim (rule de testes da API).
 */
export async function createTestApp(): Promise<INestApplication<App>> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication<INestApplication<App>>({ bufferLogs: true });
  app.useLogger(app.get(Logger));
  await app.init();
  return app;
}
