import { LoaderCircle } from "lucide-react";
import { cn } from "../utils/cn";

interface SpinnerProps {
  className?: string;
  /** Texto para leitores de tela; sem ele, o spinner é só decoração dentro de outro controle. */
  label?: string;
}

/** Indicador de carregamento: gira em 0,8 s (design system, "Movimento"). */
export function Spinner({ className, label }: SpinnerProps) {
  return (
    <LoaderCircle
      className={cn("size-5 animate-spin text-fg-muted", className)}
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
