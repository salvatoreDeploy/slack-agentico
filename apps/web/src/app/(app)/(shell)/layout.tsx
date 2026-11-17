import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { Rail } from "../../components/rail";
import { Sidebar } from "../../components/sidebar";
import { getMe } from "../../services/chat-api";
import { HOME_PATH, signInPath } from "../../utils/return-path";
import { SESSION_COOKIE } from "../../utils/session-cookie";
import { RETURN_PATH_HEADER } from "../../../proxy";

/**
 * A casca das telas com Sessão. Confere a Sessão de verdade na API do chat; um 401 passa pelo
 * Route Handler que apaga o cookie, porque um Server Component não grava cookie (LLD, "Sessão no
 * cliente"). Uma falha de rede ou um 5xx sobe para a porta "Erro de sessão".
 */
export default async function shellLayout({ children }: LayoutProps<"/">) {
  const returnPath = (await headers()).get(RETURN_PATH_HEADER) ?? HOME_PATH;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    redirect(signInPath(returnPath));
  }
  const me = await getMe(token);
  if (me.status === "unauthenticated") {
    redirect(`/api/sessao/expirada?voltar=${encodeURIComponent(returnPath)}`);
  }

  return (
    <div className="flex h-full flex-1">
      <Rail person={me.person} />
      <Sidebar />
      <main className="flex flex-1 flex-col bg-surface">{children}</main>
    </div>
  );
}
