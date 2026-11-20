import { ErrorCode } from './error-code.js';

/**
 * Uma regra violada, lançada pelo service ou pelo guard. Carrega o código estável do contrato
 * e não sabe o status HTTP: quem traduz é o filter global. A mensagem vai para o `detail` da
 * resposta, então não traz detalhe interno.
 */
export abstract class DomainError extends Error {
  abstract readonly code: ErrorCode;

  /** Cabeçalhos que o filter grava na resposta, como o `Retry-After` de um limite. */
  get headers(): Record<string, string> | undefined {
    return undefined;
  }

  constructor(detail: string) {
    super(detail);
    this.name = new.target.name;
  }
}
