/** Um pedaço do texto de uma Mensagem: texto puro ou um endereço que vira link. */
export type TextPart = { kind: "text"; value: string } | { kind: "link"; value: string };

/** Endereços `http://` e `https://` até o primeiro espaço ou sinal que não cabe num endereço. */
const URL_PATTERN = /https?:\/\/[^\s<>"]+/g;

/** Pontuação que encerra a frase, e não o endereço, como o ponto em "veja https://x.org." */
const TRAILING_PUNCTUATION = /[.,;:!?'"]$/;

/** Os pares de fechamento que podem pertencer ao endereço, como em `.../Java_(linguagem)`. */
const CLOSING_PAIRS: Record<string, string> = { ")": "(", "]": "[", "}": "{" };

/**
 * Tira do fim do endereço a pontuação da frase e os fechamentos sem abertura dentro dele, um de
 * cada vez, até sobrar o endereço.
 */
function trimUrl(url: string): string {
  let trimmed = url;
  for (;;) {
    const last = trimmed.at(-1) ?? "";
    const opening = CLOSING_PAIRS[last];
    const isUnbalanced =
      opening !== undefined && trimmed.split(opening).length <= trimmed.split(last).length - 1;
    if (!TRAILING_PUNCTUATION.test(last) && !isUnbalanced) {
      return trimmed;
    }
    trimmed = trimmed.slice(0, -1);
  }
}

/**
 * Divide o texto em pedaços de texto e de link, só para os esquemas `http` e `https` (spec da F02,
 * "Texto da Mensagem"). Quem renderiza põe cada pedaço como nó de texto ou `<a>`, sem HTML.
 */
export function linkify(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let last = 0;
  for (const match of text.matchAll(URL_PATTERN)) {
    const url = trimUrl(match[0]);
    const start = match.index;
    if (start > last) {
      parts.push({ kind: "text", value: text.slice(last, start) });
    }
    parts.push({ kind: "link", value: url });
    last = start + url.length;
  }
  if (last < text.length) {
    parts.push({ kind: "text", value: text.slice(last) });
  }
  return parts;
}
