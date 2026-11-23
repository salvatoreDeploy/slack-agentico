import { DomainError } from '../common/errors/domain.error.js';

/**
 * O autor reenviou um `client_message_id` que ele já usou em outra Conversa. Só um cliente com
 * defeito faz isso, porque cada envio ganha um id novo; a API recusa em vez de devolver a Mensagem
 * de outra Conversa (spec da F02, "Rotas da API do chat").
 */
export class ClientMessageIdConflictError extends DomainError {
  readonly code = 'client_message_id_conflict';

  constructor() {
    super('Este identificador de Mensagem já foi usado em outra conversa.');
  }
}
