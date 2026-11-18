# Plano da F01-T06: Vencimento, renovação e revogação de Sessões

Tarefa: [tarefa.md](tarefa.md) · Spec: [spec.md](../../spec.md) · PRD: [prd.md](../../prd.md)

## Critérios

### CA1

**Marca:** teste HTTP

**Cenário:** Dado uma Pessoa com Sessão, envelhecida no Arrange pelo atalho da base de testes (o
`last_used_at` e o `expires_at` recuam juntos, como se o tempo passasse), quando ela faz
`GET /v1/me`:
- envelhecida 25 h (mais que o `intervalo de renovação da sessão`), a resposta é 200, e a linha fica
  com `last_used_at` ≈ agora e `expires_at` ≈ agora + 30 dias;
- envelhecida 23 h (menos que o intervalo), a resposta é 200, e `last_used_at` e `expires_at` não
  mudam;
- envelhecida 30 dias e 1 min (sem uso pela `duração da sessão`), a resposta é 401
  `unauthenticated`, e a linha some.

**Teste previsto:** e2e da API, `test/me.e2e-spec.ts`, "renova a validade quando passou o intervalo
de renovação", "não renova antes do intervalo de renovação", "responde 401 e apaga a Sessão sem uso
pela duração da sessão".

### CA2

**Marca:** teste de integração

**Cenário:** Dado duas Pessoas, a primeira com três Sessões e a segunda com uma, quando o serviço
de Sessões apaga:
- todas as da primeira, as três somem, o serviço devolve 3 e a da segunda continua;
- todas as da primeira exceto uma indicada, duas somem, o serviço devolve 2 e a indicada continua.

**Teste previsto:** integração, `src/sessions/sessions.service.int-spec.ts`, "apaga todas as
Sessões da Pessoa e diz quantas eram", "apaga todas exceto a indicada".

### CA3

**Marca:** teste de integração

**Cenário:** Dado o comando de contas com uma leitura de senha que devolve a entrada dada, quando
o Operador roda:
- `revoke-sessions <e-mail>` de uma Pessoa com duas Sessões, as duas somem, a saída diz "2" e o
  código é 0; o e-mail é aceito com maiúsculas e espaços;
- `reset-password <e-mail>` com a senha digitada duas vezes iguais, o hash muda, a senha nova confere
  com ele, todas as Sessões somem e a saída não mostra a senha nem o hash;
- `purge-expired-sessions`, só as Sessões com `expires_at` no passado somem, a saída diz quantas
  eram, e rodar de novo diz 0;
- com erro, nada muda, o código é diferente de zero e a mensagem diz o que corrigir: e-mail sem
  Pessoa (no `revoke-sessions` e no `reset-password`, antes de pedir a senha), as duas leituras da
  senha diferentes, a senha fora do `tamanho da senha`, operação desconhecida e argumento faltando
  ou sobrando.

**Teste previsto:** integração, `src/accounts/accounts-command.int-spec.ts`, os blocos
`revoke-sessions`, `reset-password` e `purge-expired-sessions`, um caso por situação acima.

### CA4

**Marca:** documento

**Cenário:** Quem revisa abre o `apps/chat-api/AGENTS.md`, seção "Comandos", e encontra
`reset-password`, `revoke-sessions` e `purge-expired-sessions` com o que cada um faz, que os dois
últimos dizem quantas Sessões apagaram, e um exemplo de chamada de cada, com o
`docker compose -f compose.yaml exec chat-api`.

### CA5

**Marca:** teste no Playwright

**Cenário:** Dado uma Pessoa com Sessão numa página da casca, quando as Sessões dela são apagadas no
banco no Arrange, como o `revoke-sessions` apaga, e ela recarrega a página, então ela vai para
`/entrar?voltar=<a página>`, e o cookie some. O plano de testes e2e marca o cenário como da revogação
(F01-T06).

O plano ganha também o cenário 5.5, `sessao-vencida-volta-para-entrar`: com as Sessões
envelhecidas 30 dias e 1 min no Arrange, a próxima navegação leva a `/entrar?voltar=<a página>`.

**Teste previsto:** Playwright, `e2e/01-entrar-e-sair/sessao-invalida-volta-para-entrar.spec.ts`, o
cenário 5.3, criado na F01-T03, e o novo `sessao-vencida-volta-para-entrar.spec.ts`.

## Contrato

O contrato não muda.

## Verificação do contrato

Nenhum item: a tarefa não cria nem muda rota, evento ou tabela. A renovação muda só o que a
`GET /v1/me` e as outras rotas protegidas gravam na linha, provado pelo CA1.

## Decisões

