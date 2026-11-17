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
    const errors = validate({ ...input, email, name });
    if (errors.length > 0) {
      throw new ValidationFailedError(errors);
    }
    if (await this.people.findByEmail(email)) {
      throw new EmailTakenError();
    }
    if (input.username && (await this.people.existsByUsername(input.username))) {
      throw new UsernameTakenError();
    }

    const person = new Person();
    person.id = uuidv7();
    person.name = name;
    person.email = email;
    person.username =
      input.username ?? (await deriveUsername(email, (u) => this.people.existsByUsername(u)));
    person.passwordHash = await this.passwords.hash(input.password);

    const conflict = await this.people.insert(person);
    if (conflict === 'email') {
      throw new EmailTakenError();
    }
    if (conflict === 'username') {
      throw new UsernameTakenError();
    }
    return person;
  }

  findById(id: string): Promise<Person | null> {
    return this.people.findById(id);
  }

  findByEmail(email: string): Promise<Person | null> {
    return this.people.findByEmail(normalizeEmail(email));
  }
}

function validate(input: NewPerson): FieldError[] {
  const errors: FieldError[] = [];
  if (!isEmail(input.email) || input.email.length > EMAIL_MAX_LENGTH) {
    errors.push({ field: 'email', message: 'Informe um e-mail válido.' });
  }
  if (input.name.length < 1 || input.name.length > NAME_MAX_LENGTH) {
    errors.push({ field: 'name', message: `O nome tem de 1 a ${NAME_MAX_LENGTH} caracteres.` });
  }
  if (input.password.length < PASSWORD_MIN_LENGTH || input.password.length > PASSWORD_MAX_LENGTH) {
    errors.push({
      field: 'password',
      message: `A senha tem de ${PASSWORD_MIN_LENGTH} a ${PASSWORD_MAX_LENGTH} caracteres.`,
    });
  }
  if (input.username !== undefined && !USERNAME_PATTERN.test(input.username)) {
    errors.push({
      field: 'username',
      message: 'O @usuário tem de 3 a 30 caracteres: minúsculas, dígitos, ".", "_" e "-", começando por letra.',
    });
  }
  return errors;
}
