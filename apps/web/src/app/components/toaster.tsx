"use client";

import type { CSSProperties } from "react";
import { Toaster as Sonner } from "sonner";

/** As cores do toast saem dos tokens, para valerem nos dois temas. */
const TOKEN_STYLE = {
  "--normal-bg": "var(--surface-raised)",
  "--normal-text": "var(--fg)",
  "--normal-border": "var(--border)",
  "--border-radius": "var(--shape-card)",
} as CSSProperties;

/** O Toaster do Sonner: canto inferior direito, com botão de fechar (design system, "Toast"). */
export function Toaster() {
  return <Sonner position="bottom-right" closeButton style={TOKEN_STYLE} />;
}
