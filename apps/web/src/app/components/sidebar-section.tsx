import type { ReactNode } from "react";

interface SidebarSectionProps {
  title: string;
  children: ReactNode;
}

/** Uma seção da barra lateral: o título e a lista de linhas. */
export function SidebarSection({ title, children }: SidebarSectionProps) {
  return (
    <section aria-label={title} className="flex flex-col gap-0.5 px-2 pt-4">
      <h3 className="px-4 pb-1 text-small font-bold text-sidebar-fg">{title}</h3>
      <ul className="flex flex-col gap-0.5">{children}</ul>
    </section>
  );
}
