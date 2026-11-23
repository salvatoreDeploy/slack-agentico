const SEGMENTER = new Intl.Segmenter('pt-BR', { granularity: 'grapheme' });

/**
 * Quantos caracteres o texto tem como a Pessoa os vê: um emoji com tom de pele ou uma letra com
 * acento combinado conta 1 (spec da F02, "Mensagens"). A web conta do mesmo jeito.
 */
export function countGraphemes(text: string): number {
  return Array.from(SEGMENTER.segment(text)).length;
}
