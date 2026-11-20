# Validação visual: menu do usuário com o item de sair (F01-T04)

Comparação da Home com o menu do usuário aberto com o frame "Casca / Menu do usuário /
Disponível" do Pencil (`slack-ia.pen`), pelo `get_screenshot` do painel `UserMenu` do frame.

## Como o estado foi produzido

`playwright-cli` no contêiner `e2e`, contra o `pnpm dev`, em 1440 × 900: entrar com uma Pessoa de
verificação e clicar no avatar do Rail. O tema escuro foi ligado com `data-theme="dark"` na raiz.
As capturas, nos dois temas, foram conferidas pelo usuário e apagadas antes do
commit (`AGENTS.md` da raiz, "Planejamento").

## O que foi comparado

Só o que a F01 mostra: o cabeçalho (avatar e nome, sem a linha de Presença), o separador e o item
de sair. "Definir como ausente", "Perfil", "Editar perfil" e as notificações ficam para as
funcionalidades donas (spec da F01, "BFF e telas"); "Trocar senha" entra com a F01-T07.

| Ponto | Frame | Tela | Resultado |
| --- | --- | --- | --- |
| Cartão | Raio do cartão, elevação 2, largura 288 | `rounded-card`, `shadow-2`, `w-72` | Igual |
| Cabeçalho | Avatar de iniciais e nome em black | Igual | Igual |
| Separador | 1 px, com 8 px em cima e embaixo | `my-2`, `h-px`, `border-subtle` | Igual |
| Item | Ícone `log-out` de 16 px, texto "Sair do Full Cycle", recuo de 16 px | `LogOut` `size-4`, `px-4`, `h-8` | Igual |
| Tema escuro | Variables do tema escuro | Tokens do tema escuro | Coerente |

O destaque do item (`sidebar-active`) e o foco foram conferidos pelo teste `sai-pelo-teclado`, que
leva o foco ao item pelas setas.
