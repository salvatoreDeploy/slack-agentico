import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';
import { EMAIL_MAX_LENGTH, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../people/people-rules.js';
import { Person } from '../people/person.entity.js';

/**
 * Entrada de `POST /v1/sessions`. O e-mail perde os espaços das pontas antes da validação. Todo
 * `@ApiProperty` declara o tipo, porque o `tsx` do `pnpm openapi` não emite os metadados de tipo.
 */
export class LoginDto {
  @ApiProperty({ type: String, example: 'ana@empresa.com.br', maxLength: EMAIL_MAX_LENGTH })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsEmail()
  @MaxLength(EMAIL_MAX_LENGTH)
  email: string;

  @ApiProperty({ type: String, minLength: 1, maxLength: PASSWORD_MAX_LENGTH })
  @IsString()
  @IsNotEmpty()
  @MaxLength(PASSWORD_MAX_LENGTH)
  password: string;
}

/** Entrada de `PUT /v1/me/password`, com os campos em `snake_case` (LLD, "Interfaces"). */
export class ChangePasswordDto {
  @ApiProperty({ type: String, minLength: 1, maxLength: PASSWORD_MAX_LENGTH })
  @IsString()
  @IsNotEmpty()
  @MaxLength(PASSWORD_MAX_LENGTH)
  current_password: string;

  @ApiProperty({ type: String, minLength: PASSWORD_MIN_LENGTH, maxLength: PASSWORD_MAX_LENGTH })
  @IsString()
  @Length(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH)
  new_password: string;
}

/** A Pessoa como a API a mostra. */
export class PersonResponse {
  @ApiProperty({ type: String, format: 'uuid' })
  id: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String, description: 'O @usuário, sem o @' })
  username: string;

  @ApiProperty({ type: String })
  email: string;

  static of(person: Person): PersonResponse {
    return { id: person.id, name: person.name, username: person.username, email: person.email };
  }
}

/** Saída de `POST /v1/sessions`: o token vai para o cookie de sessão gravado pelo BFF. */
export class LoginResponse {
  @ApiProperty({ type: String })
  token: string;

  @ApiProperty({ type: PersonResponse })
  person: PersonResponse;
}
