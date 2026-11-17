/** Nome do Workspace, fixo no MVP: há um Workspace só por instalação. */
const WORKSPACE_NAME = "Full Cycle";

/**
 * Lista de conversas. Na F01, só o cabeçalho do Workspace; as seções de canais, Conversas
 * diretas e Agentes entram com as F02, F04 e F10.
 */
export function Sidebar() {
  return (
    <aside aria-label="Conversas" className="flex w-sidebar shrink-0 flex-col bg-sidebar">
      <header className="flex h-header items-center border-b border-sidebar-border pr-2 pl-4">
        <h2 className="text-title font-black text-sidebar-fg-strong">{WORKSPACE_NAME}</h2>
      </header>
    </aside>
  );
}
