# Plano da F01-T02: Base da web e da suíte e2e

Tarefa: [tarefa.md](tarefa.md) · Spec: [spec.md](../../spec.md) · PRD: [prd.md](../../prd.md)

## Critérios

### CA1

**Marca:** revisão humana

**Cenário:** Dado o diff, quem revisa encontra o schema `zod` das variáveis da web (`CHAT_API_URL`
obrigatória, `SESSION_COOKIE_DOMAIN` opcional), validado uma vez na subida do servidor pelo
`register()` da instrumentação do Next. Quem revisa sobe a web sem `CHAT_API_URL` e vê o
processo falhar com o nome da variável na mensagem. Encontra também as variáveis no `environment`
do `web` no compose e o exemplo de `.env` do projeto.

### CA2

**Marca:** revisão humana

**Cenário:** Dado o `globals.css`, quem revisa encontra todos os tokens das tabelas do
`docs/design-system.md` (cores semânticas nos dois temas, tipografia, espaçamento, raios,
elevação, tamanhos do shell, camadas e movimento), com o claro em `:root` e o escuro em
`[data-theme="dark"]`, e a Lato nos pesos 400, 700 e 900 mais o itálico 400. Abre a página
inicial provisória nos dois temas, trocando o `data-theme` na raiz, e vê o fundo e o texto
mudarem. As duas capturas ficam na pasta desta tarefa.

### CA3

**Marca:** revisão humana

**Cenário:** Dado o `compose.yaml`, quem revisa encontra o serviço `e2e` sob o `profile` `e2e`, na
imagem do Playwright com a mesma versão exata do `@playwright/test` do `package.json` da web,
rodando como o usuário 1000, com o `DATABASE_URL` do banco `chat` e o processo que encaminha
`localhost:3000` para a web e `localhost:3001` para a API do chat.

### CA4

**Marca:** revisão humana

**Cenário:** Dado o `playwright.config.ts`, quem revisa encontra: só o projeto Chromium, headless,
janela de 1440 × 900, sem `webServer`, `baseURL` `http://localhost:3000`, `fullyParallel`, sem
retries, `trace` `retain-on-failure`, captura `only-on-failure`, sem vídeo, relatório HTML com
`open: 'never'` e os artefatos fora do git.

### CA5

**Marca:** teste no Playwright

**Cenário:** Dado o ambiente de pé e o contêiner `e2e`, quando a suíte roda, então o teste-semente
abre a página inicial e passa. Além disso, uma sessão do `playwright-cli` abre a web e faz o
`attach` do teste-semente rodado com `--debug=cli`, e o registro dessa sessão fica na pasta desta
tarefa (`verificacao-playwright-cli.md`).

**Teste previsto:** Playwright, `e2e/seed.spec.ts`, "seed".

### CA6

**Marca:** documento

**Cenário:** Quem revisa encontra o `pnpm test` fora da seção "Comandos" e da Verificação completa
do `apps/web/AGENTS.md`, e o LLD falando em `proxy` do Next, e não em `middleware`, em "Sessão no
cliente".

### CA7

**Marca:** documento

**Cenário:** Quem revisa encontra, no registro `ferramenta-de-design.md` da pasta da tarefa, o
Pencil como ferramenta, o arquivo `.pen` usado e a lista dos frames da F01 lidos pelo MCP dele
(Login, Home / Vazio, menu do usuário e as portas), com os que faltam marcados para desenhar nas
tarefas de tela. O `AGENTS.md` da raiz e o `docs/design-system.md` citam o Pencil e o arquivo.

## Contrato

O contrato não muda.

## Verificação do contrato

Nenhuma: a tarefa não cria rota, evento nem tabela.

## Decisões

- O código vai para `src/app/`, e o alias `@/*` passa a apontar para `src/`. A página inicial do
  esqueleto vira uma página provisória mínima, "Full Cycle Chat", com os tokens, até a tarefa 03
  trocar pela Home. O `<html>` passa a `lang="pt-BR"` e o `metadata` ao nome do produto.
