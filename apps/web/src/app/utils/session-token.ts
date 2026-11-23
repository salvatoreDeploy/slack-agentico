import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./session-cookie-name";

/** O token de Sessão do cookie, para os Server Components repassarem à API do chat. */
export async function sessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}
