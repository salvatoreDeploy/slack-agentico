export interface SignInFieldErrors {
  email?: string;
  password?: string;
}

/** Formato mínimo de e-mail para avisar antes de enviar; a conferência de verdade é da API. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Os avisos de campo da tela Entrar, iguais no cliente e na ação Entrar. Devolve `undefined`
 * quando os dois campos estão bons.
 */
export function validateSignIn(email: string, password: string): SignInFieldErrors | undefined {
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
