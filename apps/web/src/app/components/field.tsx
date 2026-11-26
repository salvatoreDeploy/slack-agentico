import type { ReactNode } from "react";

interface FieldProps {
  /** O id do controle; o rótulo aponta para ele. */
  htmlFor: string;
  label: ReactNode;
  error?: string;
  /** A dica abaixo do controle, que dá lugar ao erro quando ele existe. */
  hint?: ReactNode;
  children: ReactNode;
}

/** O id da mensagem de erro de um campo, que o controle cita em `aria-describedby`. */
export function fieldErrorId(htmlFor: string): string {
  return `${htmlFor}-error`;
}

/** O id da dica de um campo, que o controle cita em `aria-describedby` enquanto não há erro. */
export function fieldHintId(htmlFor: string): string {
  return `${htmlFor}-hint`;
}

/**
 * O `aria-describedby` do controle: o erro, quando há, senão a dica, como o `Field` mostra; sem
 * nenhum dos dois, `undefined`.
 */
export function fieldDescribedBy(htmlFor: string, { error, hint }: { error?: string; hint?: unknown }): string | undefined {
  if (error) {
    return fieldErrorId(htmlFor);
  }
  return hint ? fieldHintId(htmlFor) : undefined;
}

/** Rótulo, controle e dica ou erro (design system, "Comportamentos registrados"). */
export function Field({ htmlFor, label, error, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-small font-bold text-fg">
        {label}
      </label>
      {children}
      {error ? (
        <p id={fieldErrorId(htmlFor)} className="text-small text-danger-fg">
          {error}
        </p>
      ) : (
        hint && (
          <p id={fieldHintId(htmlFor)} className="text-small text-fg-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
