export interface SignInFields {
  email: string;
  password: string;
}

export interface SignInFieldErrors {
  email?: string;
  password?: string;
}

/** Formato mínimo de e-mail para avisar antes de enviar; a conferência de verdade é da API. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Os campos do formulário Entrar: o e-mail sem espaços nas pontas e a senha como veio. */
export function readSignInFields(formData: FormData): SignInFields {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

/**
 * Os avisos de campo da tela Entrar, iguais no cliente e na ação Entrar. Devolve `undefined`
 * quando os dois campos estão bons.
 */
export function validateSignIn({ email, password }: SignInFields): SignInFieldErrors | undefined {
  const errors: SignInFieldErrors = {};
  if (!email) {
    errors.email = "Informe seu e-mail.";
  } else if (!EMAIL_SHAPE.test(email)) {
    errors.email = "Informe um e-mail válido, como nome@empresa.com.";
  }
  if (!password) {
    errors.password = "Informe sua senha.";
  }
  return errors.email || errors.password ? errors : undefined;
}
