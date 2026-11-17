import type { ReactNode } from "react";

interface FieldProps {
  /** O id do controle; o rótulo aponta para ele. */
  htmlFor: string;
  label: string;
  error?: string;
  children: ReactNode;
}

/** O id da mensagem de erro de um campo, que o controle cita em `aria-describedby`. */
export function fieldErrorId(htmlFor: string): string {
  return `${htmlFor}-error`;
}

/** Rótulo, controle e erro (design system, "Comportamentos registrados"). */
export function Field({ htmlFor, label, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-small font-bold text-fg">
        {label}
      </label>
      {children}
      {error && (
        <p id={fieldErrorId(htmlFor)} className="text-small text-danger-fg">
          {error}
        </p>
      )}
    </div>
  );
}
