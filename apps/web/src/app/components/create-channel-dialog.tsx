"use client";

import { Plus } from "lucide-react";
import { unstable_rethrow, usePathname } from "next/navigation";
import { Dialog as DialogPrimitive } from "radix-ui";
import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { createChannel, type CreateChannelState } from "../actions/create-channel";
import { CHANNEL_DESCRIPTION_MAX_LENGTH, normalizeChannelName } from "../utils/channel-name";
import {
  readCreateChannelFields,
  validateCreateChannel,
  type CreateChannelFieldErrors,
} from "../utils/create-channel-validation";
import { countGraphemes } from "../utils/graphemes";
import { Button } from "./button";
import { Dialog, DialogBody, DialogClose, DialogContent, DialogFooter, DialogHeader } from "./dialog";
import { Field, fieldErrorId, fieldHintId } from "./field";
import { Input } from "./input";

// Textos dos frames "Diálogos / Criar canal / <Estado>" do Pencil, donos do microtexto.
const DESCRIPTION = "Canais organizam a conversa por assunto, projeto ou time.";
const NAME_HINT = "Minúsculas, sem espaços. Ex.: planejamento-q4";
const FAILURE_MESSAGE = "Não foi possível criar o canal. Tente de novo.";

const NAME_ID = "channel-name";
const DESCRIPTION_ID = "channel-description";

const INITIAL_STATE: CreateChannelState = { attempt: 0 };

/** Se o envio do navegador para o BFF falha, o diálogo mostra a falha, sem cair no error boundary. */
async function submitCreateChannel(previous: CreateChannelState, formData: FormData): Promise<CreateChannelState> {
  try {
    return await createChannel(previous, formData);
  } catch (error) {
    unstable_rethrow(error);
    return { error: "unavailable", attempt: previous.attempt + 1 };
  }
}

/**
 * "Adicionar canal", no fim da seção Canais, e o diálogo "Criar canal" que ela abre (spec da F02,
 * "BFF e telas"). O foco começa no Nome, fica preso no diálogo e volta a "Adicionar canal" ao
 * fechar. No sucesso, a ação leva ao Canal novo, e o diálogo fecha com a troca de endereço.
 */
export function CreateChannelDialog() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [openedAt, setOpenedAt] = useState(pathname);
  if (openedAt !== pathname) {
    setOpenedAt(pathname);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger className="flex h-7 w-full items-center gap-2 rounded-item px-2 text-body text-sidebar-fg hover:bg-sidebar-hover">
        <Plus className="size-4" aria-hidden />
        <span className="truncate">Adicionar canal</span>
      </DialogPrimitive.Trigger>
      <DialogContent
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          document.getElementById(NAME_ID)?.focus();
        }}
      >
        <DialogHeader title="Criar canal" description={DESCRIPTION} />
        <CreateChannelForm />
      </DialogContent>
    </Dialog>
  );
}

function CreateChannelForm() {
  const [state, formAction, isPending] = useActionState(submitCreateChannel, INITIAL_STATE);
  const [clientErrors, setClientErrors] = useState<CreateChannelFieldErrors | undefined>();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  // A ação também confere os campos; os avisos dela aparecem se o cliente deixar passar.
  const fieldErrors = clientErrors ?? state.fieldErrors;
  const normalized = normalizeChannelName(name);
  const nameHint = normalized ? `O canal vai se chamar #${normalized}.` : NAME_HINT;

  useEffect(() => {
    if (state.fieldErrors) {
      focusFirstInvalid(state.fieldErrors, nameRef.current, descriptionRef.current);
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
    const errors = validateCreateChannel(readCreateChannelFields(formData));
    setClientErrors(errors);
    if (errors) {
      focusFirstInvalid(errors, nameRef.current, descriptionRef.current);
      return;
    }
    startTransition(() => formAction(formData));
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <DialogBody>
        <Field htmlFor={NAME_ID} label="Nome" error={fieldErrors?.name} hint={nameHint}>
          <Input
            ref={nameRef}
            id={NAME_ID}
            name="name"
            autoComplete="off"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={Boolean(fieldErrors?.name) || undefined}
            aria-describedby={fieldErrors?.name ? fieldErrorId(NAME_ID) : fieldHintId(NAME_ID)}
          />
        </Field>
        <Field
          htmlFor={DESCRIPTION_ID}
          label={
            <>
              Descrição <span className="font-normal text-fg-muted">(opcional)</span>
            </>
          }
          error={fieldErrors?.description}
          hint={
            <span className="flex justify-end">
              {countGraphemes(description)}/{CHANNEL_DESCRIPTION_MAX_LENGTH}
            </span>
          }
        >
          <textarea
            ref={descriptionRef}
            id={DESCRIPTION_ID}
            name="description"
            maxLength={CHANNEL_DESCRIPTION_MAX_LENGTH}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            aria-invalid={Boolean(fieldErrors?.description) || undefined}
            aria-describedby={fieldErrors?.description ? fieldErrorId(DESCRIPTION_ID) : fieldHintId(DESCRIPTION_ID)}
            className="min-h-20 w-full resize-none rounded-control border border-border-strong bg-surface px-3 py-2 text-body text-fg placeholder:text-fg-muted focus-visible:border-focus focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus/30 aria-invalid:border-danger aria-invalid:focus-visible:ring-danger/25"
          />
        </Field>
        {state.error === "unavailable" && (
          <p role="alert" className="text-small text-danger-fg">
            {FAILURE_MESSAGE}
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
          Criar canal
        </Button>
      </DialogFooter>
    </form>
  );
}

/** O foco vai para o primeiro campo inválido, na ordem do diálogo. */
function focusFirstInvalid(
  errors: CreateChannelFieldErrors,
  name: HTMLInputElement | null,
  description: HTMLTextAreaElement | null,
) {
  (errors.name ? name : description)?.focus();
}
