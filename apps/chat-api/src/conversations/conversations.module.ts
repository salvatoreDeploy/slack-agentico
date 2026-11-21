import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './conversation.entity.js';
import { ConversationsController } from './conversations.controller.js';
import { ConversationsRepository } from './conversations.repository.js';
import { ConversationsService } from './conversations.service.js';
import { Participation } from './participation.entity.js';

/** Conversas, Canais e participação (LLD, "Módulos da API do chat"). */
@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Participation])],
  controllers: [ConversationsController],
  providers: [ConversationsRepository, ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {}
