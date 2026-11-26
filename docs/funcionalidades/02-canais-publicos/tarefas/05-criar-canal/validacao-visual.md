# Validação visual: Criar Canal (F02-T05)

Registro do CA7 da F02-T05, feito em 2026-11-26. Compara o diálogo "Criar canal" e o Canal vazio
com o criador com os frames do Pencil (`slack-ia.pen`), como manda o `docs/design-system.md`,
"Validação visual".

## Frames refeitos antes da comparação

O `slack-ia.pen` aberto no Pencil não tinha as mudanças que o `frames-da-f02.md` da F02-T01
registra. Por decisão do usuário, elas foram refeitas nesta tarefa, como estão descritas lá:

- `Diálogos / Criar canal / Padrão`, `Erro no nome`, `Enviando` e `Falha ao criar`: "Tópico" virou
  "Descrição", com o contador abaixo do campo ("0/250" nos dois primeiros e "32/250" nos outros).
- `Diálogos / Criar canal / Com nome`: cópia do Padrão, em 7680 × 120 da seção, com "Café & Vendas"
  no nome e "O canal vai se chamar #cafe-vendas." no lugar da dica.
- `Diálogos / Criar canal / Nome inválido`: cópia de `Erro no nome`, em 7680 × 2160 da seção, com o
  nome vazio e "Informe o nome do canal.".
- `Conversa / Lista / Início do canal com criador`: cópia de `Início do canal`, em 7680 × 1140 da
  seção, para o `#vendas`. A linha dele fica ativa na barra lateral, o composer diz "Mensagem para
  #vendas", e "@ana criou este canal em 20 de novembro." aparece antes da descrição.

O `Conversa / Composer / Perto do limite`, da F02-T03, também falta no arquivo e não foi refeito,
porque não é desta tarefa.

## Como os estados foram produzidos

Com o `playwright-cli` no contêiner `e2e`, contra o `pnpm dev`, em 1440 × 900, por um script
`run-code`. Foram gravados no banco `chat` uma Pessoa de verificação (`@ana`) e o Canal `#vendas`,
criado por ela, apagados no fim.

| Estado | Como foi produzido |
| --- | --- |
| Padrão | "Adicionar canal" na barra lateral |
| Com nome | "Café & Vendas" digitado no Nome |
| Nome inválido | "Criar canal" com o Nome vazio |
| Erro no nome | "vendas" no Nome, já usado, e "Criar canal" |
| Enviando | A Server Action segura por 4 segundos pelo `page.route`, com a captura no meio |
| Falha ao criar | A mesma Server Action, interrompida (`route.abort()`) depois da espera |
| Início do canal com criador | O `#vendas` aberto pelo endereço |

O tema escuro foi ligado com `data-theme="dark"` na raiz, e cada estado foi capturado nos dois
temas.

## Resultado

| Item | Frame | Código | Resultado |
| --- | --- | --- | --- |
| "Adicionar canal" | Ícone `+` e o rótulo no fim da seção Canais | `Plus` de 16 e o rótulo, no estilo da SidebarRow | Igual |
| Painel | 512 de largura, raio 8, sombra | `DialogContent` (`max-w-lg`, `rounded-card`, `shadow-3`) | Igual |
| Cabeçalho | "Criar canal", a descrição e o X | `DialogHeader` com os mesmos textos | Igual |
| Nome | Rótulo, campo de 36 com o `#` no começo, e a dica ou a prévia abaixo | `Field` com o `ChannelIcon` dentro do `Input` e a dica ou a prévia | Igual depois do ajuste (abaixo) |
| Descrição | Rótulo com "(opcional)", campo de uma linha e o contador à direita, abaixo | `Field` com o `Input` e o contador alinhado à direita | Igual depois do ajuste (abaixo) |
| Erro no campo | Borda e texto no tom de erro | `aria-invalid` no `Input` e `text-danger-fg` | Igual |
| Enviando | Spinner no "Criar canal", e o "Cancelar" desabilitado | `Button` com `loading`, e o "Cancelar" com `disabled` | Igual depois do ajuste (abaixo) |
| Falha ao criar | O aviso no tom de erro no fim do corpo, com os campos preenchidos | `role="alert"` com `text-danger-fg` no fim do `DialogBody` | Igual |
| Rodapé | "Cancelar" secundário e "Criar canal" primário, à direita | `DialogFooter` com os dois `Button` | Igual |
| Linha do criador | "@ana criou este canal em 20 de novembro.", entre o título e a descrição, no tom apagado | `CreatedByLine` em `text-fg-muted`, entre o título e a descrição | Igual |
| Tema escuro | Sem variables no arquivo (F02-T01) | Tokens do tema escuro | Coerente |

## Ajustes feitos no código pela comparação

- **`#` no Nome:** o frame tem o ícone no começo do campo, e o código não tinha.
- **Descrição de uma linha:** o código usava uma área de texto de 80; o frame tem um campo de 36.
  O campo de uma linha também casa com a regra da descrição, em que a quebra de linha vira espaço.
- **"Cancelar" desabilitado em Enviando:** como no frame.

## Diferenças que ficam

- **"Tornar privado":** está nos frames e fica fora, porque é da F03 (F02-T01).
- **Prévia no Enviando:** o frame mostra a dica embaixo do Nome preenchido. O código mostra a
  prévia do nome, como o frame `Com nome`.
- **Cores dos frames:** os frames do diálogo têm o campo da descrição com fundo escuro e textos em
  tons do tema escuro num diálogo claro. O problema já estava registrado na F02-T01, e o código
  segue os tokens.

As capturas da conferência ficam na pasta da tarefa até o de acordo do usuário e são apagadas
antes do commit (`AGENTS.md` da raiz, "Planejamento").
