import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Person } from '../people/person.entity.js';

/**
 * O tipo da Conversa (GLOSSARY.md). O Canal privado e a Conversa direta entram com a F03 e a F04,
 * com `ALTER TYPE` no enum do banco.
 */
export const CONVERSATION_TYPES = ['public_channel'] as const;

export type ConversationType = (typeof CONVERSATION_TYPES)[number];

/**
 * Conversa: Canal ou Conversa direta, numa tabela só, com o tipo (ADR 0025). O nome e a descrição
 * só existem nos Canais. O índice único parcial do nome e o `CHECK` do nome por tipo são
 * declarados aqui, com o texto que o Postgres guarda, para o `migration:generate` não propor
 * apagá-los (spec da F02, "Conversas e participação").
 */
@Entity({ name: 'conversations' })
@Index('conversations_channel_name_key', ['name'], { unique: true, where: '(name IS NOT NULL)' })
@Check(
  'conversations_name_by_type',
  `(((type)::text = ANY (ARRAY['public_channel'::text, 'private_channel'::text])) = (name IS NOT NULL))`,
)
export class Conversation {
  @PrimaryColumn({ type: 'uuid', primaryKeyConstraintName: 'conversations_pkey' })
  id: string;

  @Column({ type: 'enum', enum: [...CONVERSATION_TYPES] })
  type: ConversationType;

  @Column({ type: 'text', nullable: true })
  name: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string | null;

  @ManyToOne(() => Person, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'created_by', foreignKeyConstraintName: 'conversations_created_by_fkey' })
  creator: Person | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
