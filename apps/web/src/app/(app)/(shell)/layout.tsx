import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Rail } from "../../components/rail";
import { Sidebar } from "../../components/sidebar";
import { Toaster } from "../../components/toaster";
import { getMe, listChannels } from "../../services/chat-api";
import { signInPath } from "../../utils/return-path";
import { SESSION_COOKIE } from "../../utils/session-cookie-name";
import { redirectToExpiredSession, requestedPath } from "../../utils/session-redirect";

/**
 * A casca das telas com Sessão. Confere a Sessão de verdade na API do chat; um 401 passa pelo
 * Route Handler que apaga o cookie, porque um Server Component não grava cookie (LLD, "Sessão no
 * cliente"). Uma falha de rede ou um 5xx sobe para a porta "Erro de sessão". Carrega também os
 * Canais da barra lateral.
 */
export default async function ShellLayout({ children }: LayoutProps<"/">) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    redirect(signInPath(await requestedPath()));
  }
  const [me, channels] = await Promise.all([getMe(token), listChannels(token)]);
  if (me.status === "unauthenticated" || channels.status === "unauthenticated") {
    return redirectToExpiredSession();
  }

  return (
    <div className="flex h-full flex-1">
      <Rail person={me.person} />
      <Sidebar channels={channels.channels} />
      <main className="flex flex-1 flex-col bg-surface">{children}</main>
      <Toaster />
    </div>
  );
}
