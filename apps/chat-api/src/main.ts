import { NestFactory } from '@nestjs/core';
import { ConfigType } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';
import { httpConfig } from './config/http.config.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.enableShutdownHooks();
  const http = app.get<ConfigType<typeof httpConfig>>(httpConfig.KEY);
  await app.listen(http.port);
}
await bootstrap();
