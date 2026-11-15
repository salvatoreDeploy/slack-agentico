import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { App } from 'supertest/types.js';
import { AppModule } from '../../src/app.module.js';
import { configureApp } from '../../src/app.setup.js';

/**
 * Sobe a aplicação inteira, contra o chat_test, como o `main.ts` a sobe. Quem chama fecha com
 * `app.close()` no fim (rule de testes da API).
 */
export async function createTestApp(): Promise<INestApplication<App>> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication<INestApplication<App>>({ bufferLogs: true });
  configureApp(app);
  await app.init();
  return app;
}
