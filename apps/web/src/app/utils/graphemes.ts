const SEGMENTER = new Intl.Segmenter("pt-BR", { granularity: "grapheme" });

/**
 * Quantos caracteres o texto tem como a Pessoa os vê: um emoji com tom de pele ou uma letra com
 * acento combinado conta 1. Cópia da função da API (`apps/chat-api/src/common/text/graphemes.ts`),
 * que é quem decide; as duas passam pela mesma tabela de casos (spec da F02, "Mensagens").
 */
export function countGraphemes(text: string): number {
  return Array.from(SEGMENTER.segment(text)).length;
}
