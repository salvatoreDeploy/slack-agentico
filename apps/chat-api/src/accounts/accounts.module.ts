import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module.js';
import { ConversationsModule } from '../conversations/conversations.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { PeopleModule } from '../people/people.module.js';
import { SessionsModule } from '../sessions/sessions.module.js';

/** Raiz do contexto do comando de contas: o banco e os services, sem HTTP. */
@Module({
  imports: [ConfigModule, DatabaseModule, PeopleModule, SessionsModule, ConversationsModule],
})
export class AccountsModule {}
