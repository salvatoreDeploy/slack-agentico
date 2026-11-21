import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Injectable } from '@nestjs/common';
import { Conversation } from './conversation.entity.js';

/**
 * Chave do lock consultivo que serializa a gravação das participações nos Canais públicos: a
 * criação de conta e a criação de Canal o tomam, para nenhuma Pessoa ficar fora de um Canal criado
 * ao mesmo tempo que ela (spec da F02, "Conversas e participação").
 */
const PUBLIC_CHANNEL_PARTICIPATIONS_LOCK = 2_024_0201;

@Injectable()
export class ConversationsRepository {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get conversations() {
    return this.txHost.tx.getRepository(Conversation);
  }

  /** Os Canais de que a Pessoa participa, em ordem de nome. */
  listChannelsOf(personId: string): Promise<Conversation[]> {
    return this.conversations
      .createQueryBuilder('conversation')
      .innerJoin('participations', 'participation', 'participation.conversation_id = conversation.id')
      .where('participation.person_id = :personId', { personId })
      .andWhere('conversation.type = :type', { type: 'public_channel' })
      .orderBy('conversation.name', 'ASC')
      .getMany();
  }

  /** A Conversa, com o criador, se a Pessoa participa dela; senão, `null`. */
  findParticipatedById(id: string, personId: string): Promise<Conversation | null> {
    return this.conversations
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.creator', 'creator')
      .innerJoin('participations', 'participation', 'participation.conversation_id = conversation.id')
      .where('conversation.id = :id', { id })
      .andWhere('participation.person_id = :personId', { personId })
      .getOne();
  }

  /** Grava a participação da Pessoa em todos os Canais públicos; o par repetido é ignorado. */
  async joinPublicChannels(personId: string): Promise<void> {
    await this.txHost.tx.query(
      `INSERT INTO participations (conversation_id, person_id)
       SELECT id, $1 FROM conversations WHERE type = 'public_channel'
       ON CONFLICT DO NOTHING`,
      [personId],
    );
  }

  /** Toma o lock das participações nos Canais públicos até o fim da transação atual. */
  async lockPublicChannelParticipations(): Promise<void> {
    await this.txHost.tx.query('SELECT pg_advisory_xact_lock($1)', [PUBLIC_CHANNEL_PARTICIPATIONS_LOCK]);
  }
}
