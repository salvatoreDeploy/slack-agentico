import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from './people-rules.js';

/**
 * Deriva o @usuário da parte do e-mail antes do `@` (LLD, "Sessão e login", "@usuário"): passa a
 * minúsculas, tira os acentos, troca por `-` o que está fora do conjunto, põe o prefixo `p` se não
 * começar por letra, completa com `-` até o mínimo e corta no máximo. Se o resultado já existe,
 * ganha o primeiro sufixo numérico livre (`ana`, `ana2`), com o corte refeito.
 */
export async function deriveUsername(
  email: string,
  isTaken: (username: string) => Promise<boolean>,
): Promise<string> {
  const base = baseUsername(email.split('@')[0] ?? '');
  if (!(await isTaken(base))) {
    return base;
  }
  for (let suffix = 2; ; suffix++) {
    const tail = String(suffix);
    const candidate = `${base.slice(0, USERNAME_MAX_LENGTH - tail.length)}${tail}`;
    if (!(await isTaken(candidate))) {
      return candidate;
    }
  }
}

function baseUsername(localPart: string): string {
  let username = localPart
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9._-]/g, '-');
  if (!/^[a-z]/.test(username)) {
    username = `p${username}`;
  }
  return username.padEnd(USERNAME_MIN_LENGTH, '-').slice(0, USERNAME_MAX_LENGTH);
}
