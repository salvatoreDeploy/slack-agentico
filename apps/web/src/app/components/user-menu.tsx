"use client";

import type { Person } from "../services/chat-api";
import { Avatar } from "./avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "./dropdown-menu";

interface UserMenuProps {
  person: Pick<Person, "id" | "name">;
}

/**
 * O menu do usuário, aberto pelo avatar do Rail, por clique ou teclado. Na F01 ele tem o
 * cabeçalho com o avatar e o nome; "Trocar senha" e "Sair" entram com as tarefas F01-T07 e
 * F01-T04, nesta ordem (spec da F01, "BFF e telas").
 */
export function UserMenu({ person }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-item focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
        <Avatar id={person.id} name={person.name} />
        {/* Nome do botão pelo conteúdo, e não por aria-label, porque as iniciais visíveis não fazem parte dele. */}
        <span className="sr-only">Menu de {person.name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end">
        <DropdownMenuLabel className="flex items-center gap-3">
          <Avatar id={person.id} name={person.name} />
          <span className="text-body font-black text-fg">{person.name}</span>
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
