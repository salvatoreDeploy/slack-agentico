/** Um pedaço do texto de uma Mensagem: texto puro ou um endereço que vira link. */
export type TextPart = { kind: "text"; value: string } | { kind: "link"; value: string };

/** Endereços `http://` e `https://` até o primeiro espaço ou sinal que não cabe num endereço. */
const URL_PATTERN = /https?:\/\/[^\s<>"]+/g;

/** Pontuação que encerra a frase, e não o endereço, como o ponto em "veja https://x.org." */
const TRAILING_PUNCTUATION = /[.,;:!?)\]}'"]+$/;

/**
 * Divide o texto em pedaços de texto e de link, só para os esquemas `http` e `https` (spec da F02,
 * "Texto da Mensagem"). Quem renderiza põe cada pedaço como nó de texto ou `<a>`, sem HTML.
 */
export function linkify(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let last = 0;
  for (const match of text.matchAll(URL_PATTERN)) {
    const url = match[0].replace(TRAILING_PUNCTUATION, "");
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
