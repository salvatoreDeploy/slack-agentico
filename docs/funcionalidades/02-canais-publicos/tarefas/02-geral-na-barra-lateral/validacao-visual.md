# Validação visual: `#geral` e Conversa não encontrada (F02-T02)

Registro do CA8 da F02-T02, feito em 2026-11-21. Compara a casca com a seção Canais, o `#geral`
vazio e a Conversa não encontrada com os frames do Pencil (`slack-ia.pen`), como manda o
`docs/design-system.md`, "Validação visual".

## Os frames

- `Conversa / Lista / Início do canal`: a barra lateral com a seção Canais e a linha do `#geral`
  selecionada, o ConversationHeader e o ConversationIntro do `#geral`.
- `Conversa / Estrutura / Conversa não encontrada`: o EmptyState dentro da casca.

Como as capturas do Pencil saem pequenas, a comparação de medidas foi feita nas propriedades dos
nós do frame, lidas pelo MCP, contra as classes do código. A comparação de cor, tipografia e
composição foi feita nas capturas.

## Como cada estado foi produzido

Com o `playwright-cli` no contêiner `e2e`, contra o `pnpm dev`, em 1440 × 900. Uma Pessoa de
verificação foi gravada no banco `chat`, com a participação nos Canais públicos, e apagada no fim.
O tema escuro foi ligado com `data-theme="dark"` na raiz, e cada estado foi capturado nos dois
temas.

| Estado | Como |
| --- | --- |
| `#geral` vazio | Entrar sem `voltar`; a página inicial leva ao `#geral` |
| Conversa não encontrada | Abrir `/canais/<UUID que não existe>` |

## Resultado

| Item | Frame | Código | Resultado |
| --- | --- | --- | --- |
| Seção Canais | `nav` com 12 em cima e embaixo; seção com 8 nas laterais e 16 embaixo; título numa linha de 28 (Lato 13 bold) | `py-3`; `px-2 pb-4`; `h-7 text-small font-bold` | Igual, depois do ajuste |
| Lista e linhas | lista com 4 em cima e `gap` 1; linha de 28, 8 nas laterais, `gap` 8, raio 6, selecionada em `#1264a3` | `pt-1 gap-px`; `h-7 px-2 gap-2 rounded-item`; `bg-sidebar-active` | Igual, depois do ajuste (as linhas tinham 16 nas laterais) |
| Cabeçalho | 49 de altura, 20 nas laterais; ícone `#` de 16 com `gap` 4; nome Lato 18 black; descrição Lato 13 com `gap` 12 | `h-header px-5`; `size-4 gap-1`; `text-title font-black`; `text-small gap-3` | Igual, depois do ajuste (o ícone tinha 20) |
| Começo do Canal | `padding` 32/20/16, `gap` 8; quadro de 48 com raio 8; título Lato 22 black; descrição Lato 15 com 640 de largura | `pt-8 px-5 pb-4 gap-2`; `size-12 rounded-card`; `text-heading font-black`; `text-body max-w-160` | Igual, depois do ajuste (o fim tinha 24) |
| Conversa não encontrada | EmptyState centrado, com título, descrição e o link "Voltar ao início" | O EmptyState da F01, com os textos do frame | Igual |
| Tema escuro | Variables do tema escuro | Tokens do tema escuro | Coerente |

## Diferenças que ficam

Elementos dos frames que são de outras funcionalidades e não entram nesta tarefa, como registra o
`frames-da-f02.md` da F02-T01:

- o composer, que entra na F02-T03;
- a ação "Adicionar canal", na F02-T05;
- o chevron de recolher a seção, porque recolher seção não está no PRD;
- as seções Mensagens diretas e Agentes, as contagens e a contagem de participantes do cabeçalho.

As capturas da conferência ficam na pasta da tarefa até o de acordo do usuário e são apagadas
antes do commit (`AGENTS.md` da raiz, "Planejamento").
