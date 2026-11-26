import type { Conversation } from "../services/chat-api";
import { ChannelIcon } from "./channel-icon";
import { CreatedOn } from "./created-on";

interface ConversationIntroProps {
  name: string;
  description: string | null;
  /** Quem criou o Canal; nulo no `#geral`, que nasce pela migração. */
  createdBy: Conversation["created_by"];
  createdAt: string;
}

/**
 * O começo do Canal, no fim da área da Conversa: o ícone, "Este é o começo do canal #nome", a
 * linha do criador e a descrição (frames "Conversa / Lista / Início do canal" e "Início do canal
 * com criador").
 */
export function ConversationIntro({ name, description, createdBy, createdAt }: ConversationIntroProps) {
  return (
    <section aria-label="Começo do canal" className="flex flex-col gap-2 px-5 pt-8 pb-4">
      <span className="flex size-12 items-center justify-center rounded-card bg-surface-inset text-fg">
        <ChannelIcon className="size-6" />
      </span>
      <h2 className="text-heading font-black text-fg">Este é o começo do canal #{name}</h2>
      {createdBy && <CreatedOn username={createdBy.username} createdAt={createdAt} />}
      {description && <p className="max-w-160 text-body text-fg-muted">{description}</p>}
    </section>
  );
}
