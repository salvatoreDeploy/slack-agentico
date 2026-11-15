# Verificação do playwright-cli

Registro do CA5 da F01-T02, feito em 2026-11-15, com a web em `pnpm dev` e o contêiner `e2e` de
pé. Todos os comandos rodaram no contêiner `e2e`, em modo headless.

## Sessão própria

1. `npx playwright cli open --browser=chromium http://localhost:3000` abriu a página inicial,
   com o título "Full Cycle Chat" e status 200.
2. `resize 1440 900` e `screenshot` gravaram `pagina-inicial-claro.png`.
3. `eval` pôs `data-theme="dark"` na raiz. O corpo passou a `rgb(26, 29, 33)` (`--surface` escuro,
   `#1a1d21`), com o texto em `rgb(209, 210, 211)` (`--fg` escuro, `#d1d2d3`) e a fonte Lato, e o
   `screenshot` gravou `pagina-inicial-escuro.png`.

O `playwright-cli` procura o canal "chrome" por padrão, que a imagem do Playwright não tem: a
sessão abre com `--browser=chromium`.

## Attach do teste-semente

1. `PLAYWRIGHT_HTML_OPEN=never npx playwright test e2e/seed.spec.ts --debug=cli` pausou o teste no
   início e indicou a sessão `tw-e01ff2`.
2. `npx playwright cli attach tw-e01ff2` entrou na sessão, parada em "Navigate /".
3. `-s=tw-e01ff2 step-over` navegou até a página inicial e parou em `toHaveTitle`.
4. `-s=tw-e01ff2 resume` terminou o teste: `1 passed`.

## Suíte

`npm run test:e2e` no contêiner `e2e`: o teste-semente passa.
