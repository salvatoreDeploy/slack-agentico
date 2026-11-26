import { Transactional } from '@nestjs-cls/transactional';
import { Injectable } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { v7 as uuidv7 } from 'uuid';
import { FieldError, ValidationFailedError } from '../common/errors/validation-failed.error.js';
import { countGraphemes } from '../messages/graphemes.js';
import {
  CHANNEL_DESCRIPTION_MAX_LENGTH,
  CHANNEL_NAME_MAX_LENGTH,
  normalizeChannelDescription,
  normalizeChannelName,
} from './channel-name.js';
import { Conversation } from './conversation.entity.js';
import { ChannelNameTakenError, ConversationNotFoundError } from './conversations.errors.js';
import { ConversationsRepository } from './conversations.repository.js';

@Injectable()
export class ConversationsService {
  constructor(private readonly conversations: ConversationsRepository) {}

  /** Os Canais de que a Pessoa participa, em ordem de nome. */
  listChannels(personId: string): Promise<Conversation[]> {
    return this.conversations.listChannelsOf(personId);
  }

  /**
   * Cria o Canal público com o nome normalizado e a descrição tratada, e grava a participação de
   * todas as Pessoas, sob o lock das participações, para uma conta criada ao mesmo tempo não ficar
   * fora dele (spec da F02, "Conversas e participação"). O nome já usado é conferido pelo índice
   * único, e não por uma leitura antes, para duas criações simultâneas não passarem as duas.
   */
  @Transactional()
  async createChannel(personId: string, rawName: string, rawDescription?: string | null): Promise<Conversation> {
    const name = normalizeChannelName(rawName);
    const description = normalizeChannelDescription(rawDescription ?? '');
    const errors: FieldError[] = [];
    if (name.length === 0 || name.length > CHANNEL_NAME_MAX_LENGTH) {
      errors.push({
        field: 'name',
        message: `O nome tem de 1 a ${CHANNEL_NAME_MAX_LENGTH} letras ou números, depois da normalização.`,
      });
    }
    if (description !== null && countGraphemes(description) > CHANNEL_DESCRIPTION_MAX_LENGTH) {
      errors.push({
        field: 'description',
        message: `A descrição tem até ${CHANNEL_DESCRIPTION_MAX_LENGTH} caracteres.`,
      });
    }
    if (errors.length > 0) {
      throw new ValidationFailedError(errors);
    }
    await this.conversations.lockPublicChannelParticipations();
    const channel = new Conversation();
    channel.id = uuidv7();
    channel.type = 'public_channel';
    channel.name = name;
    channel.description = description;
    channel.createdBy = personId;
    if (!(await this.conversations.insertChannel(channel))) {
      throw new ChannelNameTakenError();
    }
    await this.conversations.joinAllPeople(channel.id);
    return channel;
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
