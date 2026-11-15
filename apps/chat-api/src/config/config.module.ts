import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { databaseConfig } from './database.config.js';
import { validateEnv } from './env.schema.js';
import { httpConfig } from './http.config.js';
import { logConfig } from './log.config.js';

/**
 * O único ponto que lê as variáveis de ambiente. Uma variável ausente ou inválida derruba a
 * subida, com o nome dela na mensagem (LLD, "Configuração").
 */
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
      validate: validateEnv,
      load: [databaseConfig, httpConfig, logConfig],
    }),
  ],
})
export class ConfigModule {}
