"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createChannel as requestCreateChannel } from "../services/chat-api";
import { normalizeChannelName } from "../utils/channel-name";
import { channelPath } from "../utils/conversation-path";
import {
  CREATE_CHANNEL_FIELD_MESSAGES,
  readCreateChannelFields,
  validateCreateChannel,
  type CreateChannelFieldErrors,
} from "../utils/create-channel-validation";
import { HOME_PATH, signInPath } from "../utils/return-path";
import { sessionCookieOptions } from "../utils/session-cookie";
import { SESSION_COOKIE } from "../utils/session-cookie-name";

export interface CreateChannelState {
  fieldErrors?: CreateChannelFieldErrors;
  /** A falha que o diálogo mostra no corpo, com `role="alert"`: rede, 5xx ou uma recusa inesperada. */
  error?: "unavailable";
}

/**
 * A ação Criar canal (spec da F02, "BFF e telas"): confere os campos, chama a API do chat com o
 * cookie de sessão e, no sucesso, revalida a casca, para a barra lateral trazer o Canal novo, e
 * leva a Pessoa a ele. Um 401 apaga o cookie e manda para Entrar (LLD, "Sessão no cliente").
 */
export async function createChannel(_previous: CreateChannelState, formData: FormData): Promise<CreateChannelState> {
  const fields = readCreateChannelFields(formData);
  const fieldErrors = validateCreateChannel(fields);
  if (fieldErrors) {
    return { fieldErrors };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const result = token
    ? await requestCreateChannel(token, fields.name, fields.description)
    : ({ status: "unauthenticated" } as const);

  switch (result.status) {
    case "created":
      revalidatePath("/", "layout");
      redirect(channelPath(result.channel.id));
    case "name_taken":
      return { fieldErrors: { name: CREATE_CHANNEL_FIELD_MESSAGES.nameTaken(normalizeChannelName(fields.name)) } };
    case "unauthenticated":
      cookieStore.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
      redirect(signInPath(HOME_PATH));
    case "unavailable":
      return { error: "unavailable" };
  }
}
