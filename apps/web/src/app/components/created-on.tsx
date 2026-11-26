"use client";

import { useIsClient } from "../hooks/use-is-client";
import { formatLongDate } from "../utils/message-time";

interface CreatedOnProps {
  username: string;
  createdAt: string;
}

/**
 * "@ana criou este canal em 20 de novembro.": a data sai no fuso do navegador, que o servidor não
 * conhece, como o horário das Mensagens. Até a hidratação, a linha fica vazia, com a mesma altura.
 */
export function CreatedOn({ username, createdAt }: CreatedOnProps) {
  const isClient = useIsClient();
  return (
    <p className="text-body text-fg-muted">
      {isClient ? `@${username} criou este canal em ${formatLongDate(new Date(createdAt), new Date())}.` : "\u00a0"}
    </p>
  );
}
