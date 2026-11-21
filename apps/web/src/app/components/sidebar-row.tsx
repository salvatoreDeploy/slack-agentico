"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "../utils/cn";

interface SidebarRowProps {
  href: string;
  icon: ReactNode;
  children: ReactNode;
}

/**
 * Uma linha da barra lateral, que leva a uma Conversa. É cliente só para ler o endereço e marcar a
 * linha da Conversa aberta com o estado "Selecionado" e o `aria-current` (design system,
 * "SidebarRow").
 */
export function SidebarRow({ href, icon, children }: SidebarRowProps) {
  const isActive = usePathname() === href;
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex h-7 items-center gap-2 rounded-item px-2 text-body",
        isActive ? "bg-sidebar-active text-sidebar-on-active" : "text-sidebar-fg hover:bg-sidebar-hover",
      )}
    >
      {icon}
      <span className="truncate">{children}</span>
    </Link>
  );
}
