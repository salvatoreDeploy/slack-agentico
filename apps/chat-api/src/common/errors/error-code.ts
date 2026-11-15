/**
 * Os códigos estáveis do contrato (LLD, "Erros"). Um código novo entra aqui e no mapa de
 * status do filter, na mesma tarefa.
 */
export type ErrorCode =
  | 'validation_failed'
  | 'malformed_body'
  | 'payload_too_large'
  | 'not_found'
  | 'internal_error';
