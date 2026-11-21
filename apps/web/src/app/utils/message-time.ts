const TIME_FORMAT = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });
const DAY_FORMAT = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long" });
const DAY_WITH_YEAR_FORMAT = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric" });

/** O horário da Mensagem, `HH:mm`, no fuso de quem roda (o navegador). */
export function formatTime(iso: string): string {
  return TIME_FORMAT.format(new Date(iso));
}

/** A chave do dia local da data, para agrupar as Mensagens. */
export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/**
 * O rótulo do separador de dia (spec da F02, "BFF e telas"): "Hoje", "Ontem", "20 de novembro" e,
 * num ano que não é o atual, "20 de novembro de 2025". `now` vem de quem chama, para o teste.
 */
export function dayLabel(date: Date, now: Date): string {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (dayKey(date) === dayKey(now)) {
    return "Hoje";
  }
  if (dayKey(date) === dayKey(yesterday)) {
    return "Ontem";
  }
  return (date.getFullYear() === now.getFullYear() ? DAY_FORMAT : DAY_WITH_YEAR_FORMAT).format(date);
}
