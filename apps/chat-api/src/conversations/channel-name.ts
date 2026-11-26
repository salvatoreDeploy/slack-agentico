/** `tamanho do nome do Canal`, depois da normalização (LLD, "Valores e configuração"). */
export const CHANNEL_NAME_MAX_LENGTH = 80;

/** `tamanho da descrição do Canal`, em grafemas, depois do tratamento (LLD, "Valores e configuração"). */
export const CHANNEL_DESCRIPTION_MAX_LENGTH = 250;

/**
 * O nome do Canal como ele é gravado (spec da F02, "Nome do Canal"): sem acentos, em minúsculas,
 * com cada sequência fora de `a-z` e `0-9` trocada por um hífen e sem hífens nas pontas. A web tem
 * uma cópia desta função, para a prévia, e as duas passam pela mesma tabela de casos.
 */
export function normalizeChannelName(input: string): string {
  return input
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** A descrição com cada quebra de linha trocada por espaço e as pontas cortadas; vazia, é nula. */
export function normalizeChannelDescription(input: string): string | null {
  const description = input.replace(/\r\n|\r|\n/g, ' ').trim();
  return description === '' ? null : description;
}
