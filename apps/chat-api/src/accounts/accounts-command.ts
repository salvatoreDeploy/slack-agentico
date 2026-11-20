import { TransactionHost } from '@nestjs-cls/transactional';
import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ClsService } from 'nestjs-cls';
import { parseArgs } from 'node:util';
import { DomainError } from '../common/errors/domain.error.js';
import { ValidationFailedError } from '../common/errors/validation-failed.error.js';
import { normalizeEmail } from '../people/people-rules.js';
import { PeopleService, validatePersonFields } from '../people/people.service.js';
import { Person } from '../people/person.entity.js';
import { SessionsService } from '../sessions/sessions.service.js';
import { AccountsModule } from './accounts.module.js';

/** A entrada e a saída do comando: o terminal no `cli.ts`, uma entrada dada no teste. */
export interface AccountsCommandIo {
  /** Lê uma senha sem eco. */
  readPassword(message: string): Promise<string>;
  log(message: string): void;
  error(message: string): void;
}

const USAGE = [
  'Uso: pnpm accounts create <e-mail> "<nome>" [--username <u>]',
  '     pnpm accounts reset-password <e-mail>',
  '     pnpm accounts revoke-sessions <e-mail>',
  '     pnpm accounts purge-expired-sessions',
].join('\n');

/**
 * Executa uma operação do comando de contas e devolve o código de saída do processo. A senha é
 * lida duas vezes e nunca vem de argumento nem de variável; nenhuma saída mostra a senha nem o
 * hash (spec da F01, "Comando de contas").
 */
export async function runAccountsCommand(argv: string[], io: AccountsCommandIo): Promise<number> {
  const [operation, ...rest] = argv;
  switch (operation) {
    case 'create':
      return create(rest, io);
    case 'reset-password':
      return withEmail(rest, io, resetPassword);
    case 'revoke-sessions':
      return withEmail(rest, io, revokeSessions);
    case 'purge-expired-sessions':
      return rest.length === 0 ? withContext((app) => purgeExpiredSessions(app, io)) : usage(io);
    default:
      return usage(io);
  }
}

function usage(io: AccountsCommandIo): number {
  io.error(USAGE);
  return 1;
}

/** Sobe o contexto do Nest sem HTTP, roda o trabalho num contexto do cls e fecha. */
async function withContext(work: (app: INestApplicationContext) => Promise<number>): Promise<number> {
  const app = await NestFactory.createApplicationContext(AccountsModule, { logger: false });
  try {
    return await app.get(ClsService).run(() => work(app));
  } finally {
    await app.close();
  }
}

type EmailOperation = (
  app: INestApplicationContext,
  person: Person,
  io: AccountsCommandIo,
) => Promise<number>;

/** As operações que recebem só o e-mail: recusam o e-mail sem Pessoa antes de qualquer outra coisa. */
function withEmail(args: string[], io: AccountsCommandIo, operation: EmailOperation): Promise<number> {
  if (args.length !== 1) {
    return Promise.resolve(usage(io));
  }
  const email = normalizeEmail(args[0]);
  return withContext(async (app) => {
    const person = await app.get(PeopleService).findByEmail(email);
    if (!person) {
      io.error(`Nenhuma Pessoa com o e-mail ${email}. Confira o e-mail; nada mudou.`);
      return 1;
    }
    return operation(app, person, io);
  });
}

/**
 * Troca a senha e revoga todas as Sessões, numa transação só (LLD, "Sessão e login"). O e-mail já
 * foi conferido, para o Operador não digitar a senha à toa.
 */
async function resetPassword(
  app: INestApplicationContext,
  person: Person,
  io: AccountsCommandIo,
): Promise<number> {
  const password = await io.readPassword('Senha nova:');
  const confirmation = await io.readPassword('Repita a senha nova:');
  if (password !== confirmation) {
    io.error('As duas senhas digitadas são diferentes. Nada mudou.');
    return 1;
  }
  try {
    const revoked = await app.get(TransactionHost).withTransaction(async () => {
      await app.get(PeopleService).setPassword(person.id, password);
      return app.get(SessionsService).revokeAll(person.id);
    });
    io.log(`Senha redefinida; Sessões revogadas: ${revoked}.`);
    return 0;
  } catch (error) {
    if (error instanceof DomainError) {
      io.error(`${describe(error)} Nada mudou.`);
      return 1;
    }
    throw error;
  }
}

async function revokeSessions(
  app: INestApplicationContext,
  person: Person,
  io: AccountsCommandIo,
): Promise<number> {
  const revoked = await app.get(SessionsService).revokeAll(person.id);
  io.log(`Sessões revogadas: ${revoked}.`);
  return 0;
}

async function purgeExpiredSessions(app: INestApplicationContext, io: AccountsCommandIo): Promise<number> {
  const purged = await app.get(SessionsService).purgeExpired();
  io.log(`Sessões vencidas apagadas: ${purged}.`);
  return 0;
}

async function create(args: string[], io: AccountsCommandIo): Promise<number> {
  let parsed: ReturnType<typeof parseCreate>;
  try {
    parsed = parseCreate(args);
  } catch {
    io.error(USAGE);
    return 1;
  }
  const [email, name] = parsed.positionals;
  if (!email || name === undefined || parsed.positionals.length > 2) {
    io.error(USAGE);
    return 1;
  }
  // Recusa a entrada antes de pedir a senha, para o Operador não digitá-la à toa.
  const fieldErrors = validatePersonFields({
    email: normalizeEmail(email),
    name: name.trim(),
    username: parsed.values.username,
  });
  if (fieldErrors.length > 0) {
    io.error(`${describe(new ValidationFailedError(fieldErrors))} Nada foi criado.`);
    return 1;
  }

  const password = await io.readPassword('Senha:');
  const confirmation = await io.readPassword('Repita a senha:');
  if (password !== confirmation) {
    io.error('As duas senhas digitadas são diferentes. Nada foi criado.');
    return 1;
  }

  return withContext(async (app) => {
    try {
      const person = await app
        .get(PeopleService)
        .create({ email, name, password, username: parsed.values.username });
      io.log(`Pessoa criada: ${person.name} (@${person.username}), ${person.email}.`);
      return 0;
    } catch (error) {
      if (error instanceof DomainError) {
        io.error(`${describe(error)} Nada foi criado.`);
        return 1;
      }
      throw error;
    }
  });
}

function parseCreate(args: string[]) {
  return parseArgs({
    args,
    allowPositionals: true,
    strict: true,
    options: { username: { type: 'string' } },
  });
}

function describe(error: DomainError): string {
  if (error instanceof ValidationFailedError) {
    return error.errors.map((fieldError) => fieldError.message).join(' ');
  }
  return error.message;
}
