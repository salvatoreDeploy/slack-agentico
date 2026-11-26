import { CHANNEL_DESCRIPTION_MAX_LENGTH, CHANNEL_NAME_MAX_LENGTH, normalizeChannelName } from "./channel-name";
import { countGraphemes } from "./graphemes";

export interface CreateChannelFields {
  name: string;
  description: string;
}

export interface CreateChannelFieldErrors {
  name?: string;
  description?: string;
}

/** Textos dos frames "Diálogos / Criar canal / <Estado>" do Pencil, donos do microtexto. */
export const CREATE_CHANNEL_FIELD_MESSAGES = {
  nameEmpty: "Informe o nome do canal.",
  nameInvalid: "Use letras ou números no nome.",
  nameLength: `O nome pode ter até ${CHANNEL_NAME_MAX_LENGTH} caracteres.`,
  nameTaken: (name: string) => `Já existe um canal chamado #${name}.`,
  descriptionLength: `A descrição pode ter até ${CHANNEL_DESCRIPTION_MAX_LENGTH} caracteres.`,
} as const;

export function readCreateChannelFields(formData: FormData): CreateChannelFields {
  return {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
  };
}

/**
 * Os avisos de campo do diálogo "Criar canal", iguais no cliente e na ação. Devolve `undefined`
 * quando os dois campos estão bons; o nome já usado só a API confere.
 */
export function validateCreateChannel({ name, description }: CreateChannelFields): CreateChannelFieldErrors | undefined {
  const errors: CreateChannelFieldErrors = {};
  const normalized = normalizeChannelName(name);
  if (name.trim() === "") {
    errors.name = CREATE_CHANNEL_FIELD_MESSAGES.nameEmpty;
  } else if (normalized === "") {
    errors.name = CREATE_CHANNEL_FIELD_MESSAGES.nameInvalid;
  } else if (normalized.length > CHANNEL_NAME_MAX_LENGTH) {
    errors.name = CREATE_CHANNEL_FIELD_MESSAGES.nameLength;
  }
  if (countGraphemes(description.trim()) > CHANNEL_DESCRIPTION_MAX_LENGTH) {
    errors.description = CREATE_CHANNEL_FIELD_MESSAGES.descriptionLength;
  }
  return errors.name || errors.description ? errors : undefined;
}
