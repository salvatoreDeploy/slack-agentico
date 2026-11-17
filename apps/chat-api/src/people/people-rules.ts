/** Valores de regra das Pessoas (LLD, "Valores e configuração"). */
export const NAME_MAX_LENGTH = 80;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const EMAIL_MAX_LENGTH = 254;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;

/** O @usuário: minúsculas, dígitos, `.`, `_` e `-`, começando por letra (LLD, "@usuário"). */
export const USERNAME_PATTERN = new RegExp(
  `^[a-z][a-z0-9._-]{${USERNAME_MIN_LENGTH - 1},${USERNAME_MAX_LENGTH - 1}}$`,
);

/** O e-mail como a Pessoa o digita vira a chave única: sem espaços nas pontas e em minúsculas. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
