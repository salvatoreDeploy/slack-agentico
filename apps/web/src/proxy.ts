import { NextResponse, type NextRequest } from "next/server";
import { signInPath } from "./app/utils/return-path";
import { RETURN_PATH_HEADER, SESSION_COOKIE } from "./app/utils/session-cookie-name";

/**
 * Confere só se o cookie de sessão existe; sem ele, manda para Entrar com o `voltar`. A validação
 * de verdade é da API do chat (LLD, "Sessão no cliente").
 */
export function proxy(request: NextRequest) {
  const returnPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (!request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL(signInPath(returnPath), request.url));
  }
  const headers = new Headers(request.headers);
  headers.set(RETURN_PATH_HEADER, returnPath);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Tudo menos a tela Entrar, as rotas do BFF e os arquivos do Next, com o segmento inteiro
  // conferido, para `/entrar-convite` ou `/apis` não escaparem.
  matcher: ["/((?!entrar(?:/|$)|api/|_next/|favicon\\.ico$).*)"],
};
