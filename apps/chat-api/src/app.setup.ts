import { INestApplication } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from 'nestjs-pino';

/**
 * `tamanho do corpo da requisição` (LLD, "Valores e configuração"): cobre uma Mensagem no `tamanho
 * da Mensagem` com grafemas de até 28 bytes, como as bandeiras, com folga para o JSON. Acima dele, a
 * API responde 413 `payload_too_large`.
 */
const REQUEST_BODY_LIMIT = '256kb';

/**
 * O que o `main.ts` e os testes de ponta a ponta aplicam à aplicação depois de criada, para os
 * testes rodarem a mesma aplicação da produção. A aplicação é criada com `bufferLogs: true`.
 */
export function configureApp(app: INestApplication): void {
  app.useLogger(app.get(Logger));
  (app as NestExpressApplication).useBodyParser('json', { limit: REQUEST_BODY_LIMIT });
  app.enableShutdownHooks();
}
