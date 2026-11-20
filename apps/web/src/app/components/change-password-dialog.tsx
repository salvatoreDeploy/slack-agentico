"use client";

import { unstable_rethrow } from "next/navigation";
import {
  startTransition,
  useActionState,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { toast } from "sonner";
import { changePassword, type ChangePasswordState } from "../actions/change-password";
import {
  readChangePasswordFields,
  validateChangePassword,
  type ChangePasswordFieldErrors,
} from "../utils/change-password-validation";
import { Button } from "./button";
import { Dialog, DialogBody, DialogClose, DialogContent, DialogFooter, DialogHeader } from "./dialog";
import { Field, fieldErrorId } from "./field";
import { Input } from "./input";

// Textos dos frames "Diálogos / Trocar senha / <Estado>" do Pencil, donos do microtexto.
const DESCRIPTION = "Depois da troca, você continua neste navegador e sai dos outros.";
const SUCCESS_MESSAGE = "Senha trocada. Você saiu dos outros navegadores.";
/** As falhas que ficam no corpo do diálogo, com `role="alert"`. */
const FORM_MESSAGES = {
  too_many_attempts: "Muitas tentativas. Aguarde alguns minutos e tente de novo.",
  unavailable: "Não foi possível trocar a senha agora. Tente de novo em instantes.",
} as const;

const INITIAL_STATE: ChangePasswordState = { attempt: 0 };

/** Se o envio do navegador para o BFF falha, o diálogo mostra a falha no envio, sem cair no error boundary. */
async function submitChangePassword(
  previous: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  try {
    return await changePassword(previous, formData);
  } catch (error) {
    unstable_rethrow(error);
    return { error: "unavailable", attempt: previous.attempt + 1 };
  }
}

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Para onde o foco volta quando o diálogo fecha: o avatar, porque o item do menu já sumiu. */
  returnFocusTo: () => HTMLElement | null;
}

/**
 * O diálogo "Trocar senha" (spec da F01, "BFF e telas"): foco inicial na Senha atual, preso no
 * diálogo, e de volta ao avatar ao fechar. O formulário só existe com o diálogo aberto, então
 * cada abertura começa sem erros.
 */
export function ChangePasswordDialog({ open, onOpenChange, returnFocusTo }: ChangePasswordDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          document.getElementById("current-password")?.focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusTo()?.focus();
        }}
      >
        <DialogHeader title="Trocar senha" description={DESCRIPTION} />
        <ChangePasswordForm onChanged={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function ChangePasswordForm({ onChanged }: { onChanged: () => void }) {
  const [state, formAction, isPending] = useActionState(submitChangePassword, INITIAL_STATE);
  const [clientErrors, setClientErrors] = useState<ChangePasswordFieldErrors | undefined>();
  const currentRef = useRef<HTMLInputElement>(null);
  const newRef = useRef<HTMLInputElement>(null);

  // A ação também confere os campos; os avisos dela aparecem se o cliente deixar passar.
  const fieldErrors = clientErrors ?? state.fieldErrors;
  const formMessage = state.error ? FORM_MESSAGES[state.error] : undefined;

  const announceChanged = useEffectEvent(() => {
    toast.success(SUCCESS_MESSAGE);
    onChanged();
  });

  useEffect(() => {
    if (state.changed) {
      announceChanged();
      return;
    }
    if (state.fieldErrors) {
      focusFirstInvalid(state.fieldErrors, currentRef.current, newRef.current);
    }
    // Reage a cada resposta da ação, inclusive quando o erro se repete.
  }, [state]);

  /**
   * Envia pela ação numa transição, e não pelo `action` do formulário, porque o React limpa os
   * campos quando a ação de um `<form action>` termina, e eles continuam preenchidos depois de um
   * erro.
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) {
      return;
    }
    const formData = new FormData(event.currentTarget);
    const errors = validateChangePassword(readChangePasswordFields(formData));
    setClientErrors(errors);
    if (errors) {
      focusFirstInvalid(errors, currentRef.current, newRef.current);
      return;
    }
    startTransition(() => formAction(formData));
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <DialogBody>
        <Field htmlFor="current-password" label="Senha atual" error={fieldErrors?.currentPassword}>
          <Input
            ref={currentRef}
            id="current-password"
            name="current_password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(fieldErrors?.currentPassword) || undefined}
            aria-describedby={fieldErrors?.currentPassword ? fieldErrorId("current-password") : undefined}
          />
        </Field>
        <Field htmlFor="new-password" label="Senha nova" error={fieldErrors?.newPassword}>
          <Input
            ref={newRef}
            id="new-password"
            name="new_password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(fieldErrors?.newPassword) || undefined}
            aria-describedby={fieldErrors?.newPassword ? fieldErrorId("new-password") : undefined}
          />
        </Field>
        {formMessage && (
          <p role="alert" className="text-small text-danger-fg">
            {formMessage}
          </p>
        )}
      </DialogBody>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit" loading={isPending}>
          Salvar
        </Button>
      </DialogFooter>
    </form>
  );
}

/** O foco vai para o primeiro campo inválido, na ordem do diálogo. */
function focusFirstInvalid(
  errors: ChangePasswordFieldErrors,
  current: HTMLInputElement | null,
  next: HTMLInputElement | null,
) {
  (errors.currentPassword ? current : next)?.focus();
}
