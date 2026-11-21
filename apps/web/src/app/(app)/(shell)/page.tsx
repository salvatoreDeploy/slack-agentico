import { MessagesSquare } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { EmptyState } from "../../components/empty-state";
import { listChannels } from "../../services/chat-api";
import { channelPath, GENERAL_CHANNEL_NAME } from "../../utils/conversation-path";
import { SESSION_COOKIE } from "../../utils/session-cookie-name";

/**
 * A página inicial leva ao `#geral` (spec da F02, "BFF e telas"). Se a Pessoa não participa dele,
 * como uma conta gravada à mão sem as participações, mostra o estado "Home / Vazio" (LLD,
 * "Cliente"). O layout já conferiu a Sessão, e a lista de Canais vem da mesma chamada dele.
 */
export default async function HomePage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value ?? "";
  const channels = await listChannels(token);
  const general =
    channels.status === "ok" ? channels.channels.find((channel) => channel.name === GENERAL_CHANNEL_NAME) : undefined;
  if (general) {
    redirect(channelPath(general.id));
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <EmptyState
        icon={<MessagesSquare className="size-6" aria-hidden />}
        title="Nenhuma conversa ainda"
        description="Crie um canal ou comece uma conversa pela barra lateral."
      />
    </div>
  );
}
