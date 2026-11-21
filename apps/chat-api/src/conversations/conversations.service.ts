import { Injectable } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { Conversation } from './conversation.entity.js';
import { ConversationNotFoundError } from './conversations.errors.js';
import { ConversationsRepository } from './conversations.repository.js';

@Injectable()
export class ConversationsService {
  constructor(private readonly conversations: ConversationsRepository) {}

  /** Os Canais de que a Pessoa participa, em ordem de nome. */
  listChannels(personId: string): Promise<Conversation[]> {
    return this.conversations.listChannelsOf(personId);
  }

  /**
   * A Conversa, se a Pessoa participa dela. O id malformado nem chega ao banco e recebe o mesmo
   * erro da Conversa inexistente.
   */
  async getConversation(id: string, personId: string): Promise<Conversation> {
    const conversation = isUUID(id) ? await this.conversations.findParticipatedById(id, personId) : null;
    if (!conversation) {
      throw new ConversationNotFoundError();
    }
    return conversation;
  }

  /**
   * Grava a participação de uma Pessoa nova em todos os Canais públicos, sob o lock das
   * participações. Quem chama abre a transação, a mesma que grava a Pessoa.
   */
  async joinPublicChannels(personId: string): Promise<void> {
    await this.conversations.lockPublicChannelParticipations();
    await this.conversations.joinPublicChannels(personId);
  }
}
