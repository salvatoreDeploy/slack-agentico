"use client";

import { MessageSquare } from "lucide-react";
import { unstable_rethrow } from "next/navigation";
import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { signIn, type SignInState } from "../actions/sign-in";
import { Button } from "../components/button";
import { Field, fieldErrorId } from "../components/field";
import { Input } from "../components/input";
import { readSignInFields, validateSignIn, type SignInFieldErrors } from "../utils/sign-in-validation";

// Textos dos frames "Login / Credenciais incorretas", "Login / Tentativas demais" e "Login / Falha
// no envio" do Pencil, donos do microtexto.
const CREDENTIALS_MESSAGE = "E-mail ou senha incorretos. Confira os dados e tente de novo.";
/** As mensagens que ficam no formulário, entre a Senha e o botão, com `role="alert"`. */
const FORM_MESSAGES = {
  too_many_attempts: "Muitas tentativas de entrar. Aguarde alguns minutos e tente de novo.",
  unavailable: "Não foi possível entrar agora. Confira sua conexão e tente de novo.",
} as const;

const INITIAL_STATE: SignInState = { email: "", attempt: 0 };

/**
 * Chama a ação Entrar. Se o envio do navegador para o BFF falha (rede, servidor fora), a tela mostra
 * a mesma falha no envio da API do chat fora, em vez de cair no error boundary. Os erros internos
 * do Next, como o redirecionamento depois de entrar, seguem adiante.
 */
async function submitSignIn(previous: SignInState, formData: FormData): Promise<SignInState> {
  try {
    return await signIn(previous, formData);
  } catch (error) {
    unstable_rethrow(error);
    return { email: readSignInFields(formData).email, error: "unavailable", attempt: previous.attempt + 1 };
  }
}

/** O foco vai para o primeiro campo inválido, na ordem da tela. */
function focusFirstInvalid(
  errors: SignInFieldErrors,
  email: HTMLInputElement | null,
  password: HTMLInputElement | null,
) {
  (errors.email ? email : password)?.focus();
}

interface SignInFormProps {
  /** O `voltar` da página pedida, já validado pela página. */
  returnPath: string;
}

/**
 * O cartão da tela Entrar, com os estados do frame "Login" (spec da F01, "BFF e telas"): foco
 * inicial no E-mail, aviso de campo vazio sem enviar, envio duplo bloqueado, credenciais
 * incorretas abaixo da Senha, e tentativas demais e falha no envio entre a Senha e o botão.
 */
export function SignInForm({ returnPath }: SignInFormProps) {
  const [state, formAction, isPending] = useActionState(submitSignIn, INITIAL_STATE);
  const [clientErrors, setClientErrors] = useState<SignInFieldErrors | undefined>();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // A ação também confere os campos, como defesa; os avisos dela aparecem se o cliente deixar passar.
  const fieldErrors = clientErrors ?? state.fieldErrors;
  const credentialsError = state.error === "credentials";
  const passwordError = fieldErrors?.password ?? (credentialsError ? CREDENTIALS_MESSAGE : undefined);
  const formMessage =
    state.error === "too_many_attempts" || state.error === "unavailable" ? FORM_MESSAGES[state.error] : undefined;

  useEffect(() => {
    if (state.attempt === 0) {
      return;
    }
    if (state.fieldErrors) {
      focusFirstInvalid(state.fieldErrors, emailRef.current, passwordRef.current);
    } else if (state.error === "credentials" && passwordRef.current) {
      passwordRef.current.value = "";
      passwordRef.current.focus();
    }
    // Reage a cada resposta da ação, inclusive quando o erro se repete.
  }, [state]);

  /**
   * Envia pela ação numa transição, e não pelo `action` do formulário, porque o React limpa os
   * campos quando a ação de um `<form action>` termina, e a spec quer o e-mail e a senha
   * preenchidos depois de "Tentativas demais" e de "Falha no envio".
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) {
      return;
    }
    const formData = new FormData(event.currentTarget);
    const errors = validateSignIn(readSignInFields(formData));
    setClientErrors(errors);
    if (errors) {
      focusFirstInvalid(errors, emailRef.current, passwordRef.current);
      return;
    }
    startTransition(() => formAction(formData));
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-6 rounded-panel bg-surface-raised p-8 shadow-2">
      <header className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-12 items-center justify-center rounded-card bg-sidebar text-sidebar-fg-strong">
          <MessageSquare className="size-6" aria-hidden />
        </span>
        <div className="flex flex-col gap-1">
          <h1 className="text-display font-black text-fg">Entrar no Full Cycle</h1>
          <p className="text-body text-fg-muted">Use o e-mail da sua conta de trabalho.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <input type="hidden" name="voltar" value={returnPath} />
        <Field htmlFor="email" label="E-mail" error={fieldErrors?.email}>
          <Input
            ref={emailRef}
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="nome@empresa.com"
            defaultValue={state.email}
            autoFocus
            aria-invalid={Boolean(fieldErrors?.email) || credentialsError || undefined}
            aria-describedby={
              fieldErrors?.email ? fieldErrorId("email") : credentialsError ? fieldErrorId("password") : undefined
            }
          />
        </Field>
        <Field htmlFor="password" label="Senha" error={passwordError}>
          <Input
            ref={passwordRef}
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(passwordError) || undefined}
            aria-describedby={passwordError ? fieldErrorId("password") : undefined}
          />
        </Field>
        {formMessage && (
          <p role="alert" className="text-small text-danger-fg">
            {formMessage}
          </p>
        )}
        <Button type="submit" size="lg" loading={isPending}>
          Entrar
        </Button>
      </form>
    </div>
  );
}
