"use client";

import { useSyncExternalStore } from "react";

const subscribeNothing = () => () => {};

/**
 * Se o componente já está no navegador. Para o que só o navegador sabe, como o fuso: no servidor e
 * na hidratação vale `false`, e a hidratação não diverge (spec da F02, "Horário e separadores de
 * dia").
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(subscribeNothing, () => true, () => false);
}
