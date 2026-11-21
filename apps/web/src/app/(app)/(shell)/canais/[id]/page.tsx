import { SearchX } from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ConversationHeader } from "../../../../components/conversation-header";
import { ConversationIntro } from "../../../../components/conversation-intro";
import { EmptyState } from "../../../../components/empty-state";
import { getConversation } from "../../../../services/chat-api";
import { channelPath } from "../../../../utils/conversation-path";
import { expiredSessionPath, HOME_PATH } from "../../../../utils/return-path";
import { SESSION_COOKIE } from "../../../../utils/session-cookie-name";

/** O título do layout raiz, que vem depois do nome da Conversa na aba. */
const PRODUCT_NAME = "Full Cycle Chat";

async function loadConversation(id: string) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value ?? "";
  const result = await getConversation(token, id);
  if (result.status === "unauthenticated") {
    redirect(expiredSessionPath(channelPath(id)));
  }
  return result;
}

export async function generateMetadata({ params }: PageProps<"/canais/[id]">): Promise<Metadata> {
  const result = await loadConversation((await params).id);
  return {
    title:
      result.status === "ok"
        ? `#${result.conversation.name} · ${PRODUCT_NAME}`
        : `Conversa não encontrada · ${PRODUCT_NAME}`,
  };
}

/**
 * O Canal: o cabeçalho e o começo do Canal. O histórico e o composer entram com a F02-T03. Uma
 * Conversa que a API não mostra (id malformado, inexistente ou sem participação) vira o estado
 * "Conversa não encontrada", dentro da casca.
 */
export default async function ChannelPage({ params }: PageProps<"/canais/[id]">) {
  const result = await loadConversation((await params).id);
  if (result.status === "not_found") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          icon={<SearchX className="size-6" aria-hidden />}
          title="Conversa não encontrada"
          description="Ela não existe ou você não participa dela."
          action={
            <Link href={HOME_PATH} className="text-body text-link hover:text-link-hover hover:underline">
              Voltar ao início
            </Link>
          }
        />
      </div>
    );
  }

  const { conversation } = result;
  return (
    <>
      <ConversationHeader name={conversation.name} description={conversation.description} />
      <div className="flex flex-1 flex-col justify-end overflow-y-auto">
        <ConversationIntro name={conversation.name} description={conversation.description} />
      </div>
    </>
  );
}
