/** `tamanho do nome do Canal`, depois da normalização (LLD, "Valores e configuração"). */
export const CHANNEL_NAME_MAX_LENGTH = 80;

/** `tamanho da descrição do Canal`, em caracteres como a Pessoa os vê (LLD, "Valores e configuração"). */
export const CHANNEL_DESCRIPTION_MAX_LENGTH = 250;

/**
 * O nome do Canal como a API vai gravá-lo, para a prévia do diálogo: sem acentos, em minúsculas,
 * com cada sequência fora de `a-z` e `0-9` trocada por um hífen e sem hífens nas pontas. Cópia da
 * função da API (`apps/chat-api/src/conversations/channel-name.ts`), que é quem decide; as duas
 * passam pela mesma tabela de casos (spec da F02, "Nome do Canal").
 */
export function normalizeChannelName(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
