/** O nome do Canal com que o Workspace nasce, para onde `/` leva (spec da F02, "BFF e telas"). */
export const GENERAL_CHANNEL_NAME = "geral";

/** O endereço de um Canal: o id, e não o nome (LLD, "Cliente"). */
export function channelPath(id: string): string {
  return `/canais/${id}`;
}
