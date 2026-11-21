import { CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { Person } from '../people/person.entity.js';
import { Conversation } from './conversation.entity.js';

/**
 * Participação de uma Pessoa numa Conversa. Todo Canal público tem a de todas as Pessoas
 * (ADR 0024). O par é a identidade, e a linha nunca é referenciada sozinha.
 */
@Entity({ name: 'participations' })
@Index('participations_person_id_idx', ['personId'])
export class Participation {
  @PrimaryColumn({ type: 'uuid', primaryKeyConstraintName: 'participations_pkey' })
  conversationId: string;

  @PrimaryColumn({ type: 'uuid', primaryKeyConstraintName: 'participations_pkey' })
  personId: string;

  @ManyToOne(() => Conversation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id', foreignKeyConstraintName: 'participations_conversation_id_fkey' })
  conversation: Conversation;

  @ManyToOne(() => Person, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'person_id', foreignKeyConstraintName: 'participations_person_id_fkey' })
  person: Person;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
