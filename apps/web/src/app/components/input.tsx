import type { ComponentProps } from "react";
import { cn } from "../utils/cn";

/**
 * Campo de texto: `h-9`, borda `border-strong`, placeholder em `fg-muted`. O foco troca a borda e
 * põe o anel; `aria-invalid` pinta o erro (design system, "Estados de interação").
 */
export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-9 w-full rounded-control border border-border-strong bg-surface px-3 text-body text-fg placeholder:text-fg-muted",
        "focus-visible:border-focus focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus/30",
        "aria-invalid:border-danger aria-invalid:focus-visible:ring-danger/25",
        "disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
