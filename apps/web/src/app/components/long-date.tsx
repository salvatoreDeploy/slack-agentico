"use client";

import { useIsClient } from "../hooks/use-is-client";
import { formatLongDate } from "../utils/message-time";

/**
 * A data por extenso ("20 de novembro"), no fuso do navegador, que o servidor não conhece, como o
 * horário das Mensagens. Até a hidratação, o `<time>` fica vazio.
 */
export function LongDate({ iso }: { iso: string }) {
  const isClient = useIsClient();
  return <time dateTime={iso}>{isClient ? formatLongDate(new Date(iso), new Date()) : ""}</time>;
}
