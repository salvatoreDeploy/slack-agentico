import type { ComponentProps } from "react";
import { cn } from "../utils/cn";

/**
 * A borda, o foco e os estados dos campos de texto: borda `border-strong`, placeholder em
 * `fg-muted`; o foco troca a borda e põe o anel; `aria-invalid` pinta o erro (design system,
 * "Estados de interação"). O Input e o Textarea partem delas.
 */
export const CONTROL_CLASSES = cn(
  "w-full rounded-control border border-border-strong bg-surface px-3 text-body text-fg placeholder:text-fg-muted",
  "focus-visible:border-focus focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus/30",
  "aria-invalid:border-danger aria-invalid:focus-visible:ring-danger/25",
  "disabled:opacity-50",
);

/** Campo de texto: `h-9`, com a borda e os estados de `CONTROL_CLASSES`. */
export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(CONTROL_CLASSES, "h-9", className)} {...props} />;
}
