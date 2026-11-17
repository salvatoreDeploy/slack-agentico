import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeopleModule } from '../people/people.module.js';
import { Session } from './session.entity.js';
import { SessionGuard } from './session.guard.js';
import { SessionsController } from './sessions.controller.js';
import { SessionsRepository } from './sessions.repository.js';
import { SessionsService } from './sessions.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Session]), PeopleModule],
  controllers: [SessionsController],
  providers: [
    SessionsRepository,
    SessionsService,
    // Toda rota exige Sessão, salvo as marcadas com @Public() (LLD, "Interfaces").
    { provide: APP_GUARD, useClass: SessionGuard },
  ],
})
export class SessionsModule {}
