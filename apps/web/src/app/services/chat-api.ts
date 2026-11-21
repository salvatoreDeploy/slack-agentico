import "server-only";
import { cache } from "react";
import { loadEnv } from "../../config/env";
import { SESSION_COOKIE } from "../utils/session-cookie-name";

/** A Pessoa como a API do chat a devolve. */
export interface Person {
  id: string;
  name: string;
  username: string;
  email: string;
}

/** `invalid_credentials` cobre também a entrada que a API recusa (400), como um e-mail longo demais. */
export type CreateSessionResult =
  | { status: "created"; token: string }
  | { status: "invalid_credentials" }
  | { status: "too_many_attempts" }
  | { status: "unavailable" };

export type MeResult = { status: "ok"; person: Person } | { status: "unauthenticated" };

/** A API do chat falhou por rede ou com um 5xx: a tela mostra a porta de erro. */
export class ChatApiUnavailableError extends Error {
  constructor(cause?: unknown) {
    super("A API do chat não respondeu.", { cause });
  }
}

function url(path: string): string {
  return new URL(path, loadEnv().CHAT_API_URL).toString();
}

/** Entrar: `POST /v1/sessions`. Nunca lança; a ação Entrar traduz cada resultado em mensagem. */
export async function createSession(email: string, password: string): Promise<CreateSessionResult> {
  let response: Response;
  try {
    response = await fetch(url("/v1/sessions"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
  } catch {
    return { status: "unavailable" };
  }
  if (response.status === 201) {
    const body = (await response.json()) as { token: string };
    return { status: "created", token: body.token };
  }
  if (response.status === 400 || response.status === 401) {
    return { status: "invalid_credentials" };
  }
  if (response.status === 429) {
    return { status: "too_many_attempts" };
  }
  return { status: "unavailable" };
}

/**
 * A Pessoa da Sessão: `GET /v1/me`, com o cookie de sessão repassado (LLD, "Interfaces"). Lança
 * `ChatApiUnavailableError` numa falha de rede ou num 5xx.
 */
export async function getMe(token: string): Promise<MeResult> {
  let response: Response;
  try {
    response = await fetch(url("/v1/me"), {
      headers: { cookie: `${SESSION_COOKIE}=${token}` },
      cache: "no-store",
    });
  } catch (error) {
    throw new ChatApiUnavailableError(error);
  }
  if (response.status === 200) {
    return { status: "ok", person: (await response.json()) as Person };
  }
  if (response.status === 401) {
    return { status: "unauthenticated" };
  }
  throw new ChatApiUnavailableError(response.status);
}

/**
 * Sair: `DELETE /v1/sessions/current`, com o cookie de sessão repassado. Nunca lança: a falha de
 * rede, o 5xx e o 401 terminam do mesmo jeito, com o cookie apagado pela ação Sair, e a Sessão
 * fica no banco até vencer ou ser revogada (LLD, "Sessão no cliente").
 */
export async function deleteSession(token: string): Promise<void> {
  try {
    await fetch(url("/v1/sessions/current"), {
      method: "DELETE",
      headers: { cookie: `${SESSION_COOKIE}=${token}` },
      cache: "no-store",
    });
  } catch {
    // A API fora não impede de sair deste navegador.
  }
}

export type ChangePasswordResult =
  | { status: "changed" }
  | { status: "wrong_current_password" }
  | { status: "password_unchanged" }
  /** A API recusou a entrada (400), como uma senha nova fora do `tamanho da senha`. */
  | { status: "invalid" }
  | { status: "too_many_attempts" }
  | { status: "unauthenticated" }
  | { status: "unavailable" };

const CHANGE_PASSWORD_CODES: Record<string, ChangePasswordResult["status"]> = {
  wrong_current_password: "wrong_current_password",
  password_unchanged: "password_unchanged",
};

/**
 * Trocar a senha: `PUT /v1/me/password`, com o cookie de sessão repassado. Nunca lança; a ação
 * traduz cada resultado num estado do diálogo.
 */
export async function changePassword(
  token: string,
  currentPassword: string,
  newPassword: string,
): Promise<ChangePasswordResult> {
  let response: Response;
  try {
    response = await fetch(url("/v1/me/password"), {
      method: "PUT",
      headers: { "content-type": "application/json", cookie: `${SESSION_COOKIE}=${token}` },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      cache: "no-store",
    });
  } catch {
    return { status: "unavailable" };
  }
  switch (response.status) {
    case 204:
      return { status: "changed" };
    case 400:
      return { status: "invalid" };
    case 401:
      return { status: "unauthenticated" };
    case 422: {
      const body = (await response.json().catch(() => ({}))) as { code?: string };
      const status = body.code ? CHANGE_PASSWORD_CODES[body.code] : undefined;
      return status ? { status } : { status: "unavailable" };
    }
    case 429:
      return { status: "too_many_attempts" };
    default:
      return { status: "unavailable" };
  }
}

/** Um Canal da barra lateral, como `GET /v1/channels` o devolve. */
export interface Channel {
  id: string;
  name: string;
  description: string | null;
}

export type ChannelsResult = { status: "ok"; channels: Channel[] } | { status: "unauthenticated" };

/**
 * Os Canais de que a Pessoa participa, em ordem de nome: `GET /v1/channels`. O `cache()` do React
 * faz uma chamada só por requisição, dividida entre o layout da casca e a página `/`. Lança
 * `ChatApiUnavailableError` numa falha de rede ou num 5xx.
 */
export const listChannels = cache(async (token: string): Promise<ChannelsResult> => {
  let response: Response;
  try {
    response = await fetch(url("/v1/channels"), {
      headers: { cookie: `${SESSION_COOKIE}=${token}` },
      cache: "no-store",
    });
  } catch (error) {
    throw new ChatApiUnavailableError(error);
  }
  if (response.status === 200) {
    const body = (await response.json()) as { channels: Channel[] };
    return { status: "ok", channels: body.channels };
  }
  if (response.status === 401) {
    return { status: "unauthenticated" };
  }
  throw new ChatApiUnavailableError(response.status);
});

/** Uma Conversa, como `GET /v1/conversations/:id` a devolve. Na F02, só Canal público. */
export interface Conversation {
  id: string;
  type: "public_channel";
  name: string;
  description: string | null;
  created_at: string;
  created_by: Pick<Person, "id" | "name" | "username"> | null;
}

export type ConversationResult =
  | { status: "ok"; conversation: Conversation }
  | { status: "not_found" }
  | { status: "unauthenticated" };

/**
 * A Conversa, se a Pessoa participa dela: `GET /v1/conversations/:id`. O 404 cobre o id
 * malformado, a Conversa inexistente e a sem participação (LLD, "Segurança"). Lança
 * `ChatApiUnavailableError` numa falha de rede ou num 5xx.
 */
export async function getConversation(token: string, id: string): Promise<ConversationResult> {
  let response: Response;
  try {
    response = await fetch(url(`/v1/conversations/${encodeURIComponent(id)}`), {
      headers: { cookie: `${SESSION_COOKIE}=${token}` },
      cache: "no-store",
    });
  } catch (error) {
    throw new ChatApiUnavailableError(error);
  }
  switch (response.status) {
    case 200:
      return { status: "ok", conversation: (await response.json()) as Conversation };
    case 404:
      return { status: "not_found" };
    case 401:
      return { status: "unauthenticated" };
    default:
      throw new ChatApiUnavailableError(response.status);
  }
}
