import type { Channel } from "../services/chat-api";
import { channelPath } from "../utils/conversation-path";
import { ChannelIcon } from "./channel-icon";
import { CreateChannelDialog } from "./create-channel-dialog";
import { SidebarRow } from "./sidebar-row";
import { SidebarSection } from "./sidebar-section";

/** Nome do Workspace, fixo no MVP: há um Workspace só por instalação. */
const WORKSPACE_NAME = "Full Cycle";

interface SidebarProps {
  channels: Channel[];
}

/**
 * Lista de conversas: o cabeçalho do Workspace e a seção Canais (F02), com "Adicionar canal" no
 * fim. As Conversas diretas e os Agentes entram com as F04 e F10.
 */
export function Sidebar({ channels }: SidebarProps) {
  return (
    <aside aria-label="Conversas" className="flex w-sidebar shrink-0 flex-col bg-sidebar">
      <header className="flex h-header items-center border-b border-sidebar-border pr-2 pl-4">
        <h2 className="text-title font-black text-sidebar-fg-strong">{WORKSPACE_NAME}</h2>
      </header>
      <nav aria-label="Canais e conversas" className="flex-1 overflow-y-auto py-3">
        <SidebarSection title="Canais">
          {channels.map((channel) => (
            <li key={channel.id}>
              <SidebarRow href={channelPath(channel.id)} icon={<ChannelIcon />}>
                {channel.name}
              </SidebarRow>
            </li>
          ))}
          <li>
            <CreateChannelDialog />
          </li>
        </SidebarSection>
      </nav>
    </aside>
  );
}
