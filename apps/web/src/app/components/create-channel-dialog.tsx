"use client";

import { Plus } from "lucide-react";
import { unstable_rethrow, usePathname } from "next/navigation";
import { Dialog as DialogPrimitive } from "radix-ui";
import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { createChannel, type CreateChannelState } from "../actions/create-channel";
import { CHANNEL_DESCRIPTION_MAX_LENGTH, normalizeChannelName } from "../utils/channel-name";
import { readCreateChannelFields, validateCreateChannel } from "../utils/create-channel-validation";
import { countGraphemes } from "../utils/graphemes";
import { Button } from "./button";
import { Dialog, DialogBody, DialogClose, DialogContent, DialogFooter, DialogHeader } from "./dialog";
import { Field, fieldDescribedBy } from "./field";
import { ChannelIcon } from "./channel-icon";
import { Input } from "./input";

// Textos dos frames "Diálogos / Criar canal / <Estado>" do Pencil, donos do microtexto.
const DESCRIPTION = "Canais organizam a conversa por assunto, projeto ou time.";
const NAME_HINT = "Minúsculas, sem espaços. Ex.: planejamento-q4";
const FAILURE_MESSAGE = "Não foi possível criar o canal. Tente de novo.";

const NAME_ID = "channel-name";
const DESCRIPTION_ID = "channel-description";

/**
 * Confere os campos no navegador e só chama a ação com eles bons; a ação confere de novo. Se o
 * envio do navegador para o BFF falha, o diálogo mostra a falha, sem cair no error boundary.
 */
async function submitCreateChannel(previous: CreateChannelState, formData: FormData): Promise<CreateChannelState> {
  const fieldErrors = validateCreateChannel(readCreateChannelFields(formData));
  if (fieldErrors) {
    return { fieldErrors };
  }
  try {
    return await createChannel(previous, formData);
  } catch (error) {
    unstable_rethrow(error);
    return { error: "unavailable" };
  }
}

/**
 * "Adicionar canal", no fim da seção Canais, e o diálogo "Criar canal" que ela abre (spec da F02,
 * "BFF e telas"). O foco começa no Nome, fica preso no diálogo e volta a "Adicionar canal" ao
 * fechar. A troca de endereço fecha o diálogo: no sucesso, a ação leva ao Canal novo. A barra
 * lateral fica no layout e não desmonta, então o fechamento zera o estado, para o diálogo não
 * reabrir quando a Pessoa voltar ao endereço em que o abriu.
 */
export function CreateChannelDialog() {
  const pathname = usePathname();
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  if (openedAt !== null && openedAt !== pathname) {
    setOpenedAt(null);
  }

  return (
    <Dialog open={openedAt === pathname} onOpenChange={(open) => setOpenedAt(open ? pathname : null)}>
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
  const [state, formAction, isPending] = useActionState(submitCreateChannel, {});
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);

  const { fieldErrors } = state;
  const normalized = normalizeChannelName(name);
  const nameHint = normalized ? `O canal vai se chamar #${normalized}.` : NAME_HINT;
  const descriptionCounter = (
    <span className="flex justify-end">
      {countGraphemes(description)}/{CHANNEL_DESCRIPTION_MAX_LENGTH}
    </span>
  );

  // O foco vai para o primeiro campo inválido, a cada resposta, inclusive quando o erro se repete.
  useEffect(() => {
    if (state.fieldErrors) {
      (state.fieldErrors.name ? nameRef : descriptionRef).current?.focus();
    }
  }, [state]);

  /**
   * Envia pela ação numa transição, e não pelo `action` do formulário, porque o React limpa os
   * campos quando a ação de um `<form action>` termina, e eles continuam preenchidos depois de um
   * erro.
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <DialogBody>
        <Field htmlFor={NAME_ID} label="Nome" error={fieldErrors?.name} hint={nameHint}>
          <div className="relative">
            <ChannelIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-fg-muted" />
            <Input
              ref={nameRef}
              id={NAME_ID}
              name="name"
              autoComplete="off"
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={Boolean(fieldErrors?.name) || undefined}
              aria-describedby={fieldDescribedBy(NAME_ID, { error: fieldErrors?.name, hint: nameHint })}
              className="pl-8"
            />
          </div>
        </Field>
        <Field
          htmlFor={DESCRIPTION_ID}
          label={
            <>
              Descrição <span className="font-normal text-fg-muted">(opcional)</span>
            </>
          }
          error={fieldErrors?.description}
          hint={descriptionCounter}
        >
          <Input
            ref={descriptionRef}
            id={DESCRIPTION_ID}
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            aria-invalid={Boolean(fieldErrors?.description) || undefined}
            aria-describedby={fieldDescribedBy(DESCRIPTION_ID, {
              error: fieldErrors?.description,
              hint: descriptionCounter,
            })}
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
          <Button type="button" variant="secondary" disabled={isPending}>
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
