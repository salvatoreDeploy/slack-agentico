import { NestFactory } from '@nestjs/core';
import { ConfigType } from '@nestjs/config';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';
import { httpConfig } from './config/http.config.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  configureApp(app);
  const http = app.get<ConfigType<typeof httpConfig>>(httpConfig.KEY);
  await app.listen(http.port);
}
await bootstrap();
