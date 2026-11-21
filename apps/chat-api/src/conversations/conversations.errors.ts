import { DomainError } from '../common/errors/domain.error.js';

/**
 * Id malformado, Conversa inexistente ou Conversa sem participação de quem pede, com a mesma
 * resposta nos três casos, para não revelar que a Conversa existe (LLD, "Segurança").
 */
export class ConversationNotFoundError extends DomainError {
  readonly code = 'not_found';

  constructor() {
    super('A conversa não existe ou você não participa dela.');
  }
}
