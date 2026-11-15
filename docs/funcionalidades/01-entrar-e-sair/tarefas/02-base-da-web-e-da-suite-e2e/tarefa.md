# 02: Base da web e da suíte e2e

**Status:** concluída

**O que construir:** a base da web e da suíte de ponta a ponta, que as tarefas de tela usam. A web
sobe com a configuração validada, os tokens do design system nos dois temas e a fonte do projeto.
O contêiner `e2e` roda o teste-semente contra a web, em modo headless. Esta tarefa também decide a
ferramenta de design da F01.

Fonte: spec da F01, "Base que a F01 monta" e "Ferramenta de design (questão em aberto)";
`apps/web/AGENTS.md`, "Testes de ponta a ponta"; LLD, "Ambiente de desenvolvimento".

**Bloqueada por:** Nenhuma (pode começar imediatamente)

- [x] **CA1** · O código da web na estrutura de pastas do `AGENTS.md` dela, com a configuração
  validada por `zod` no servidor. O compose passa as variáveis do LLD ("Valores e configuração"),
  e o projeto tem um exemplo de `.env`.
- [x] **CA2** · O conjunto completo de tokens do design system, nos temas claro e escuro, com a
  fonte Lato. O tema claro é o padrão, e o escuro vale com `data-theme="dark"` na raiz.
- [x] **CA3** · O serviço `e2e` no compose, sob o `profile`. Ele encaminha as portas da web e da
  API do chat e recebe o `DATABASE_URL` do banco `chat`. A versão da imagem é igual, exata, à do
  `@playwright/test`.
- [x] **CA4** · A configuração do Playwright como no `apps/web/AGENTS.md`: headless, só Chromium,
  janela de 1440 × 900, sem `webServer`, `baseURL` da web, execução em paralelo, sem retries,
  `trace` e captura só na falha, e relatório sem abrir.
- [x] **CA5** · O teste-semente abre a web e passa com `npm run test:e2e` no contêiner `e2e`. A
  skill `playwright-cli` consegue abrir uma sessão e fazer o `attach` de um teste no
  `--debug=cli`.
- [x] **CA6** · O `pnpm test`, do Vitest, sai da seção "Comandos" e da Verificação completa do
  `apps/web/AGENTS.md`. O nome do "middleware" do Next 16 é conferido no guia do pacote, e o LLD é
  corrigido se ele tiver mudado.
- [x] **CA7** · A ferramenta de design está decidida e registrada no plano desta tarefa. Pode ser o
  Figma, com o arquivo certo confirmado e os frames da F01 lidos pelo MCP, ou o Pencil, com o
  arquivo aberto no aplicativo. O `AGENTS.md` da raiz e o `docs/design-system.md` passam a citar
  a ferramenta e o arquivo escolhidos.
