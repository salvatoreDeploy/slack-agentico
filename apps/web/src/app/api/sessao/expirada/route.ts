import { NextResponse, type NextRequest } from "next/server";
import { ChatApiUnavailableError, getMe } from "../../../services/chat-api";
import { safeReturnPath, signInPath } from "../../../utils/return-path";
import { sessionCookieOptions } from "../../../utils/session-cookie";
import { SESSION_COOKIE } from "../../../utils/session-cookie-name";

/**
 * Sessão inválida detectada ao renderizar: apaga o cookie e manda para Entrar com o `voltar`
 * validado. Existe porque um Server Component não grava cookie (LLD, "Sessão no cliente"). Antes
 * de apagar, confere a Sessão de novo: se ela ainda vale, só volta à página, para outro site não
 * conseguir tirar alguém do chat com um link. O `Location` é relativo, para o navegador ficar no
 * host por onde chegou.
 */
export async function GET(request: NextRequest) {
  const returnPath = safeReturnPath(request.nextUrl.searchParams.get("voltar"));
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token && (await isStillValid(token))) {
    return redirectTo(returnPath);
  }
  const response = redirectTo(signInPath(returnPath));
  response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  return response;
}

function redirectTo(location: string): NextResponse {
  return new NextResponse(null, { status: 307, headers: { Location: location } });
}

/** Com a API fora, não dá para saber: o cookie fica, e a página mostra a porta de erro. */
async function isStillValid(token: string): Promise<boolean> {
  try {
    return (await getMe(token)).status === "ok";
  } catch (error) {
    if (error instanceof ChatApiUnavailableError) {
      return true;
    }
    throw error;
  }
}
