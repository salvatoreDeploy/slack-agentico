"use client";

import { useIsClient } from "../hooks/use-is-client";
import { formatLongDate } from "../utils/message-time";

interface CreatedByLineProps {
  username: string;
  createdAt: string;
}

/**
 * "@ana criou este canal em 20 de novembro.": a data sai no fuso do navegador, que o servidor não
 * conhece, como o horário das Mensagens. Até a hidratação, a linha fica vazia, com a altura de uma
 * linha, para a frase não aparecer sem a data.
 */
export function CreatedByLine({ username, createdAt }: CreatedByLineProps) {
  const isClient = useIsClient();
  return (
    <p className="min-h-lh text-body text-fg-muted">
      {isClient && `@${username} criou este canal em ${formatLongDate(new Date(createdAt), new Date())}.`}
    </p>
  );
}
