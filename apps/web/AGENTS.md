<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


## Comandos

Todos rodam no contêiner `web`, a partir da raiz do repositório:

```bash
docker compose -f compose.yaml exec web <comando>
```

| Comando | O que faz |
| --- | --- |
| `pnpm dev --hostname 0.0.0.0` | Sobe o servidor de desenvolvimento (`http://localhost:3000`) |
| `pnpm lint` | ESLint com as regras do `eslint-config-next` |
| `pnpm exec tsc --noEmit` | Checagem de tipos |
| `pnpm build` | Compila a aplicação para produção |
| `pnpm start --hostname 0.0.0.0` | Sobe o build de produção em `http://localhost:3000`, no lugar do `pnpm dev`; é contra ele que a suíte roda na Verificação completa |

Os testes de ponta a ponta rodam no contêiner `e2e` (`AGENTS.md` da raiz, "Subir e derrubar"), com a web, a API do chat e o Serviço de agentes de pé:

```bash
docker compose -f compose.yaml exec e2e <comando>
```

| Comando | O que faz |
| --- | --- |
| `npm run test:e2e` | Suíte do Playwright (`e2e/**/*.spec.ts`), só no Chromium e em modo headless |
| `npx playwright cli <comando>` | O `playwright-cli` do pacote instalado, sem instalação global |

A imagem do `e2e` tem npm, e não pnpm: os dois comandos só chamam o que o `pnpm install` do contêiner `web` instalou. A versão da imagem no `compose.yaml` é a mesma, exata, do `@playwright/test` no `package.json`; uma muda junto com a outra.

## Testes de ponta a ponta

O Playwright é a ferramenta de ponta a ponta da web, e só dela: testa a aplicação pelo navegador, sem component testing e sem a fixture `request`. A API do chat tem as suítes próprias (`apps/chat-api/AGENTS.md`). O porquê está no `docs/lld.md`, "Estrutura do código".

**Como escrever e corrigir os testes:** pela skill `playwright-cli`, no fluxo planejar, gerar e corrigir (`references/test-generation.md`).

- **Contra qual servidor:** ao escrever e corrigir testes com a skill, contra o `pnpm dev`. Na Verificação completa, contra o build de produção (`pnpm start`), como o Next recomenda.
- **Configuração:** o `playwright.config.ts` não tem `webServer`, porque o ambiente sobe pelos comandos dos contêineres. O `baseURL` é `http://localhost:3000`, pelo encaminhamento do contêiner `e2e`.

- **Onde rodam:** todo comando da skill roda no contêiner `e2e`, com o `playwright-cli` do pacote instalado: `docker compose -f compose.yaml exec e2e npx playwright cli <comando>` e `... exec e2e npx playwright test <arquivo> --debug=cli`. Nada de `playwright-cli` global nem de comando na máquina.
- **Headless em tudo:** a suíte, as sessões do `playwright-cli`, o `attach` do `--debug=cli` e as capturas da validação visual. O contêiner não tem tela, então `--headed` e `--ui` não se usam. Só o Chromium, com a janela em 1440 × 900. O relatório HTML nunca abre sozinho.
- **Plano de testes e2e:** o arquivo de cenários que a skill chama de "spec", um por funcionalidade, que aponta para a spec dela. Ele é dono dos passos de cada cenário, e a spec da funcionalidade continua dona do que é coberto. No projeto, nunca é chamado de "spec" nem de "plano" sozinho, porque esses são os documentos do planejamento (`AGENTS.md` da raiz, "Planejamento").
- **Pastas:**
  - `e2e/seed.spec.ts`: o teste-semente, de onde parte toda sessão de planejar e gerar.
  - `e2e/fixtures.ts`: as fixtures compartilhadas.
  - `e2e/<NN>-<funcionalidade>/<cenário>.spec.ts`: um teste por arquivo, com o nome do cenário em kebab-case, igual ao do plano.
  - `e2e/plans/<NN>-<funcionalidade>.plan.md`: o plano de testes e2e da funcionalidade.
- **Dados:** cada teste cria os próprios dados pelas fixtures e os apaga ao fim, com e-mails únicos (`docs/lld.md`, "Ambiente de desenvolvimento").
- **Paralelismo:** a suíte roda em paralelo (`fullyParallel`, workers padrão). Um cenário que para um serviço ou muda uma configuração global não entra na suíte: vira uma verificação do agente com o `playwright-cli`, registrada na pasta da tarefa.
- **Falhas:** sem retries, porque um teste intermitente é bug a corrigir. Na falha, ficam o `trace` e a captura, sem vídeo, fora do git. A correção segue o passo "heal" da skill: reabrir o teste com `--debug=cli`, entrar com `attach` e corrigir um teste por vez.

## Verificação completa

1. `pnpm lint`
2. `pnpm exec tsc --noEmit`
3. `pnpm build`
4. Testes de ponta a ponta contra o build de produção, com a API do chat (e, quando a funcionalidade usar, o Serviço de agentes) de pé:
   1. Parar o `pnpm dev` no contêiner `web`.
   2. Subir `pnpm start --hostname 0.0.0.0` em segundo plano, sobre o build do passo 3.
   3. Rodar `npm run test:e2e` no contêiner `e2e`.
   4. Parar o `pnpm start` e voltar ao `pnpm dev`, se for continuar trabalhando.

## Server Components

Todo componente nasce como Server Component. O `"use client"` precisa de um motivo: estado ou efeito, manipulador de evento, API do navegador ou hook que só existe no cliente. Buscar dados, ler cookies, formatar valores e montar layout não são motivo.

## Estrutura de pastas

O código fica em `src/`.

```
src/
  app/          Server Components, páginas, layouts e rotas da aplicação; o CSS global fica em `globals.css`.
    queries/    Arquivos de consultas (queries) da aplicação.
    actions/    Arquivos de ações do servidor (Server Actions) da aplicação.
    components/ Componentes reutilizáveis da aplicação.
    hooks/      Hooks personalizados da aplicação.
    utils/      Funções utilitárias da aplicação.
    services/   Arquivos de serviços da aplicação.
public/         Arquivos estáticos, como imagens e fontes (fora de `src/`).
```

## API Externas

A comunicação com APIs será feita através do `fetch`, mas, não deve ser feita diretamente nos componentes ou Server Actions. Em vez disto, crie serviços http dedicados na pasta `app/services/` e utilize-os nos componentes ou Server Actions.