import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationsModule } from '../conversations/conversations.module.js';
import { Message } from './message.entity.js';
import { MessagesController } from './messages.controller.js';
import { MessagesRepository } from './messages.repository.js';
import { MessagesService } from './messages.service.js';

/** Mensagens de uma Conversa (LLD, "Módulos da API do chat"). */
@Module({
  imports: [TypeOrmModule.forFeature([Message]), ConversationsModule],
  controllers: [MessagesController],
  providers: [MessagesRepository, MessagesService],
})
export class MessagesModule {}
