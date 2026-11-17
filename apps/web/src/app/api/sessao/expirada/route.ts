import { NextResponse, type NextRequest } from "next/server";
import { safeReturnPath, signInPath } from "../../../utils/return-path";
import { SESSION_COOKIE } from "../../../utils/session-cookie-name";
import { sessionCookieOptions } from "../../../utils/session-cookie";

/**
 * Sessão inválida detectada ao renderizar: apaga o cookie e manda para Entrar com o `voltar`
 * validado. Existe porque um Server Component não grava cookie (LLD, "Sessão no cliente"). O
 * `Location` é relativo, para o navegador ficar no host por onde chegou.
 */
export function GET(request: NextRequest) {
  const returnPath = safeReturnPath(request.nextUrl.searchParams.get("voltar"));
  const response = new NextResponse(null, {
    status: 307,
    headers: { Location: signInPath(returnPath) },
  });
  response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  return response;
}
