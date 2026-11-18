"use client";

import { WifiOff } from "lucide-react";
import { Button } from "../components/button";
import { EmptyState } from "../components/empty-state";

/**
 * Porta "Erro de sessão": a conferência da Sessão falhou por rede ou servidor. Em tela cheia, sem a
 * casca; "Tentar de novo" busca e renderiza a rota de novo.
 */
export default function SessionError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div className="flex flex-1 items-center justify-center bg-surface">
      <EmptyState
        icon={<WifiOff className="size-6" aria-hidden />}
        title="Não foi possível verificar sua sessão"
        description="Confira sua conexão e tente de novo."
        action={<Button onClick={() => retry()}>Tentar de novo</Button>}
      />
    </div>
  );
}
