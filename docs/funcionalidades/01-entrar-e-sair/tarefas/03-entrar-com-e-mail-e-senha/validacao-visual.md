# Validação visual da F01-T03

Registro do CA10, feito em 2026-11-17. As telas foram capturadas em 1440 × 900 com o
`playwright-cli` no contêiner `e2e`, em modo headless, contra o `pnpm dev`, nos temas claro e
escuro (o escuro com `data-theme="dark"` na raiz). Elas foram comparadas com os frames do
`slack-ia.pen`, lidos pelo MCP do Pencil (`docs/design-system.md`, "Validação visual").

As capturas foram conferidas e depois descartadas, para não pesar no repositório. Para refazê-las,
siga os passos abaixo.

## Telas conferidas

| Frame do Pencil | Claro | Escuro |
| --- | --- | --- |
| Login / Padrão | Conferido | Conferido |
| Login / Erro de validação | Conferido | Conferido |
| Login / Enviando | Conferido | Conferido |
| Login / Credenciais incorretas | Conferido | Conferido |
| Login / Falha no envio | Conferido | Conferido |
| Home / Vazio | Conferido | Conferido |
| Casca / Menu do usuário | Conferido | Conferido |
| Portas / Carregando o app | Conferido | Conferido |
| Portas / Erro de sessão | Conferido | Conferido |

Como cada estado foi produzido:

- **Erro de validação, credenciais incorretas e falha no envio:** pelo formulário. A falha no
  envio é produzida abortando o `POST` da ação Entrar com um `route` do `run-code`.
- **Enviando:** o envio da ação Entrar foi atrasado 3 s com um `route` do `run-code`. O botão
  mostra o spinner, mantém o texto, fica desabilitado e tem `aria-busy="true"`, o que bloqueia o
  envio duplo.
- **Menu do usuário:** aberto pelo avatar, com a captura feita depois dos 200 ms da animação de
  entrada.
- **Carregando o app:** o contêiner `chat-api` foi congelado com `docker compose pause`, e a casca
  ficou esperando o `GET /v1/me` com a porta na tela.
- **Erro de sessão:** a API parada, como em `verificacao-erro-de-sessao.md`.

## Conferido

- **Tela Entrar:** cartão de 448 px com `rounded-panel`, `shadow-2` e 32 px de respiro, sobre
  `surface-subtle`; o ícone de mensagem no quadrado `sidebar`; título `display` em `font-black`;
  campos de 36 px com rótulo, foco com borda e anel `focus`, erro com borda `danger`; botão de 44 px
  em `primary`. Espaçamentos de 24, 16, 12 e 4 px entre os blocos, como no frame.
- **Home:** Rail de 68 px em `chrome`, com a marca, "Início" e o avatar; Sidebar de 260 px em
  `sidebar`, com o cabeçalho de 49 px; estado vazio centrado na área principal.
- **Menu do usuário:** cartão de 288 px com `shadow-2`, cabeçalho com o avatar e o nome em
  `font-black`. Os itens de Presença, perfil e notificações do frame ficam fora da F01.
- **Portas:** spinner centrado; estado de erro com o ícone de conexão, o título, a descrição e o
  botão "Tentar de novo".

## Ajustes feitos durante a validação

- **A marca "FC" sumia no tema escuro**, porque o fundo usava `surface`, que fica escuro. Ela passou
  a usar `sidebar-fg-strong`, branco nos dois temas, como no frame.

## Diferenças mantidas, para decisão

- **Textos dos erros da tela Entrar.** O código segue o PRD e a spec, que são critério de aceite. O
  frame do Pencil traz outras versões:

  | Estado | Código (PRD e spec) | Frame do Pencil |
  | --- | --- | --- |
  | Credenciais incorretas | "E-mail ou senha incorretos." | "E-mail ou senha incorretos. Confira os dados e tente de novo." |
  | Falha no envio | "Não foi possível entrar agora. Tente de novo em instantes." | "Não foi possível entrar agora. Confira sua conexão e tente de novo." |

  Um dos dois lados precisa mudar para os dois ficarem iguais.
- **Avisos de campo vazio.** O PRD só pede que a tela avise o campo. O código usa "Informe seu
  e-mail." e "Informe sua senha.", e, para e-mail em formato errado, o texto do frame: "Informe um
  e-mail válido, como nome@empresa.com.".
- **Estado vazio da Home.** O texto do frame fala em criar um canal, o que só existe a partir da
  F02. O texto foi mantido como no frame.
