"use client";

import { SendHorizontal } from "lucide-react";
import { useState, type FormEvent, type KeyboardEvent } from "react";
import { cn } from "../utils/cn";
import { countGraphemes } from "../utils/graphemes";

/** `tamanho da Mensagem`, em grafemas (LLD, "Valores e configuração"). */
const MESSAGE_MAX_LENGTH = 4000;

/** O contador aparece quando restam estes grafemas ou menos (frame "Conversa / Composer / Perto do limite"). */
const COUNTER_THRESHOLD = 200;

interface MessageComposerProps {
  channelName: string;
  onSend: (body: string) => void;
}

/**
 * O composer do Canal (design system, "MessageComposer"): Enter envia e Shift+Enter quebra a
 * linha. O contador aparece perto do `tamanho da Mensagem` e, acima dele, bloqueia o envio. Um
 * texto vazio depois do corte das pontas não envia.
 */
export function MessageComposer({ channelName, onSend }: MessageComposerProps) {
  const [body, setBody] = useState("");
  const trimmed = body.trim();
  const remaining = MESSAGE_MAX_LENGTH - countGraphemes(trimmed);
  const isOverLimit = remaining < 0;
  const canSend = trimmed.length > 0 && !isOverLimit;

  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!canSend) {
      return;
    }
    onSend(trimmed);
    setBody("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      submit(event);
    }
  }

  return (
    <form onSubmit={submit} className="px-5 pb-5">
      <div className="flex flex-col rounded-card border border-border-strong bg-surface focus-within:border-fg-muted">
        <textarea
          aria-label={`Mensagem para #${channelName}`}
          placeholder={`Mensagem para #${channelName}`}
          rows={1}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={handleKeyDown}
          className="field-sizing-content max-h-60 min-h-10 resize-none bg-transparent px-3 pt-3 pb-1 text-body text-fg placeholder:text-fg-muted focus-visible:outline-none"
        />
        <div className="flex items-center justify-end gap-3 p-1.5">
          {remaining <= COUNTER_THRESHOLD ? (
            <span aria-live="polite" className={cn("text-caption", isOverLimit ? "text-danger-fg" : "text-fg-muted")}>
              {isOverLimit ? `${-remaining} caracteres acima do limite` : `Restam ${remaining} caracteres`}
            </span>
          ) : (
            <span className="text-caption text-fg-muted">Shift + Enter para nova linha</span>
          )}
          <button
            type="submit"
            aria-label="Enviar mensagem"
            disabled={!canSend}
            className="flex h-7 w-9 items-center justify-center rounded-item bg-primary text-on-primary hover:bg-primary-hover disabled:opacity-50"
          >
            <SendHorizontal className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </form>
  );
}
