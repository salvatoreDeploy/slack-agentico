import type { ReactNode } from "react";

interface SidebarSectionProps {
  title: string;
  children: ReactNode;
}

/** Uma seção da barra lateral: o título e a lista de linhas. */
export function SidebarSection({ title, children }: SidebarSectionProps) {
  return (
    <section aria-label={title} className="flex flex-col px-2 pb-4">
      <h3 className="flex h-7 items-center px-2 text-small font-bold text-sidebar-fg">{title}</h3>
      <ul className="flex flex-col gap-px pt-1">{children}</ul>
    </section>
  );
}
