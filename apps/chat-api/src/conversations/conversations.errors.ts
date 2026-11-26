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

/**
 * Já existe um Canal com o nome normalizado. O `detail` é genérico, e a tela diz o nome (spec da
 * F02, "Rotas da API do chat").
 */
export class ChannelNameTakenError extends DomainError {
  readonly code = 'channel_name_taken';

  constructor() {
    super('Já existe um Canal com esse nome.');
  }
}
