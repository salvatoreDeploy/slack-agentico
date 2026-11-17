/** Para onde a Pessoa vai depois de entrar quando não há `voltar` válido. */
export const HOME_PATH = "/";

/**
 * O `voltar` que a ação Entrar aceita: um caminho do produto, que começa com `/` e não com `//`
 * nem `/\`, para não virar um redirecionamento aberto (LLD, "Sessão no cliente"). Qualquer outro
 * valor leva à Home.
 */
export function safeReturnPath(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return HOME_PATH;
  }
  if (value.startsWith("//") || value.startsWith("/\\")) {
    return HOME_PATH;
  }
  return value;
}

/** O endereço da tela Entrar, com o `voltar` da página pedida. */
export function signInPath(returnPath: string): string {
  return returnPath === HOME_PATH ? "/entrar" : `/entrar?voltar=${encodeURIComponent(returnPath)}`;
}
