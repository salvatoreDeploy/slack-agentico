import { Injectable } from '@nestjs/common';
import { v7 as uuidv7 } from 'uuid';
import { ValidationFailedError } from '../common/errors/validation-failed.error.js';
import { ConversationsService } from '../conversations/conversations.service.js';
import { countGraphemes } from './graphemes.js';
import { Message } from './message.entity.js';
import { MessagesRepository } from './messages.repository.js';

/** `tamanho da página do histórico` (LLD, "Valores e configuração"). */
export const HISTORY_PAGE_SIZE = 50;

/** `tamanho da Mensagem`, em grafemas, depois do corte das pontas (LLD, "Valores e configuração"). */
export const MESSAGE_MAX_LENGTH = 4000;

/** O resultado do envio: a Mensagem e se ela foi gravada agora ou já existia. */
export interface SentMessage {
  message: Message;
  created: boolean;
}

export interface MessagePage {
  messages: Message[];
  hasMore: boolean;
}

@Injectable()
export class MessagesService {
  constructor(
    private readonly messages: MessagesRepository,
    private readonly conversations: ConversationsService,
  ) {}

  /**
   * A página do histórico antes de `before`, em ordem crescente, se a Pessoa participa da Conversa
   * (LLD, "Interfaces"). Busca uma a mais para saber se há mais páginas.
   */
  async listMessages(conversationId: string, personId: string, before?: string): Promise<MessagePage> {
    await this.conversations.assertParticipant(conversationId, personId);
    const newestFirst = await this.messages.listNewestFirst(conversationId, before, HISTORY_PAGE_SIZE + 1);
    const hasMore = newestFirst.length > HISTORY_PAGE_SIZE;
    return { messages: newestFirst.slice(0, HISTORY_PAGE_SIZE).reverse(), hasMore };
  }

  /**
   * Grava a Mensagem da Pessoa na Conversa de que ela participa, com as pontas cortadas. Recusa o
   * corpo vazio depois do corte e o acima do `tamanho da Mensagem` em grafemas. O autor é a Pessoa
   * da Sessão, que vem de quem chama, para a resposta não reler a Mensagem. A repetição do
   * `client_message_id` pelo mesmo autor devolve a Mensagem já gravada, sem gravar outra (LLD,
   * "Concorrência e idempotência").
   */
  async sendMessage(
    conversationId: string,
    author: Message['author'],
    clientMessageId: string,
    rawBody: string,
  ): Promise<SentMessage> {
    const body = rawBody.trim();
    const length = countGraphemes(body);
    if (length === 0 || length > MESSAGE_MAX_LENGTH) {
      throw new ValidationFailedError([
        { field: 'body', message: `A Mensagem tem de 1 a ${MESSAGE_MAX_LENGTH} caracteres.` },
      ]);
    }
    await this.conversations.assertParticipant(conversationId, author.id);
    const message = new Message();
    message.id = uuidv7();
    message.conversationId = conversationId;
    message.authorPersonId = author.id;
    message.author = author;
    message.clientMessageId = clientMessageId;
    message.body = body;
    if (await this.messages.insert(message)) {
      return { message, created: true };
    }
    const existing = await this.messages.findByAuthorAndClientId(author.id, clientMessageId);
    existing.author = author;
    return { message: existing, created: false };
  }
}
