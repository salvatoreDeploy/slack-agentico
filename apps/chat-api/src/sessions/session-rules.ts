import { createHash, randomBytes } from 'node:crypto';

/** Nome do cookie de sessão (LLD, "Segurança"). */
export const SESSION_COOKIE = 'session';

/** `duração da sessão`: 30 dias desde a última atividade (LLD, "Valores e configuração"). */
export const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

/** Token de 32 bytes aleatórios em base64url, entregue só na resposta do login. */
export function newSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

/** O que o banco guarda do token: o SHA-256 dele, para quem lê o banco não se passar por ninguém. */
export function hashSessionToken(token: string): Buffer {
  return createHash('sha256').update(token).digest();
}
