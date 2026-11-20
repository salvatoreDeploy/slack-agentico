"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSession } from "../services/chat-api";
import { safeReturnPath } from "../utils/return-path";
import { sessionCookieOptions } from "../utils/session-cookie";
import { SESSION_COOKIE } from "../utils/session-cookie-name";
import { readSignInFields, validateSignIn, type SignInFieldErrors } from "../utils/sign-in-validation";

export type SignInError = "credentials" | "too_many_attempts" | "unavailable";

export interface SignInState {
  /** O e-mail digitado, que continua preenchido depois de um erro. */
  email: string;
  fieldErrors?: SignInFieldErrors;
  /**
   * `credentials`: e-mail ou senha errados. `too_many_attempts`: o e-mail está bloqueado pelo
   * limite de tentativas. `unavailable`: o envio ou a API do chat falhou.
   */
  error?: SignInError;
  /** Muda a cada envio respondido, para a tela reagir mesmo quando o erro se repete. */
  attempt: number;
}

const SIGN_IN_ERRORS = {
  invalid_credentials: "credentials",
  too_many_attempts: "too_many_attempts",
  unavailable: "unavailable",
} as const satisfies Record<string, SignInError>;

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
    return { email: fields.email, error: SIGN_IN_ERRORS[result.status], attempt };
  }

  (await cookies()).set(SESSION_COOKIE, result.token, sessionCookieOptions());
  redirect(safeReturnPath(formData.get("voltar")));
}
