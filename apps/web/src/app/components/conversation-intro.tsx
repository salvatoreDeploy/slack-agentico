import { ChannelIcon } from "./channel-icon";

interface ConversationIntroProps {
  name: string;
  description: string | null;
}

/**
 * O começo do Canal, no fim da área da Conversa: o ícone, "Este é o começo do canal #nome" e a
 * descrição (frame "Conversa / Lista / Início do canal"). A linha do criador entra com a F02-T05.
 */
export function ConversationIntro({ name, description }: ConversationIntroProps) {
  return (
    <section aria-label="Começo do canal" className="flex flex-col gap-2 px-5 pb-6">
      <span className="flex size-12 items-center justify-center rounded-card bg-surface-inset text-fg">
        <ChannelIcon className="size-6" />
      </span>
      <h2 className="text-heading font-black text-fg">Este é o começo do canal #{name}</h2>
      {description && <p className="max-w-160 text-body text-fg-muted">{description}</p>}
    </section>
  );
}
