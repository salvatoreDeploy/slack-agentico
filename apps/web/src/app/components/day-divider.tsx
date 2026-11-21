/** O separador de dia do histórico: a pílula com o rótulo sobre uma linha (frame "DayDivider"). */
export function DayDivider({ label }: { label: string }) {
  return (
    <div role="separator" aria-label={label} className="relative flex items-center justify-center py-3">
      <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-border-subtle" />
      <span className="relative rounded-full border border-border bg-surface px-3 py-0.5 text-small font-bold text-fg">
        {label}
      </span>
    </div>
  );
}
