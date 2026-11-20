import { randomBytes } from 'node:crypto';
import { v7 as uuidv7 } from 'uuid';
import { queryTestDatabase } from './test-database.js';

/**
 * Grava uma Sessão da Pessoa direto no banco, vencendo em `expiresInMs` (negativo: já vencida), e
 * devolve o id. Para os testes que só precisam da linha, sem entrar pela rota.
 */
export async function insertSession(personId: string, expiresInMs = 60 * 60 * 1000): Promise<string> {
  const id = uuidv7();
  await queryTestDatabase(
    `INSERT INTO sessions (id, person_id, token_hash, last_used_at, expires_at)
     VALUES ($1, $2, $3, now(), now() + $4::bigint * interval '1 millisecond')`,
    [id, personId, randomBytes(32), expiresInMs],
  );
  return id;
}

/** Os ids das Sessões da Pessoa no banco. */
export async function findSessionIds(personId: string): Promise<string[]> {
  const rows = await queryTestDatabase<{ id: string }>(
    'SELECT id FROM sessions WHERE person_id = $1 ORDER BY id',
    [personId],
  );
  return rows.map((row) => row.id);
}
