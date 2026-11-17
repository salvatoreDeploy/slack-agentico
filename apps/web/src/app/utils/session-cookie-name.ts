// Constantes que o proxy e a aplicação compartilham, sem a configuração do servidor.

/** Nome do cookie de sessão (LLD, "Segurança"). */
export const SESSION_COOKIE = "session";

/** Cabeçalho com o caminho pedido, que o proxy grava e o layout com Sessão usa como `voltar`. */
export const RETURN_PATH_HEADER = "x-return-path";
