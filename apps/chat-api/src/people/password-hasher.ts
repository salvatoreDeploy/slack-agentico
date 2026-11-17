import { hash, verify } from '@node-rs/argon2';
import { Injectable, OnModuleInit } from '@nestjs/common';

/** Argon2id com os parâmetros da OWASP (LLD, "Segurança"); o Argon2id é o algoritmo padrão. */
const ARGON2_OPTIONS = { memoryCost: 19_456, timeCost: 2, parallelism: 1 };

/** Senha qualquer, só para gerar o hash fixo da conferência de e-mail inexistente. */
const DUMMY_PASSWORD = 'senha-que-nenhuma-pessoa-tem';

@Injectable()
export class PasswordHasher implements OnModuleInit {
  private dummyHash = '';

  /** Gera, na subida, o hash fixo usado quando o e-mail não existe. */
  async onModuleInit(): Promise<void> {
    this.dummyHash = await this.hash(DUMMY_PASSWORD);
  }

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
    await verify(this.dummyHash, password);
    return false;
  }
}
