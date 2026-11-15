import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { databaseConfig } from './database.config.js';
import { httpConfig } from './http.config.js';
import { logConfig } from './log.config.js';

/**
 * A configuração de cada assunto, lida de `loadEnv`, o único ponto que valida as variáveis. Uma
 * variável ausente ou inválida derruba a subida, com o nome dela na mensagem (LLD,
 * "Configuração").
 */
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
      load: [databaseConfig, httpConfig, logConfig],
    }),
  ],
})
export class ConfigModule {}
