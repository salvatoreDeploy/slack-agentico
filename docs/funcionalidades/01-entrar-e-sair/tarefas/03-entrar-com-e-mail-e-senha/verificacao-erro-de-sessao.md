# Verificação da porta "Erro de sessão"

Registro do CA10 da F01-T03, feito em 2026-11-17 com o `playwright-cli` no contêiner `e2e`, em modo
headless, contra o `pnpm dev`. É uma verificação do agente, e não um teste da suíte, porque para a
API do chat (`apps/web/AGENTS.md`, "Testes de ponta a ponta", "Paralelismo"). As capturas e os
snapshots foram conferidos e depois descartados, para não pesar no repositório.

Pessoa usada: `ana.verificacao@teste.local`, gravada no banco `chat` com o hash fixo da senha de
teste das fixtures.

## Passos

1. Com a Pessoa já com Sessão no navegador do `playwright-cli`, o contêiner `chat-api` foi
   reiniciado. Ele sobe só com a instalação, sem a aplicação, então a API ficou parada:
   `curl http://localhost:3001/v1/me` não conectou.
2. `goto 'http://localhost:3000/?verificacao=erro'`: a casca chamou `GET /v1/me`, a chamada falhou
   e a tela mostrou a porta "Erro de sessão", em tela cheia, sem o Rail nem a Sidebar:
   "Não foi possível verificar sua sessão", "Confira sua conexão e tente de novo." e o botão
   "Tentar de novo".
3. A API voltou com `pnpm start:dev` e passou a responder 401 sem cookie.
4. O clique em "Tentar de novo" buscou a rota de novo e mostrou a tela pedida, em
   `/?verificacao=erro`, com a casca e "Nenhuma conversa ainda".

## Resultado

A porta aparece quando a verificação falha por rede ou servidor, e "Tentar de novo" recupera a
tela quando a API volta, sem sair nem entrar de novo. Nas capturas, o modo de desenvolvimento do
Next mostrava um selo "Issue" com a falha provocada; no build de produção ele não existe.