- O módulo de configuração da web fica em `src/config/env.ts`, com `server-only`, e é lido pela
  instrumentação do Next na subida, para uma variável ausente derrubar o servidor e não a primeira
  requisição (LLD, "Configuração").
- Os primitivos e as bibliotecas de interface (Radix, CVA, `lucide-react`, Sonner) não entram
  aqui: entram com as telas que os usam (spec, "Base que a F01 monta").
- O serviço `e2e` usa a imagem `mcr.microsoft.com/playwright:v1.65.1-noble`, a mesma versão exata
  do `@playwright/test` instalado com `pnpm add -E`. Ele roda como o usuário 1000, para os
  artefatos gravados no repositório montado terem o dono do host, e com `working_dir` no projeto
  `web`.
- O encaminhamento de portas do `e2e` é um script Node pequeno, que escuta `localhost:3000` e
  `localhost:3001` e repassa para `web:3000` e `chat-api:3000`. É o comando do serviço. Motivo: a
  imagem já tem Node, e um `socat` exigiria uma imagem própria.
- Os artefatos do Playwright (`test-results/`, `playwright-report/`) entram no `.gitignore` da web.
- O teste-semente abre `/` sem fixture: a fixture `person` e o `loggedInPage` nascem na tarefa 03.
- A seção "Estado atual" e a tabela "Stack de interface" do `docs/design-system.md` dão como já
  instalados no código os componentes da F01, o Radix, a CVA, o `lucide-react`, o Sonner e a Lato.
  Esta tarefa corrige as duas para o estado real ao fim dela (tokens e Lato no código; componentes
  e bibliotecas a instalar com as telas), junto com a mudança da ferramenta de design do CA7.
- A ferramenta de design da F01 é o Pencil, pelo MCP dele, com o arquivo aberto no aplicativo
  (decisão do usuário no planejamento). O arquivo é o `slack-ia.pen`, que tem as seções "Login",
  "Home", "Casca", "Portas e toasts" e as Foundations dos tokens. O plano gratuito do Pencil limita
  os dias de uso do MCP por período; se o limite bloquear o acesso, a tarefa para e avisa. A implementação do CA7 registra o arquivo e lê nele os
  frames da F01. O `docs/design-system.md` passa a descrever o fluxo com o Pencil, e a seção
  "Design e Figma" do `AGENTS.md` da raiz passa a citá-lo.

## Arquivos e interfaces

- `apps/web/src/app/layout.tsx`, `page.tsx` e `globals.css`: movidos de `app/`; layout com Lato e
  `lang="pt-BR"`; página provisória; tokens completos.
- `apps/web/src/config/env.ts`: schema `zod` e `loadEnv()`.
- `apps/web/src/instrumentation.ts`: `register()`, que valida a configuração na subida.
- `apps/web/tsconfig.json`: alias `@/*` para `./src/*`.
- `apps/web/playwright.config.ts`: a configuração da suíte.
- `apps/web/e2e/seed.spec.ts`: o teste-semente.
- `apps/web/package.json`: `@playwright/test` e `zod`, e o script `test:e2e`.
- `apps/web/.env.example` e `apps/web/.gitignore`.
- `docker/e2e/forward-ports.mjs`: o encaminhamento de portas.
- `compose.yaml`: o `environment` do `web` e o serviço `e2e`.
- `apps/web/AGENTS.md`: sem o `pnpm test`.

## Testes existentes que mudam

Nenhum: a web não tem testes.

## Mudança de dados

Nenhuma.

## Documentos atualizados

- `docs/lld.md`, seção "Cliente", "Sessão no cliente": `proxy` do Next no lugar de `middleware`.
- `apps/web/AGENTS.md`, seções "Comandos" e "Verificação completa": sem o `pnpm test` (CA6; este
  arquivo não é documento de arquitetura, mas a tarefa o pede).
