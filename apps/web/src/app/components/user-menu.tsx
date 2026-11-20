"use client";

import { LogOut } from "lucide-react";
import { useTransition } from "react";
import { signOut } from "../actions/sign-out";
import type { Person } from "../services/chat-api";
import { Avatar } from "./avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

interface UserMenuProps {
  person: Pick<Person, "id" | "name">;
}

/**
 * O menu do usuário, aberto pelo avatar do Rail, por clique ou teclado. Na F01 ele tem o
 * cabeçalho com o avatar e o nome e o item de sair; "Trocar senha" entra antes dele com a tarefa
 * F01-T07 (spec da F01, "BFF e telas"). Os textos são os do frame "Casca / Menu do usuário".
 */
export function UserMenu({ person }: UserMenuProps) {
  const [isSigningOut, startSignOut] = useTransition();

  return (
    // Não modal: o modo modal do Radix põe `aria-hidden` no resto da página, com o avatar focável
    // dentro, o que o axe-core recusa. O foco continua no menu, e Esc ou um clique fora o fecham.
    // O painel fica dentro do Rail, no landmark "Seções", e não num portal.
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="rounded-item focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
        <Avatar id={person.id} name={person.name} />
        {/* Nome do botão pelo conteúdo, e não por aria-label, porque as iniciais visíveis não fazem parte dele. */}
        <span className="sr-only">Menu de {person.name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" inline>
        <DropdownMenuLabel className="flex items-center gap-3">
          <Avatar id={person.id} name={person.name} />
          <span className="text-body font-black text-fg">{person.name}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isSigningOut}
          onSelect={() => startSignOut(() => signOut())}
        >
          <LogOut className="size-4" aria-hidden />
          Sair do Full Cycle
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
