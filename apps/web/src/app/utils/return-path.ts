/** Para onde a Pessoa vai depois de entrar quando não há `voltar` válido. */
export const HOME_PATH = "/";

/** Origem fictícia, só para resolver o `voltar` e conferir se ele continua no produto. */
const SAME_ORIGIN = "http://produto.invalid";

/**
 * O `voltar` que a ação Entrar aceita: um caminho do produto (LLD, "Sessão no cliente"). O valor é
 * resolvido como o navegador o resolveria, para variações como `/\t/outro-site`, que o navegador
 * transforma em `//outro-site`, não virarem um redirecionamento aberto. Qualquer outro valor leva
 * à Home.
 */
export function safeReturnPath(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return HOME_PATH;
  }
  let url: URL;
  try {
    url = new URL(value, SAME_ORIGIN);
  } catch {
    return HOME_PATH;
  }
  if (url.origin !== SAME_ORIGIN) {
    return HOME_PATH;
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

/** O endereço da tela Entrar, com o `voltar` da página pedida. */
export function signInPath(returnPath: string): string {
  return returnPath === HOME_PATH ? "/entrar" : `/entrar?voltar=${encodeURIComponent(returnPath)}`;
}

/**
 * O Route Handler que apaga o cookie de uma Sessão que a API recusou e manda para Entrar, porque
 * um Server Component não grava cookie (LLD, "Sessão no cliente").
 */
export function expiredSessionPath(returnPath: string): string {
  return `/api/sessao/expirada?voltar=${encodeURIComponent(returnPath)}`;
}
