import { SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChannelConversation } from "../../../../components/channel-conversation";
import { ConversationHeader } from "../../../../components/conversation-header";
import { ConversationIntro } from "../../../../components/conversation-intro";
import { EmptyState } from "../../../../components/empty-state";
import { getConversation, getMe, listMessages } from "../../../../services/chat-api";
import { HOME_PATH } from "../../../../utils/return-path";
import { redirectToExpiredSession } from "../../../../utils/session-redirect";
import { sessionToken } from "../../../../utils/session-token";

export async function generateMetadata({ params }: PageProps<"/canais/[id]">): Promise<Metadata> {
  const result = await getConversation((await sessionToken()) ?? "", (await params).id);
  return { title: result.status === "ok" ? `#${result.conversation.name}` : "Conversa não encontrada" };
}

/**
 * O Canal: o cabeçalho, o histórico com o começo do Canal e o composer (spec da F02, "BFF e
 * telas"). Uma Conversa que a API não mostra (id malformado, inexistente ou sem participação) vira
 * o estado "Conversa não encontrada", dentro da casca.
 */
export default async function ChannelPage({ params }: PageProps<"/canais/[id]">) {
  const { id } = await params;
  const token = (await sessionToken()) ?? "";
  const [result, page, me] = await Promise.all([getConversation(token, id), listMessages(token, id), getMe(token)]);
  if (result.status === "unauthenticated" || page.status === "unauthenticated" || me.status === "unauthenticated") {
    return redirectToExpiredSession();
  }
  if (result.status === "not_found" || page.status === "not_found") {
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
      <ChannelConversation
        key={conversation.id}
        conversationId={conversation.id}
        channelName={conversation.name}
        author={me.person}
        initialMessages={page.messages}
        intro={
          page.hasMore ? null : (
            <ConversationIntro
              name={conversation.name}
              description={conversation.description}
              createdBy={conversation.created_by}
              createdAt={conversation.created_at}
            />
          )
        }
      />
    </>
  );
}
