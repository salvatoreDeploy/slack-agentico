"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSession } from "../services/chat-api";
import { safeReturnPath } from "../utils/return-path";
import { SESSION_COOKIE, sessionCookieOptions } from "../utils/session-cookie";
import { validateSignIn, type SignInFieldErrors } from "../utils/sign-in-validation";

export interface SignInState {
  /** O e-mail digitado, que continua preenchido depois de um erro. */
  email: string;
  fieldErrors?: SignInFieldErrors;
  /** `credentials`: e-mail ou senha errados. `unavailable`: a API do chat falhou ou não respondeu. */
  error?: "credentials" | "unavailable";
  /** Muda a cada envio respondido, para a tela reagir mesmo quando o erro se repete. */
  attempt: number;
}

/**
 * A ação Entrar (spec da F01, "BFF e telas"): confere os campos, cria a Sessão na API do chat,
 * grava o cookie e manda para o `voltar` validado, ou para a Home.
 */
export async function signIn(previous: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const attempt = previous.attempt + 1;

  const fieldErrors = validateSignIn(email, password);
  if (fieldErrors) {
    return { email, fieldErrors, attempt };
  }

  const result = await createSession(email, password);
  if (result.status === "invalid_credentials" || result.status === "invalid_input") {
    return { email, error: "credentials", attempt };
  }
  if (result.status === "unavailable") {
    return { email, error: "unavailable", attempt };
  }

  (await cookies()).set(SESSION_COOKIE, result.token, sessionCookieOptions());
  redirect(safeReturnPath(formData.get("voltar")));
}
