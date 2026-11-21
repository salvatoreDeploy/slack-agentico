/** A largura da segunda barra de cada linha, como no frame, que alterna textos curtos e longos. */
const LINE_WIDTHS = ["w-3/5", "w-2/5", "w-4/5", "w-1/2", "w-2/3", "w-1/3"] as const;

/**
 * O carregamento da área da Conversa (frame "Conversa / Estrutura / Histórico carregando"): a faixa
 * do cabeçalho e seis linhas de MessageSkeleton alinhadas ao fim, com a barra lateral visível. O
 * nome do Canal ainda não é conhecido, então o cabeçalho fica vazio.
 */
export function ConversationSkeleton() {
  return (
    <div role="status" aria-label="Carregando a conversa" className="flex flex-1 flex-col">
      <div className="h-header shrink-0 border-b border-border-subtle" />
      <div className="flex flex-1 flex-col justify-end gap-4 px-5 py-4">
        {LINE_WIDTHS.map((width) => (
          <div key={width} className="flex gap-2">
            <span className="size-9 shrink-0 rounded-item bg-surface-inset" />
            <span className="flex flex-1 flex-col gap-2 pt-1">
              <span className="h-3 w-32 rounded bg-surface-inset" />
              <span className={`h-3 ${width} rounded bg-surface-inset`} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
