# Roteiro manual: Acessibilidade da tela Entrar no Lighthouse

Registro do CA10 da F01-T03. Feito por uma pessoa, no Chrome da máquina, porque o Lighthouse do
DevTools não roda no contêiner `e2e`.

## Preparação

1. Ambiente de pé (`AGENTS.md` da raiz, "Subir e derrubar"), com a API do chat e o build de
   produção da web: `docker compose -f compose.yaml exec web pnpm build` e
   `docker compose -f compose.yaml exec web pnpm start --hostname 0.0.0.0`. O modo de
   desenvolvimento acrescenta o indicador do Next, que o Lighthouse também avalia.
2. Uma janela anônima do Chrome, sem extensões, em `http://localhost:3000/entrar`.

## Passos

1. Abrir o DevTools, aba Lighthouse.
2. Modo "Navegação", dispositivo "Computador", só a categoria "Acessibilidade".
3. Clicar em "Analisar carregamento de página".
4. Anotar a nota e, se ela for menor que 100, cada item reprovado.

## Resultado

| Data | Quem | Versão do Chrome | Nota | Itens reprovados |
| --- | --- | --- | --- | --- |
| A preencher | A preencher | A preencher | A preencher | A preencher |

A suíte já roda o axe-core na tela Entrar e na Home, sem violações
(`e2e/01-entrar-e-sair/acessibilidade-entrar-e-home.spec.ts`), mas o critério pede a nota do
Lighthouse.
