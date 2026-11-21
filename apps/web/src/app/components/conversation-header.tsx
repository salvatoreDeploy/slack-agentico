import { ChannelIcon } from "./channel-icon";

interface ConversationHeaderProps {
  name: string;
  description: string | null;
}

/** O cabeçalho do Canal: o `#nome` e a descrição, que some abaixo de 640 px (design system). */
export function ConversationHeader({ name, description }: ConversationHeaderProps) {
  return (
    <header className="flex h-header shrink-0 items-center gap-3 border-b border-border-subtle px-5">
      <h1 className="flex items-center gap-1 text-title font-black text-fg">
        <ChannelIcon className="size-5" />
        {name}
      </h1>
      {description && <p className="hidden truncate text-small text-fg-muted sm:block">{description}</p>}
    </header>
  );
}
