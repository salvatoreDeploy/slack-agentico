import type { Message } from "../services/chat-api";
import { cn } from "../utils/cn";
import { Avatar } from "./avatar";
import { MessageText } from "./message-text";

/** O estado de envio de uma Mensagem (design system, "MessageItem"). */
export type MessageStatus = "sent" | "sending" | "failed";

interface MessageItemProps {
  message: Pick<Message, "author" | "body">;
  status: MessageStatus;
  /** O horário já formatado no fuso do navegador; vazio até a lista montar no cliente. */
  time: string;
  dateTime: string;
}

/**
 * Uma Mensagem no layout `full`: o avatar no "gutter", o nome e o horário, e o texto (frame
 * "Conversa / Estrutura / Canal público"). `sending` fica com a opacidade do frame "Conversa /
 * Mensagem / Enviando"; `failed` mostra o aviso do frame "Conversa / Mensagem / Falha no envio".
 */
export function MessageItem({ message, status, time, dateTime }: MessageItemProps) {
  return (
    <li
      aria-busy={status === "sending" || undefined}
      className={cn("flex gap-2 px-5 py-1", status === "sending" && "opacity-60")}
    >
      <Avatar id={message.author.id} name={message.author.name} />
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="flex items-baseline gap-2">
          <span className="text-body font-bold text-fg">{message.author.name}</span>
          <time dateTime={dateTime} className="text-caption text-fg-muted">
            {time}
          </time>
        </p>
        <MessageText text={message.body} />
        {status === "failed" && <p className="text-small text-danger-fg">Não foi possível enviar.</p>}
      </div>
    </li>
  );
}
