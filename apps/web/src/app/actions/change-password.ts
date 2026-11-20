"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { changePassword as requestPasswordChange } from "../services/chat-api";
import {
  CHANGE_PASSWORD_FIELD_MESSAGES,
  readChangePasswordFields,
  validateChangePassword,
  type ChangePasswordFieldErrors,
} from "../utils/change-password-validation";
import { HOME_PATH, signInPath } from "../utils/return-path";
import { sessionCookieOptions } from "../utils/session-cookie";
import { SESSION_COOKIE } from "../utils/session-cookie-name";

export interface ChangePasswordState {
  fieldErrors?: ChangePasswordFieldErrors;
  /** As falhas que o diálogo mostra no corpo, com `role="alert"`. */
  error?: "too_many_attempts" | "unavailable";
  /** A senha foi trocada: o diálogo fecha e mostra o toast. */
  changed?: boolean;
  /** Muda a cada envio respondido, para o diálogo reagir mesmo quando o erro se repete. */
  attempt: number;
}

/**
 * A ação Trocar senha (spec da F01, "BFF e telas"): confere os campos, chama a API do chat com o
 * cookie de sessão e devolve o estado do diálogo. Um 401 apaga o cookie e manda para Entrar
 * (LLD, "Sessão no cliente"). A senha nunca volta no estado.
 */
export async function changePassword(
  previous: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const attempt = previous.attempt + 1;
  const fields = readChangePasswordFields(formData);
  const fieldErrors = validateChangePassword(fields);
  if (fieldErrors) {
    return { fieldErrors, attempt };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const result = token
    ? await requestPasswordChange(token, fields.currentPassword, fields.newPassword)
    : ({ status: "unauthenticated" } as const);

  switch (result.status) {
    case "changed":
      return { changed: true, attempt };
    case "wrong_current_password":
      return { fieldErrors: { currentPassword: CHANGE_PASSWORD_FIELD_MESSAGES.currentWrong }, attempt };
    case "password_unchanged":
      return { fieldErrors: { newPassword: CHANGE_PASSWORD_FIELD_MESSAGES.newUnchanged }, attempt };
    case "invalid":
      return { fieldErrors: { newPassword: CHANGE_PASSWORD_FIELD_MESSAGES.newLength }, attempt };
    case "too_many_attempts":
      return { error: "too_many_attempts", attempt };
    case "unauthenticated":
      cookieStore.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
      redirect(signInPath(HOME_PATH));
    case "unavailable":
      return { error: "unavailable", attempt };
  }
}
