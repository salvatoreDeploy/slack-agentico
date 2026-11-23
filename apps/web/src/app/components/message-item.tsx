import { CircleAlert } from "lucide-react";
import { memo } from "react";
import type { Message } from "../services/chat-api";
import { cn } from "../utils/cn";
import { formatTime } from "../utils/message-time";
import { Avatar } from "./avatar";
import { MessageText } from "./message-text";

/** O estado de envio de uma Mensagem (design system, "MessageItem"). */
export type MessageStatus = "sent" | "sending" | "failed";

interface MessageItemProps {
  message: Pick<Message, "author" | "body" | "created_at">;
  status: MessageStatus;
  /** Se o horário aparece: só no navegador, que sabe o fuso. */
  showTime: boolean;
  /** A nova tentativa de uma Mensagem `failed`. */
  onRetry?: () => void;
}

/**
 * Uma Mensagem no layout `full`: o avatar no "gutter", o nome e o horário, e o texto (frame
 * "Conversa / Estrutura / Canal público"). `sending` fica com a opacidade do frame "Conversa /
 * Mensagem / Enviando"; `failed` mostra o aviso e "Tentar de novo" do frame "Conversa / Mensagem /
 * Falha no envio", sem o "Descartar", que fica fora da F02.
 * Memorizado, para as Mensagens já confirmadas não renderizarem de novo a cada envio.
 */
export const MessageItem = memo(function MessageItem({ message, status, showTime, onRetry }: MessageItemProps) {
  return (
    <li
      aria-busy={status === "sending" || undefined}
      className={cn("flex gap-2 px-5 py-1", status === "sending" && "opacity-60")}
    >
      <Avatar id={message.author.id} name={message.author.name} />
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="flex items-baseline gap-2">
          <span className="text-body font-bold text-fg">{message.author.name}</span>
          <time dateTime={message.created_at} className="text-caption text-fg-muted">
            {showTime ? formatTime(message.created_at) : ""}
          </time>
        </p>
        <MessageText text={message.body} />
        {status === "failed" && (
          <p className="flex items-center gap-2 pt-1 text-small text-danger-fg">
            <CircleAlert className="size-4 shrink-0" aria-hidden />
            Não foi possível enviar.
            <button
              type="button"
              onClick={onRetry}
              className="rounded text-caption text-link hover:text-link-hover hover:underline"
            >
              Tentar de novo
            </button>
          </p>
        )}
      </div>
    </li>
  );
});
