import type { ReactNode } from "react";

interface FieldProps {
  /** O id do controle; o rótulo aponta para ele. */
  htmlFor: string;
  label: string;
  /** O id da mensagem de erro, que o controle cita em `aria-describedby`. */
  errorId?: string;
  error?: string;
  children: ReactNode;
}

/** Rótulo, controle e erro (design system, "Comportamentos registrados"). */
export function Field({ htmlFor, label, errorId, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-small font-bold text-fg">
        {label}
      </label>
      {children}
      {error && (
        <p id={errorId} className="text-small text-danger-fg">
          {error}
        </p>
      )}
    </div>
  );
}
