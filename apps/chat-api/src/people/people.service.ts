import { Injectable } from '@nestjs/common';
import { isEmail } from 'class-validator';
import { v7 as uuidv7 } from 'uuid';
import { FieldError, ValidationFailedError } from '../common/errors/validation-failed.error.js';
import { EmailTakenError, UsernameTakenError } from './people.errors.js';
import { PeopleRepository } from './people.repository.js';
import {
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  normalizeEmail,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_PATTERN,
} from './people-rules.js';
import { PasswordHasher } from './password-hasher.js';
import { Person } from './person.entity.js';
import { deriveUsername } from './username.js';

export interface NewPerson {
  email: string;
  name: string;
  password: string;
  /** Sem ele, o @usuário vem do e-mail. */
  username?: string;
}

@Injectable()
export class PeopleService {
  constructor(
    private readonly people: PeopleRepository,
    private readonly passwords: PasswordHasher,
  ) {}

  /** Cria a Pessoa. Recusa, sem gravar nada, uma entrada inválida e um e-mail ou @usuário já usados. */
  async create(input: NewPerson): Promise<Person> {
    const email = normalizeEmail(input.email);
    const name = input.name.trim();
    const errors = [
      ...validatePersonFields({ email, name, username: input.username }),
      ...validatePassword(input.password),
    ];
    if (errors.length > 0) {
      throw new ValidationFailedError(errors);
    }

    const person = new Person();
    person.id = uuidv7();
    person.name = name;
    person.email = email;
    person.passwordHash = await this.passwords.hash(input.password);

    // O e-mail e o @usuário já usados são recusados pela única do banco, no insert, o que vale
    // também sob concorrência. Um @usuário derivado que outra criação simultânea pegou é derivado
    // de novo, porque a Pessoa não o escolheu.
    for (let attempt = 1; ; attempt++) {
      person.username =
        input.username ?? (await deriveUsername(email, (u) => this.people.existsByUsername(u)));
      const conflict = await this.people.insert(person);
      if (conflict === null) {
        return person;
      }
      if (conflict === 'email') {
        throw new EmailTakenError();
      }
      if (input.username || attempt >= DERIVED_USERNAME_ATTEMPTS) {
        throw new UsernameTakenError();
      }
    }
  }

  /** Troca a senha, dentro do `tamanho da senha`. Quem chama decide o que fazer com as Sessões. */
  async setPassword(personId: string, password: string): Promise<void> {
    const errors = validatePassword(password);
    if (errors.length > 0) {
      throw new ValidationFailedError(errors);
    }
    await this.people.updatePasswordHash(personId, await this.passwords.hash(password));
  }

  findByEmail(email: string): Promise<Person | null> {
    return this.people.findByEmail(normalizeEmail(email));
  }
}

/** Quantas vezes um @usuário derivado é tentado de novo quando outra criação o pega antes. */
const DERIVED_USERNAME_ATTEMPTS = 3;

/**
 * Os erros dos campos de uma Pessoa nova, menos a senha. Função pura: o comando de contas a usa
 * para recusar a entrada antes de pedir a senha.
 */
export function validatePersonFields(input: Omit<NewPerson, 'password'>): FieldError[] {
  const errors: FieldError[] = [];
  if (!isEmail(input.email) || input.email.length > EMAIL_MAX_LENGTH) {
    errors.push({ field: 'email', message: 'Informe um e-mail válido.' });
  }
  if (input.name.length < 1 || input.name.length > NAME_MAX_LENGTH) {
    errors.push({ field: 'name', message: `O nome tem de 1 a ${NAME_MAX_LENGTH} caracteres.` });
  }
  if (input.username !== undefined && !USERNAME_PATTERN.test(input.username)) {
    errors.push({
      field: 'username',
      message: `O @usuário tem de ${USERNAME_MIN_LENGTH} a ${USERNAME_MAX_LENGTH} caracteres: minúsculas, dígitos, ".", "_" e "-", começando por letra.`,
    });
  }
  return errors;
}

function validatePassword(password: string): FieldError[] {
  if (password.length >= PASSWORD_MIN_LENGTH && password.length <= PASSWORD_MAX_LENGTH) {
    return [];
  }
  return [
    {
      field: 'password',
      message: `A senha tem de ${PASSWORD_MIN_LENGTH} a ${PASSWORD_MAX_LENGTH} caracteres.`,
    },
  ];
}
