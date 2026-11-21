"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sendMessage as requestSendMessage, type Message } from "../services/chat-api";
import { channelPath } from "../utils/conversation-path";
import { signInPath } from "../utils/return-path";
import { sessionCookieOptions } from "../utils/session-cookie";
import { SESSION_COOKIE } from "../utils/session-cookie-name";

export type SendMessageState = { status: "sent"; message: Message } | { status: "failed" };

/**
 * Envia uma Mensagem pelo composer (spec da F02, "Envio otimista"). Um 401 apaga o cookie e manda
 * para Entrar com o `voltar` do Canal (LLD, "Sessão no cliente").
 */
export async function sendMessage(
  conversationId: string,
  clientMessageId: string,
  body: string,
): Promise<SendMessageState> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const result = token
    ? await requestSendMessage(token, conversationId, clientMessageId, body)
    : ({ status: "unauthenticated" } as const);
  if (result.status === "unauthenticated") {
    cookieStore.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
    redirect(signInPath(channelPath(conversationId)));
  }
  return result;
}
