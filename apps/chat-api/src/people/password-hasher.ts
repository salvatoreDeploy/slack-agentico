import { hash, verify } from '@node-rs/argon2';
import { Injectable } from '@nestjs/common';

/** Argon2id com os parâmetros da OWASP (LLD, "Segurança"); o Argon2id é o algoritmo padrão. */
const ARGON2_OPTIONS = { memoryCost: 19_456, timeCost: 2, parallelism: 1 };

/**
 * Hash fixo, com os mesmos parâmetros, de uma senha aleatória que ninguém conhece. Calculado uma
 * vez e guardado aqui, para nenhuma subida pagar um Argon2id; a conferência contra ele custa o
 * mesmo que uma conferência real.
 */
const DUMMY_HASH =
  '$argon2id$v=19$m=19456,t=2,p=1$Mm7JZJ5fxD7wLI7Ws0EF2g$a1DX+hbFiro8Ne/N9nGHVoOY1FHUQ0C86CLJmMZD/G8';

@Injectable()
export class PasswordHasher {
  hash(password: string): Promise<string> {
    return hash(password, ARGON2_OPTIONS);
  }

  verify(passwordHash: string, password: string): Promise<boolean> {
    return verify(passwordHash, password);
  }

  /**
   * Confere a senha contra o hash fixo e sempre falha. Para um e-mail inexistente, gasta o mesmo
   * tempo que uma conferência real, para a resposta não revelar se a conta existe.
   */
  async verifyAgainstDummy(password: string): Promise<false> {
    await verify(DUMMY_HASH, password);
    return false;
  }
}
