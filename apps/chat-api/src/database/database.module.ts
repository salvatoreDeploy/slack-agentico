import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { databaseConfig } from '../config/database.config.js';
import { BASE_DATA_SOURCE_OPTIONS } from './database-options.js';

/**
 * O TypeORM no Banco do chat e o cls transacional. Quem participa de uma transação pega o
 * repositório por `TransactionHost` (`AGENTS.md` da API, "Transações").
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (database: ConfigType<typeof databaseConfig>) => ({
        ...BASE_DATA_SOURCE_OPTIONS,
        url: database.url,
        autoLoadEntities: true,
      }),
    }),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
      plugins: [
        new ClsPluginTransactional({
          imports: [TypeOrmModule],
          adapter: new TransactionalAdapterTypeOrm({ dataSourceToken: getDataSourceToken() }),
        }),
      ],
    }),
  ],
})
export class DatabaseModule {}
