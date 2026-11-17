import { House } from "lucide-react";
import Link from "next/link";
import type { Person } from "../services/chat-api";
import { UserMenu } from "./user-menu";

interface RailProps {
  person: Pick<Person, "id" | "name">;
}

/**
 * Trilho de seções, no fundo `chrome`. Na F01: a marca, "Início" ativo e o avatar do menu do
 * usuário. A Atividade (F08), o controle de tema e a Presença (F09) entram depois.
 */
export function Rail({ person }: RailProps) {
  return (
    <nav aria-label="Seções" className="flex w-rail shrink-0 flex-col items-center gap-2 bg-chrome px-2 py-3">
      <span className="mb-2 flex size-9 items-center justify-center rounded-card bg-sidebar-fg-strong text-small font-black text-chrome">
        FC
      </span>
      <Link
        href="/"
        aria-current="page"
        className="flex w-full flex-col items-center gap-1 py-1 text-caption font-bold text-sidebar-fg-strong"
      >
        <span className="flex size-9 items-center justify-center rounded-card bg-sidebar-hover">
          <House className="size-5" aria-hidden />
        </span>
        Início
      </Link>
      <div className="mt-auto">
        <UserMenu person={person} />
      </div>
    </nav>
  );
}
