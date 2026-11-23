# Validação visual: Mensagem não enviada (F02-T04)

Registro do CA4 da F02-T04, feito em 2026-11-22. Compara a Mensagem `failed` com o frame
`Conversa / Mensagem / Falha no envio` do Pencil (`slack-ia.pen`), como manda o
`docs/design-system.md`, "Validação visual".

## Como o estado foi produzido

Com o `playwright-cli` no contêiner `e2e`, contra o `pnpm dev`, em 1440 × 900, por um script
`run-code`. Foram gravados no banco `chat` uma Pessoa de verificação e o Canal
`#verificacao-f02t04`, apagados no fim. O envio da Server Action foi bloqueado pelo `page.route`
(requisições com o cabeçalho `next-action`), e uma Mensagem foi enviada pelo composer. O tema
escuro foi ligado com `data-theme="dark"` na raiz, e o estado foi capturado nos dois temas.

## Resultado

| Item | Frame | Código | Resultado |
| --- | --- | --- | --- |
| Linha da falha | `padding` 4 em cima, `gap` 8, alinhada ao centro | `flex items-center gap-2 pt-1` | Igual |
| Ícone | `circle-alert` de 16, no tom de erro | `CircleAlert` com `size-4`, herdando `text-danger-fg` | Igual |
| Aviso | "Não foi possível enviar.", Lato 13, no tom de erro | `text-small text-danger-fg` | Igual |
| "Tentar de novo" | Botão sem fundo, no tom de link, raio 4 | `Button` na variante `link`, tamanho `inline` (`text-caption`, `rounded`) | Igual |
| Tema escuro | Variables do tema escuro | Tokens do tema escuro | Coerente |

## Diferenças que ficam

- **"Descartar":** o frame tem esse botão ao lado de "Tentar de novo". Ele fica fora da F02, como
  decidiu a F02-T01.
- **Ícone de "Tentar de novo":** o frame tem um ícone desligado no botão. O código segue o frame
  sem ele.

As capturas da conferência ficam na pasta da tarefa até o de acordo do usuário e são apagadas
antes do commit (`AGENTS.md` da raiz, "Planejamento").
