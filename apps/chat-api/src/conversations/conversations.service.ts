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
   * Confere que a Pessoa participa da Conversa, sem carregá-la, para quem só precisa do acesso,
   * como as Mensagens. O id malformado e a Conversa inexistente recebem o mesmo erro.
   */
  async assertParticipant(id: string, personId: string): Promise<void> {
    if (!isUUID(id) || !(await this.conversations.isParticipant(id, personId))) {
      throw new ConversationNotFoundError();
    }
  }

  /**
   * Toma o lock das participações nos Canais públicos até o fim da transação de quem chama: a
   * criação de conta e a de Canal o tomam antes de gravar, para nenhuma Pessoa ficar fora de um
   * Canal criado ao mesmo tempo que ela.
   */
  lockPublicChannelParticipations(): Promise<void> {
    return this.conversations.lockPublicChannelParticipations();
  }

  /**
   * Grava a participação de uma Pessoa nova em todos os Canais públicos. Quem chama abre a
   * transação, a mesma que grava a Pessoa, e já tomou o lock das participações.
   */
  joinPublicChannels(personId: string): Promise<void> {
    return this.conversations.joinPublicChannels(personId);
  }
}
