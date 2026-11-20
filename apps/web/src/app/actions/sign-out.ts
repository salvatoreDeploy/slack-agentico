"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { deleteSession } from "../services/chat-api";
import { sessionCookieOptions } from "../utils/session-cookie";
import { SESSION_COOKIE } from "../utils/session-cookie-name";

/**
 * A ação Sair (spec da F01, "BFF e telas"): apaga a Sessão na API do chat, apaga o cookie mesmo se
 * a API falhar e manda para Entrar. Apagar o cookie numa Server Action limpa o cache do roteador do
 * cliente, então voltar pelo histórico pede a tela de novo ao servidor e cai em Entrar.
 */
export async function signOut(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await deleteSession(token);
  }
  // Com os mesmos atributos da gravação: sem o mesmo `Domain`, o navegador não apaga o cookie.
  cookieStore.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  redirect("/entrar");
}
