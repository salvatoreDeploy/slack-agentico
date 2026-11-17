import "server-only";
import { loadEnv } from "../../config/env";

interface SessionCookieOptions {
  httpOnly: true;
  secure: true;
  sameSite: "lax";
  path: "/";
  maxAge: number;
  domain?: string;
}

/** `Max-Age do cookie de sessão`: 400 dias, o teto dos navegadores (LLD, "Valores e configuração"). */
const SESSION_COOKIE_MAX_AGE_SECONDS = 400 * 24 * 60 * 60;

/**
 * Atributos do cookie de sessão (LLD, "Segurança"). A validade de verdade é decidida só pelo
 * servidor; o cookie dura mais que a Sessão de propósito. O `Secure` vale também em
 * `http://localhost`, que os navegadores tratam como contexto seguro.
 */
export function sessionCookieOptions(): SessionCookieOptions {
  const domain = loadEnv().SESSION_COOKIE_DOMAIN;
  return {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
    ...(domain ? { domain } : {}),
  };
}
