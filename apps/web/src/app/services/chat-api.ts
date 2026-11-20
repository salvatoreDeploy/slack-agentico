import "server-only";
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
