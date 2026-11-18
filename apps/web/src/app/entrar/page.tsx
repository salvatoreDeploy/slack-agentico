import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Spinner } from "../components/spinner";
import { getMe } from "../services/chat-api";
import { HOME_PATH, safeReturnPath } from "../utils/return-path";
import { SESSION_COOKIE } from "../utils/session-cookie-name";
import { SignInForm } from "./sign-in-form";

export default function SignInPage({ searchParams }: PageProps<"/entrar">) {
  return (
    <main className="flex flex-1 items-center justify-center bg-surface-subtle p-6">
      <Suspense fallback={<Spinner label="Carregando" />}>
        <SignInGate searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

/** Quem tem Sessão vai para a Home; os outros veem o formulário, com o `voltar` validado. */
async function SignInGate({ searchParams }: Pick<PageProps<"/entrar">, "searchParams">) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token && (await hasSession(token))) {
    redirect(HOME_PATH);
  }
  const { voltar } = await searchParams;
  return <SignInForm returnPath={safeReturnPath(voltar)} />;
}

/** Uma falha da API aqui não impede de mostrar o formulário: quem não consegue validar, entra de novo. */
async function hasSession(token: string): Promise<boolean> {
  try {
    return (await getMe(token)).status === "ok";
  } catch {
    return false;
  }
}
