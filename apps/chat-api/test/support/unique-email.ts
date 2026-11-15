import { randomUUID } from 'node:crypto';

/** Um e-mail que nenhum outro teste usa, para cada teste criar os próprios dados. */
export function uniqueEmail(prefix = 'pessoa'): string {
  return `${prefix}-${randomUUID()}@teste.local`;
}
