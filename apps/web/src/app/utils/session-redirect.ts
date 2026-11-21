import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { expiredSessionPath, HOME_PATH } from "./return-path";
import { RETURN_PATH_HEADER } from "./session-cookie-name";

/** O caminho que a Pessoa pediu, com a consulta, como o `proxy` o gravou no cabeçalho. */
export async function requestedPath(): Promise<string> {
  return (await headers()).get(RETURN_PATH_HEADER) ?? HOME_PATH;
}

/**
 * A API recusou a Sessão ao renderizar: vai ao Route Handler que apaga o cookie e manda para
 * Entrar com o caminho pedido no `voltar`. É o desvio único do layout e das páginas da casca.
 */
export async function redirectToExpiredSession(): Promise<never> {
  redirect(expiredSessionPath(await requestedPath()));
}