- **Renovação no guard.** O `SessionsService.authenticate` grava a renovação com um `UPDATE`
  condicional (`WHERE id = $1 AND last_used_at <= now() - interval`), para duas requisições
  simultâneas não renovarem duas vezes. Os tempos vêm do `now()` do banco, como nos atalhos.
  `SESSION_RENEWAL_INTERVAL_MS` = 24 h entra em `src/sessions/session-rules.ts`.
- **Revogação.** `SessionsService.revokeAll(personId, { except?: sessionId })` devolve quantas
  Sessões apagou, com um `DELETE … RETURNING` no repository. Esta tarefa usa a forma "todas"; a
  F01-T07 usa a "exceto uma". `purgeExpired()` apaga as de `expires_at` no passado e devolve
  quantas eram, pelo índice de `expires_at`.
- **`reset-password`.** O comando confere o e-mail antes de pedir a senha, para o Operador não
  digitá-la à toa, e por isso abre o contexto do Nest antes da leitura. A troca do hash
  (`PeopleService.setPassword(personId, password)`, que valida o `tamanho da senha`) e o
  `revokeAll` rodam numa transação só, aberta pelo executor do comando com o
  `TransactionHost.withTransaction` do cls, porque é ele que chama os services de Pessoas e de
  Sessões (spec, "Comando de contas"); assim nenhum dos dois services passa a depender do outro
  só por esta operação.
- **Saídas do comando.** "Sessões revogadas: <n>.", "Senha redefinida; Sessões revogadas: <n>." e
  "Sessões vencidas apagadas: <n>.". Nenhuma mostra a senha nem o hash. O `USAGE` passa a listar as
  quatro operações.
- **Atalho da base de testes.** `ageSessions(person, ms)` recua o `last_used_at` e o `expires_at`
  juntos e substitui o `expireSessions`, que só mexia no `expires_at`.
- **Tempo real.** A F01 não sobe o WebSocket; a "próxima ação" é a navegação ou a chamada ao BFF
  (spec, "Tempo real").
- **CA5 sem teste repetido.** O cenário 5.3 da F01-T03 (`sessao-invalida-volta-para-entrar`) já
  apaga as Sessões no Arrange, o mesmo estado que o `revoke-sessions` deixa, e prova o CA5. Para o
  vencimento da H3 também passar pela tela, entra o cenário `sessao-vencida-volta-para-entrar`: as
  linhas envelhecidas 30 dias e 1 min no Arrange, e a próxima navegação leva a Entrar.
- **`reset-password` não mexe no limite de tentativas.** A linha de `login_attempts` do e-mail
  fica; um bloqueio em curso passa sozinho, como o LLD já diz, sem depender do Operador.

## Arquivos e interfaces

**API do chat**

- `src/sessions/session-rules.ts`: `SESSION_RENEWAL_INTERVAL_MS`.
- `src/sessions/sessions.repository.ts`: `renew(id)`, `deleteByPerson(personId, exceptId?)` e
  `deleteExpired()`, os dois últimos devolvendo a contagem.
- `src/sessions/sessions.service.ts`: a renovação no `authenticate`, `revokeAll` e `purgeExpired`.
- `src/sessions/sessions.module.ts`: exporta o `SessionsService`.
- `src/sessions/sessions.service.int-spec.ts`: novo.
- `src/people/people.service.ts`: `setPassword(personId, password)`.
- `src/people/people.repository.ts`: `updatePasswordHash(personId, hash)`.
- `src/accounts/accounts-command.ts`: as operações `revoke-sessions`, `reset-password` e
  `purge-expired-sessions`, com a transação do `reset-password`, a recusa do e-mail sem Pessoa e o
  `USAGE`.
- `src/accounts/accounts.module.ts`: importa o `SessionsModule`.
- `test/support/auth-routes.ts`: `ageSessions` no lugar de `expireSessions`.
- `apps/chat-api/AGENTS.md`, seção "Comandos": as três operações com exemplos.

**Web**

- `e2e/plans/01-entrar-e-sair.plan.md`: o cenário 5.3 marcado também como da F01-T06 e o 5.5
  `sessao-vencida-volta-para-entrar`.
- `e2e/fixtures.ts`: `ageSessions(database, person, ms)`.
- `e2e/01-entrar-e-sair/sessao-vencida-volta-para-entrar.spec.ts`: novo.

## Testes existentes que mudam

- `test/me.e2e-spec.ts`, "responde 401 e apaga a Sessão vencida": passa a envelhecer a Sessão com
  `ageSessions` (vira o terceiro caso do CA1), porque o `expireSessions` sai.

## Mudança de dados

Nenhuma.

## Documentos atualizados

Nenhum. A renovação, o vencimento, a revogação e a rotina manual já estão no LLD ("Sessão e
login", "Processos de segundo plano" e "Valores e configuração"); a situação "planejada" muda no PR
da tarefa.
