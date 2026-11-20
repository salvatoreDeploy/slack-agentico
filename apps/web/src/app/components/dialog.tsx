"use client";

import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../utils/cn";

export const Dialog = DialogPrimitive.Root;

/**
 * O painel do diálogo: largura máxima de 512, `rounded-card`, `shadow-3`, com o overlay na camada
 * dos drawers (design system, "Comportamentos registrados" e "Camadas"). O Radix prende o foco
 * dentro dele e o fecha pelo Esc.
 */
export function DialogContent({ className, ...props }: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 animate-fade-in bg-surface-overlay" />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col",
          "animate-pop-in rounded-card bg-surface-raised text-fg shadow-3 focus:outline-none",
          className,
        )}
        {...props}
      />
    </DialogPrimitive.Portal>
  );
}

interface DialogHeaderProps {
  title: string;
  description?: ReactNode;
}

/** Título, descrição e o botão de fechar, como o DialogHeader do design. */
export function DialogHeader({ title, description }: DialogHeaderProps) {
  return (
    <div className="flex items-start gap-4 pt-5 pr-4 pb-2 pl-6">
      <div className="flex flex-1 flex-col gap-1">
        <DialogPrimitive.Title className="text-title font-black text-fg">{title}</DialogPrimitive.Title>
        {description && (
          <DialogPrimitive.Description className="text-small text-fg-muted">{description}</DialogPrimitive.Description>
        )}
      </div>
      <DialogPrimitive.Close
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-control text-fg-muted transition-colors duration-100",
          "hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        )}
      >
        <X className="size-5" aria-hidden />
        <span className="sr-only">Fechar</span>
      </DialogPrimitive.Close>
    </div>
  );
}

export function DialogBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-4 px-6 py-3", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex justify-end gap-3 px-6 pt-3 pb-5", className)} {...props} />;
}

export const DialogClose = DialogPrimitive.Close;
