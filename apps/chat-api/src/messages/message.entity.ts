import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Conversation } from '../conversations/conversation.entity.js';
import { Person } from '../people/person.entity.js';

/** Nome da única do autor com o id gerado no cliente (LLD, "Concorrência e idempotência"). */
export const MESSAGES_AUTHOR_CLIENT_MESSAGE_UNIQUE = 'messages_author_client_message_key';

/**
 * Mensagem: o que uma Pessoa escreve numa Conversa (GLOSSARY.md). O id é UUID v7 gerado pela API ao
 * gravar, e é a ordem do histórico e o cursor da paginação. O autor Bot, a Citação, a exclusão e
 * a marca "dados de negócio" entram com as F10, F07 e F13.
 */
@Entity({ name: 'messages' })
@Unique(MESSAGES_AUTHOR_CLIENT_MESSAGE_UNIQUE, ['authorPersonId', 'clientMessageId'])
@Index('messages_conversation_id_id_idx', ['conversationId', 'id'])
export class Message {
  @PrimaryColumn({ type: 'uuid', primaryKeyConstraintName: 'messages_pkey' })
  id: string;

  @Column({ type: 'uuid' })
  conversationId: string;

  @ManyToOne(() => Conversation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id', foreignKeyConstraintName: 'messages_conversation_id_fkey' })
  conversation: Conversation;

  @Column({ type: 'uuid' })
  authorPersonId: string;

  /** Apagar a Pessoa apaga as Mensagens dela, o que só acontece fora do produto (spec da F02). */
  @ManyToOne(() => Person, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_person_id', foreignKeyConstraintName: 'messages_author_person_id_fkey' })
  author: Person;

  @Column({ type: 'uuid' })
  clientMessageId: string;

  @Column({ type: 'text' })
  body: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
