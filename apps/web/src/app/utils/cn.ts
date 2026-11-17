import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Os tamanhos de texto do design system ("Tipografia"). Sem eles, o `tailwind-merge` confunde
 * `text-body` com uma cor e descarta o `text-on-primary` que vem antes.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: { text: ["display", "heading", "title", "body", "small", "caption", "micro"] },
  },
});

/** Junta classes do Tailwind, com a última vencendo os conflitos (design system, "Stack de interface"). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
