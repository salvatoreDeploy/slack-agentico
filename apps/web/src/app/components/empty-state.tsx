import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

/** Estado vazio ou de erro: ícone, título, descrição e uma ação opcional. */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-card bg-surface-inset text-fg-muted">
        {icon}
      </span>
      <div className="flex flex-col gap-1">
        <h1 className="text-body font-bold text-fg">{title}</h1>
        <p className="text-body text-fg-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
