"use client";

import { KeyRound, LogOut } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { signOut } from "../actions/sign-out";
import type { Person } from "../services/chat-api";
import { Avatar } from "./avatar";
import { ChangePasswordDialog } from "./change-password-dialog";
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
 * cabeçalho com o avatar e o nome, "Trocar senha", que abre o diálogo, e o item de sair (spec da
 * F01, "BFF e telas"). Os textos são os dos frames "Casca / Menu do usuário" e "Diálogos / Trocar
 * senha / Menu".
 */
export function UserMenu({ person }: UserMenuProps) {
  const [isSigningOut, startSignOut] = useTransition();
  const [isChangingPassword, setChangingPassword] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  // O menu devolve o foco ao avatar ao fechar; quando ele fecha para abrir o diálogo, isso tiraria
  // o foco da Senha atual, então essa devolução é pulada uma vez.
  const isOpeningDialog = useRef(false);

  // O menu não é modal: o modo modal do Radix põe `aria-hidden` no resto da página, com o avatar
  // focável dentro, o que o axe-core recusa. O foco continua no menu, e Esc ou um clique fora o
  // fecham. O painel fica dentro do Rail, no landmark "Seções", e não num portal.
  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          ref={triggerRef}
          className="rounded-item focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          <Avatar id={person.id} name={person.name} />
          {/* Nome do botão pelo conteúdo, e não por aria-label, porque as iniciais visíveis não fazem parte dele. */}
          <span className="sr-only">Menu de {person.name}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="right"
          align="end"
          inline
          onCloseAutoFocus={(event) => {
            if (isOpeningDialog.current) {
              isOpeningDialog.current = false;
              event.preventDefault();
            }
          }}
        >
          <DropdownMenuLabel className="flex items-center gap-3">
            <Avatar id={person.id} name={person.name} />
            <span className="text-body font-black text-fg">{person.name}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => {
              isOpeningDialog.current = true;
              setChangingPassword(true);
            }}
          >
            <KeyRound className="size-4" aria-hidden />
            Trocar senha
          </DropdownMenuItem>
          <DropdownMenuItem disabled={isSigningOut} onSelect={() => startSignOut(() => signOut())}>
            <LogOut className="size-4" aria-hidden />
            Sair do Full Cycle
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ChangePasswordDialog
        open={isChangingPassword}
        onOpenChange={setChangingPassword}
        returnFocusTo={() => triggerRef.current}
      />
    </>
  );
}
