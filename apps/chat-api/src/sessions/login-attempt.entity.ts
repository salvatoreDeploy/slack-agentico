import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/**
 * As falhas de login de um e-mail normalizado, exista a conta ou não (ADR 0023). A chave é o
 * próprio e-mail, sem referência a `people`, e a linha é sobrescrita, nunca referenciada (spec da
 * F01, "Limite de tentativas de login"). Toda coluna declara o tipo, porque o CLI das migrações
 * roda sem os metadados de tipo.
 */
@Entity({ name: 'login_attempts' })
export class LoginAttempt {
  @PrimaryColumn({ type: 'text', primaryKeyConstraintName: 'login_attempts_pkey' })
  email: string;

  @Column({ type: 'integer' })
  failures: number;

  @Column({ type: 'timestamptz' })
  windowStartedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  blockedUntil: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
