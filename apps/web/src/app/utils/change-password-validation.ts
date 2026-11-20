/** `tamanho da senha` (LLD, "Valores e configuração"). */
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

export interface ChangePasswordFields {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordFieldErrors {
  currentPassword?: string;
  newPassword?: string;
}

/** Textos dos frames "Diálogos / Trocar senha / <Estado>" do Pencil, donos do microtexto. */
export const CHANGE_PASSWORD_FIELD_MESSAGES = {
  currentEmpty: "Informe sua senha atual.",
  currentWrong: "Senha atual incorreta.",
  newLength: `A senha nova tem de ter de ${PASSWORD_MIN_LENGTH} a ${PASSWORD_MAX_LENGTH} caracteres.`,
  newUnchanged: "A senha nova tem de ser diferente da atual.",
} as const;

export function readChangePasswordFields(formData: FormData): ChangePasswordFields {
  return {
    currentPassword: String(formData.get("current_password") ?? ""),
    newPassword: String(formData.get("new_password") ?? ""),
  };
}

/**
 * Os avisos de campo do diálogo "Trocar senha", iguais no cliente e na ação. Devolve `undefined`
 * quando os dois campos estão bons; a senha igual à atual só a API confere.
 */
export function validateChangePassword({
  currentPassword,
  newPassword,
}: ChangePasswordFields): ChangePasswordFieldErrors | undefined {
  const errors: ChangePasswordFieldErrors = {};
  if (!currentPassword) {
    errors.currentPassword = CHANGE_PASSWORD_FIELD_MESSAGES.currentEmpty;
  }
  if (newPassword.length < PASSWORD_MIN_LENGTH || newPassword.length > PASSWORD_MAX_LENGTH) {
    errors.newPassword = CHANGE_PASSWORD_FIELD_MESSAGES.newLength;
  }
  return errors.currentPassword || errors.newPassword ? errors : undefined;
}
