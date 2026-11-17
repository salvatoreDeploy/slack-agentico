import { Column, CreateDateColumn, Entity, PrimaryColumn, Unique, UpdateDateColumn } from 'typeorm';

/** Nomes das únicas, para o repositório saber qual campo o banco recusou. */
export const PEOPLE_EMAIL_UNIQUE = 'people_email_key';
export const PEOPLE_USERNAME_UNIQUE = 'people_username_key';

/**
 * Pessoa: quem tem conta no Workspace (GLOSSARY.md). As colunas da F01; o perfil, o papel de
 * Administrador e a Permissão de dados entram com as funcionalidades donas. Toda coluna declara o
 * tipo, porque o CLI das migrações roda sem os metadados de tipo.
 */
@Entity({ name: 'people' })
@Unique(PEOPLE_EMAIL_UNIQUE, ['email'])
@Unique(PEOPLE_USERNAME_UNIQUE, ['username'])
export class Person {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  username: string;

  @Column({ type: 'text' })
  email: string;

  @Column({ type: 'text' })
  passwordHash: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
