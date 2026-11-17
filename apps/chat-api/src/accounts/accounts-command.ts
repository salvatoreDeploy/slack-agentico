import { NestFactory } from '@nestjs/core';
import { ClsService } from 'nestjs-cls';
import { parseArgs } from 'node:util';
import { DomainError } from '../common/errors/domain.error.js';
import { ValidationFailedError } from '../common/errors/validation-failed.error.js';
import { normalizeEmail } from '../people/people-rules.js';
import { PeopleService, validatePersonFields } from '../people/people.service.js';
import { AccountsModule } from './accounts.module.js';

/** A entrada e a saída do comando: o terminal no `cli.ts`, uma entrada dada no teste. */
export interface AccountsCommandIo {
  /** Lê uma senha sem eco. */
  readPassword(message: string): Promise<string>;
  log(message: string): void;
  error(message: string): void;
}

const USAGE = 'Uso: pnpm accounts create <e-mail> "<nome>" [--username <u>]';

/**
 * Executa uma operação do comando de contas e devolve o código de saída do processo. A senha é
 * lida duas vezes e nunca vem de argumento nem de variável; nenhuma saída mostra a senha nem o
 * hash (spec da F01, "Comando de contas").
 */
export async function runAccountsCommand(argv: string[], io: AccountsCommandIo): Promise<number> {
  const [operation, ...rest] = argv;
  if (operation !== 'create') {
    io.error(USAGE);
    return 1;
  }
  return create(rest, io);
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

  const app = await NestFactory.createApplicationContext(AccountsModule, { logger: false });
  try {
    const people = app.get(PeopleService);
    const person = await app
      .get(ClsService)
      .run(() => people.create({ email, name, password, username: parsed.values.username }));
    io.log(`Pessoa criada: ${person.name} (@${person.username}), ${person.email}.`);
    return 0;
  } catch (error) {
    if (error instanceof DomainError) {
      io.error(`${describe(error)} Nada foi criado.`);
      return 1;
    }
    throw error;
  } finally {
    await app.close();
  }
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
