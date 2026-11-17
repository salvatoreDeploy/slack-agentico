"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSession } from "../services/chat-api";
import { safeReturnPath } from "../utils/return-path";
import { sessionCookieOptions } from "../utils/session-cookie";
import { SESSION_COOKIE } from "../utils/session-cookie-name";
import { readSignInFields, validateSignIn, type SignInFieldErrors } from "../utils/sign-in-validation";

export interface SignInState {
  /** O e-mail digitado, que continua preenchido depois de um erro. */
  email: string;
  fieldErrors?: SignInFieldErrors;
  /** `credentials`: e-mail ou senha errados. `unavailable`: o envio ou a API do chat falhou. */
  error?: "credentials" | "unavailable";
  /** Muda a cada envio respondido, para a tela reagir mesmo quando o erro se repete. */
  attempt: number;
}

/**
 * A ação Entrar (spec da F01, "BFF e telas"): confere os campos, cria a Sessão na API do chat,
 * grava o cookie e manda para o `voltar` validado, ou para a Home.
 */
export async function signIn(previous: SignInState, formData: FormData): Promise<SignInState> {
  const fields = readSignInFields(formData);
  const attempt = previous.attempt + 1;

  const fieldErrors = validateSignIn(fields);
  if (fieldErrors) {
    return { email: fields.email, fieldErrors, attempt };
  }

  const result = await createSession(fields.email, fields.password);
  if (result.status !== "created") {
    const error = result.status === "invalid_credentials" ? "credentials" : "unavailable";
    return { email: fields.email, error, attempt };
  }

  (await cookies()).set(SESSION_COOKIE, result.token, sessionCookieOptions());
  redirect(safeReturnPath(formData.get("voltar")));
}
