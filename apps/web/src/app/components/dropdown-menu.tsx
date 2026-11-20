"use client";

import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "../utils/cn";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

/**
 * O painel do menu: cartão com elevação 2, na camada dos menus (design system, "Camadas"). Com
 * `inline`, fica no lugar do gatilho em vez do portal no fim do `body`, para continuar dentro do
 * landmark dele (a regra `region` do axe-core).
 */
export function DropdownMenuContent({
  className,
  sideOffset = 8,
  inline = false,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content> & { inline?: boolean }) {
  const content = (
    <DropdownMenuPrimitive.Content
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 animate-pop-in rounded-card bg-surface-raised py-2 text-fg shadow-2",
        className,
      )}
      {...props}
    />
  );
  return inline ? content : <DropdownMenuPrimitive.Portal>{content}</DropdownMenuPrimitive.Portal>;
}

export function DropdownMenuLabel({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return <DropdownMenuPrimitive.Label className={cn("px-4 pt-1 pb-2", className)} {...props} />;
}

/** Item do menu: `h-8`, destacado com `sidebar-active` pelo mouse ou pelo teclado (design system). */
export function DropdownMenuItem({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Item>) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "flex h-8 cursor-pointer items-center gap-2 px-4 text-body text-fg outline-none select-none",
        "data-[highlighted]:bg-sidebar-active data-[highlighted]:text-sidebar-on-active",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

/** Linha entre grupos do menu: `my-2`, 1 px. */
export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return <DropdownMenuPrimitive.Separator className={cn("my-2 h-px bg-border-subtle", className)} {...props} />;
}
