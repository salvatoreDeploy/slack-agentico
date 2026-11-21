import { v7 as uuidv7 } from 'uuid';
import { queryTestDatabase } from './test-database.js';

/**
 * Grava `count` Mensagens da Pessoa no Canal, direto no chat_test, na ordem dos corpos `"1"` a
 * `"<count>"`, para o Arrange de um histórico longo. Devolve os ids na mesma ordem.
 */
export async function insertMessages(channelId: string, authorId: string, count: number): Promise<string[]> {
  const ids = Array.from({ length: count }, () => uuidv7());
  await queryTestDatabase(
    `INSERT INTO messages (id, conversation_id, author_person_id, client_message_id, body)
     SELECT id, $1, $2, gen_random_uuid(), ord::text
     FROM unnest($3::uuid[]) WITH ORDINALITY AS t(id, ord)`,
    [channelId, authorId, ids],
  );
  return ids;
}

/** Troca o nome da Pessoa direto no banco, como fará o perfil da F09. */
export async function renamePerson(personId: string, name: string): Promise<void> {
  await queryTestDatabase('UPDATE people SET name = $2 WHERE id = $1', [personId, name]);
}
