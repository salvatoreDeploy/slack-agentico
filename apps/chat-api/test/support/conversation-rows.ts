import { randomUUID } from 'node:crypto';
import { queryTestDatabase } from './test-database.js';

export interface ChannelRow {
  id: string;
  name: string;
}

/**
 * Grava um Canal público direto no chat_test, com nome único, para o Arrange. Só as Pessoas de
 * `participants` participam dele; com a lista vazia, é um Canal que ninguém vê.
 */
export async function insertChannel(
  options: { prefix?: string; createdBy?: string; participants?: string[] } = {},
): Promise<ChannelRow> {
  const id = randomUUID();
  const name = `${options.prefix ?? 'canal'}-${id.slice(0, 8)}`;
  await queryTestDatabase(
    `INSERT INTO conversations (id, type, name, description, created_by)
     VALUES ($1, 'public_channel', $2, 'Canal de teste', $3)`,
    [id, name, options.createdBy ?? null],
  );
  for (const personId of options.participants ?? []) {
    await queryTestDatabase('INSERT INTO participations (conversation_id, person_id) VALUES ($1, $2)', [
      id,
      personId,
    ]);
  }
  return { id, name };
}
