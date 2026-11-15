import { INestApplication } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

/**
 * O que o `main.ts` e os testes de ponta a ponta aplicam à aplicação depois de criada, para os
 * testes rodarem a mesma aplicação da produção. A aplicação é criada com `bufferLogs: true`.
 */
export function configureApp(app: INestApplication): void {
  app.useLogger(app.get(Logger));
  app.enableShutdownHooks();
}
