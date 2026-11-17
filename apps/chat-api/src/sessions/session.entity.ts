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
import { Person } from '../people/person.entity.js';

/**
 * O acesso de uma Pessoa depois de entrar (GLOSSARY.md). Guarda só o SHA-256 do token, nunca o
 * token (LLD, "Segurança"). Toda coluna declara o tipo, porque o CLI das migrações roda sem os
 * metadados de tipo.
 */
@Entity({ name: 'sessions' })
@Unique('sessions_token_hash_key', ['tokenHash'])
export class Session {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Index('sessions_person_id_idx')
  @Column({ type: 'uuid' })
  personId: string;

  @ManyToOne(() => Person, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'person_id' })
  person?: Person;

  @Column({ type: 'bytea' })
  tokenHash: Buffer;

  @Column({ type: 'timestamptz' })
  lastUsedAt: Date;

  @Index('sessions_expires_at_idx')
  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
