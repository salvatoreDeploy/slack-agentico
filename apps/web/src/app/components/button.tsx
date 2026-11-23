import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../utils/cn";
import { Spinner } from "./spinner";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-control font-bold transition-colors duration-100 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-active",
        secondary: "border border-border-strong bg-surface text-fg hover:bg-surface-subtle",
        link: "font-normal text-link hover:text-link-hover hover:underline",
      },
      size: {
        md: "h-9 px-4 text-body",
        lg: "h-11 px-5 text-body",
        /** No meio de um texto, como "Tentar de novo" na Mensagem não enviada. */
        inline: "rounded text-caption",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    /**
     * Mostra o spinner, mantém o texto e desabilita o botão (design system, "Estados de
     * interação"). Desabilita com `aria-disabled`, e não com `disabled`, porque o navegador tira o
     * foco de um botão `disabled`, e o foco não pode mudar enquanto envia (spec da F01, "BFF e
     * telas"). O clique, inclusive o Enter, é ignorado enquanto carrega.
     */
    loading?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  loading = false,
  disabled,
  onClick,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      onClick={(event) => {
        if (loading) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      {...props}
    >
      {loading && <Spinner className="size-4 text-current" />}
      {children}
    </button>
  );
}
