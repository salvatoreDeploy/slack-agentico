# Validação visual: histórico, envio, composer e carregamento (F02-T03)

Registro do CA9 e do CA10 da F02-T03, feito em 2026-11-22. Compara a tela com os frames do Pencil
(`slack-ia.pen`), como manda o `docs/design-system.md`, "Validação visual".

## Os frames

- `Conversa / Estrutura / Canal público`: o histórico, com a MessageItem `full` e o DayDivider.
- `Conversa / Mensagem / Enviando`: a Mensagem com a opacidade de "enviando".
- `Conversa / Composer / Perto do limite` e `Conversa / Composer / Acima do limite`: o contador.
- `Conversa / Estrutura / Histórico carregando`: o esqueleto (CA10).

As medidas foram lidas nas propriedades dos nós do frame, pelo MCP, e comparadas com as classes do
código. A cor, a tipografia e a composição foram comparadas nas capturas.

## Como cada estado foi produzido

Com o `playwright-cli` no contêiner `e2e`, contra o `pnpm dev`, em 1440 × 900, por um script
`run-code`. Foram gravadas no banco `chat` duas Pessoas de verificação e o Canal
`#verificacao-f02t03`, com três Mensagens: duas de 26 e 25 horas antes e uma de 30 minutos antes.
Tudo foi apagado no fim. O tema escuro foi ligado com `data-theme="dark"` na raiz, e cada estado foi
capturado nos dois temas.

| Estado | Como |
| --- | --- |
| Canal com histórico | Abrir o Canal |
| Mensagem enviando | O envio da Server Action segurado pelo `page.route`, depois de Enter |
| Composer perto do limite | 3.850 emojis compostos no campo ("Restam 150 caracteres") |
| Composer acima do limite | 4.012 letras no campo ("12 caracteres acima do limite") |
| Carregamento | A resposta da navegação para o `#geral` segurada por 4 s, depois do clique na barra lateral |

## Resultado

| Item | Frame | Código | Resultado |
| --- | --- | --- | --- |
| MessageItem | `padding` 4/20, `gap` 8; avatar de 36 com raio 6; nome e horário na mesma linha | `px-5 py-1 gap-2`; `Avatar` (`size-9 rounded-item`); `flex items-baseline gap-2` | Igual |
| DayDivider | `padding` 12 em cima e embaixo; linha de 1; pílula de raio total, `padding` 2/12, Lato 13 bold | `py-3`; `h-px`; `rounded-full px-3 py-0.5 text-small font-bold` | Igual |
| Enviando | Opacidade 0,6 | `opacity-60` | Igual |
| Composer | Raio 8 com borda; área de texto com 12/12/4/12; barra com 6 | `rounded-card border`; `px-3 pt-3 pb-1`; `p-1.5` | Igual |
| Contador | "Restam N caracteres" no tom apagado; acima do limite, "N caracteres acima do limite" no tom de erro, com o envio desabilitado | `text-fg-muted`; `text-danger-fg`; `disabled` | Igual |
| Esqueleto | Seis linhas alinhadas ao fim, `gap` 16, `padding` 16/20; quadro de 36 com raio 6; barras de 12 de altura, a primeira com 128 | `justify-end gap-4 px-5 py-4`; `size-9 rounded-item`; `h-3`, `w-32` | Igual; o cabeçalho fica vazio, porque o nome do Canal ainda não é conhecido |
| Tema escuro | Variables do tema escuro | Tokens do tema escuro | Coerente |

## Diferenças que ficam

- **Tipografia do frame:** o nome do autor e o texto aparecem no frame como Inter 12, o mesmo
  artefato de outros frames do arquivo. O código segue o design system: o nome em `text-body
  font-bold` e o texto em `text-body`.
- **Composer perto do limite:** no frame, o texto longo fica numa linha com reticências. No código,
  o campo cresce até 240 px e rola depois disso, para a Pessoa ver o que escreve.
- **Elementos de outras funcionalidades:** ficam fora, como registra o `frames-da-f02.md` da F02-T01:
  - a barra de ações da Mensagem (F07);
  - a ação "Mencionar alguém" do composer (F06);
  - a contagem de participantes do cabeçalho;
  - "Tentar de novo", que entra na F02-T04.

As capturas da conferência ficam na pasta da tarefa até o de acordo do usuário e são apagadas
antes do commit (`AGENTS.md` da raiz, "Planejamento").
