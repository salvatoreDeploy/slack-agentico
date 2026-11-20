# Plano da F01-T05: Limite de tentativas

Tarefa: [tarefa.md](tarefa.md) · Spec: [spec.md](../../spec.md) · PRD: [prd.md](../../prd.md)

## Critérios

### CA1

**Marca:** teste HTTP

**Cenário:** Dado o `chat_test` migrado, quando a mesma Pessoa erra a senha duas vezes seguidas,
então `login_attempts` tem uma linha só para o e-mail normalizado, com `failures` = 2, e a linha
existe mesmo para um e-mail sem conta. A operação atômica é provada pelas falhas simultâneas do
CA2. As colunas, a chave e o tipo de cada uma são conferidos na migração no fim da tarefa.

**Teste previsto:** e2e da API, `test/login-attempts.e2e-spec.ts`, "guarda uma linha por e-mail
normalizado, somando as falhas".

### CA2

**Marca:** teste HTTP

**Cenário:** Dado uma Pessoa criada (ou um e-mail sem conta, onde dito), com as linhas de
`login_attempts` preparadas no Arrange pelos atalhos da base de testes, quando alguém faz
`POST /v1/sessions`:
- com 4 falhas na janela e a senha errada, a resposta é 429 `too_many_attempts`, com `Retry-After`
  igual à `duração do bloqueio de login` em segundos (900, com 1 s de tolerância), e a linha fica
  com `blocked_until` ≈ agora + 15 min, `failures` = 0;
- com 4 falhas cuja janela começou há mais de 15 min e a senha errada, a resposta é 401
  `invalid_credentials`, e a contagem recomeça em 1;
- com o e-mail bloqueado e a senha certa, a resposta é 429 `too_many_attempts`, com `Retry-After`
  igual aos segundos que faltam, e nenhuma Sessão é criada;
- com o e-mail bloqueado e a senha errada, a resposta é 429, e `blocked_until` e `failures` não
  mudam;
- com o bloqueio já passado (`blocked_until` no passado) e a senha certa, a resposta é 201;
- com 4 falhas e a senha certa, a resposta é 201, e a linha do e-mail some;
- com um e-mail sem conta e 4 falhas, a quinta responde 429, com o mesmo corpo que o de uma conta
  que existe;
- com duas senhas erradas enviadas ao mesmo tempo, a linha fica com `failures` = 2;
- com a senha vazia ou o e-mail em formato inválido, a resposta é 400 `validation_failed`, e
  nenhuma linha é gravada.

**Teste previsto:** e2e da API, `test/login-attempts.e2e-spec.ts`, um caso por situação acima.

### CA3

**Marca:** teste HTTP

**Cenário:** Dado um e-mail com 4 falhas, quando a quinta falha o bloqueia, então sai um log
`warn` com o campo `email_hash` (SHA-256 em hex do e-mail normalizado), e nenhum campo nem a
mensagem do log traz o e-mail.

**Teste previsto:** e2e da API, `test/login-attempts.e2e-spec.ts`, "registra o bloqueio em warn com
o hash do e-mail", com um `vi.spyOn` no `warn` do logger do `nestjs-pino` (o log é o próprio
efeito, rule de testes da API).

### CA4

**Marca:** teste no Playwright e revisão humana

**Cenário:** Dado uma Pessoa da fixture com o e-mail bloqueado no banco (linha gravada no Arrange),
quando ela entra pela tela Entrar com a senha certa, então aparece um `role="alert"` com o texto do
frame "Login / Tentativas demais" ("Muitas tentativas de entrar. Aguarde alguns minutos e tente de
novo."), entre a Senha e o botão; o E-mail e a Senha continuam preenchidos, o foco continua no
botão "Entrar" e a página continua em `/entrar`.

Quem revisa confere que o frame "Login / Tentativas demais" existe no Pencil (já existe; nada é
desenhado nesta tarefa).

**Teste previsto:** Playwright, `e2e/01-entrar-e-sair/tentativas-demais.spec.ts`.

### CA5

**Marca:** teste no Playwright e revisão humana

**Cenário:** A fixture `person` apaga, ao fim do teste, a linha de `login_attempts` do e-mail dela:
o cenário do CA4 deixa uma linha, e depois dele não sobra nenhuma para o e-mail. O plano de testes
e2e ganha a seção "Limite de tentativas (F01-T05)", com o cenário do CA4.

Quem revisa encontra na pasta da tarefa `validacao-visual.md`: a tela Entrar no estado "Tentativas
demais", em 1440 × 900, nos dois temas, comparada com o frame, e como o estado foi produzido.

**Teste previsto:** Playwright, a limpeza é conferida no próprio `tentativas-demais.spec.ts`, num
`test.afterEach` que procura a linha depois da fixture; plano em `e2e/plans/01-entrar-e-sair.plan.md`.

## Contrato

### login_attempts · chat · nova

| Coluna | Tipo | Nulo | Padrão | Observação |
| --- | --- | --- | --- | --- |
| `email` | `text` | não | — | Normalizado; sem referência a `people` |
| `failures` | `integer` | não | — | Falhas na janela atual |
| `window_started_at` | `timestamptz` | não | — | Início da janela |
| `blocked_until` | `timestamptz` | sim | — | Fim do bloqueio |
| `created_at` | `timestamptz` | não | `now()` | — |
| `updated_at` | `timestamptz` | não | `now()` | — |

- Chave primária: `email`.
- Sem únicas além da chave, sem chaves estrangeiras e sem índices extras.

### POST /v1/sessions · alterada

| Item | Antes | Depois |
| --- | --- | --- |
| Cabeçalhos de resposta | Nenhum | `Retry-After` (inteiro, segundos até o fim do bloqueio), só no 429 |
| Erros | 400 `validation_failed`; 401 `invalid_credentials` | Os mesmos e 429 `too_many_attempts` |

## Verificação do contrato

- `login_attempts`, uma linha por e-mail (chave primária) e o upsert atômico: CA1 e CA2 (falhas
  simultâneas).
- `POST /v1/sessions` 429 `too_many_attempts` com `Retry-After`: CA2. 201, 400 e 401 com o limite
  no caminho: CA2.

## Decisões

- **Onde mora.** O limite fica no módulo `sessions` (LLD, "Módulos da API do chat"), numa entidade
  `LoginAttempt`, num `LoginAttemptsRepository` e num `LoginAttemptsService`, que o
  `SessionsService.login` chama. A F01-T07 reaproveita o mesmo service na troca de senha.
- **Ordem no login** (LLD, "Sessão e login", "Login"): normaliza o e-mail; consulta o bloqueio;
  bloqueado, lança `TooManyAttemptsError` sem conferir a senha; confere a senha; errada, registra a
  falha e lança `InvalidCredentialsError` ou, se a falha bloqueou, `TooManyAttemptsError`; certa,
  apaga a linha e cria a Sessão.
- **Registro da falha numa instrução só.** `INSERT … ON CONFLICT (email) DO UPDATE … WHERE
  blocked_until IS NULL OR blocked_until <= now() RETURNING …`, com as regras da janela e do
  bloqueio em `CASE`. O `WHERE` faz uma falha que chega depois de outra ter bloqueado não mexer na
  linha; sem linha devolvida, a falha responde 429. Os tempos vêm do `now()` do banco, como nos
  atalhos dos testes.
- **Constantes.** `LOGIN_MAX_FAILURES` = 5, `LOGIN_WINDOW_MS` e `LOGIN_BLOCK_MS` = 15 min, em
  `src/sessions/session-rules.ts` (LLD, "Valores e configuração").
- **`Retry-After`.** O `TooManyAttemptsError` carrega os segundos que faltam, arredondados para
  cima. O filter ganha um gancho genérico: um erro de domínio pode trazer cabeçalhos de resposta,
  que o filter grava antes do corpo. O mapa de status continua só no filter.
- **Código novo.** `too_many_attempts` (429) entra no `ErrorCode` e no `ERROR_STATUS`, com o texto
  "Muitas tentativas de entrar. Aguarde alguns minutos e tente de novo." no `detail`.
- **Log.** O `warn` leva `email_hash` (SHA-256 em hex do e-mail normalizado) e `blocked_until`.
- **Um `warn` por bloqueio,** na falha que o causa. As tentativas recusadas durante o bloqueio não
  geram log, para um ataque não encher o log. O LLD ("Logs") passa a dizer isso.
- **Atalhos da base de testes.** Em `test/support/login-attempts.ts`: `failLogins(app, email, n)`
  (n requisições com senha errada, que falham sozinhas se a resposta não for 401), `blockLogin(email,
  { endsInMs })`, `ageLoginWindow(email, ms)` e `findLoginAttempt(email)`, pelo `queryTestDatabase`.
- **Web.** `createSession` passa a devolver `{ status: "too_many_attempts" }` no 429, e o
  `SignInState.error` ganha `"too_many_attempts"`. O formulário mostra a mensagem no mesmo lugar e
  com os mesmos atributos da "Falha no envio" (spec, "BFF e telas").
- **Campos preenchidos depois do erro.** O React limpa os campos não controlados quando a ação de um
  `<form action>` termina, e hoje a Senha some na "Falha no envio". O formulário passa a enviar pelo
  `onSubmit`, chamando a ação numa transição, o que não limpa os campos; a senha continua fora do
  estado devolvido pela ação. A limpeza da Senha nas credenciais incorretas continua explícita.
- **Fixture.** A `person` apaga a linha de `login_attempts` do e-mail dela antes de apagar a Pessoa,
  e o `fixtures.ts` ganha `blockLogin(database, email)`, que grava a linha bloqueada.
- **Validação visual.** Depende do MCP do Pencil, com o `slack-ia.pen` aberto. O estado é produzido
  com a linha bloqueada gravada no banco `chat`; sem o MCP, a tarefa para no CA5 e avisa.

## Arquivos e interfaces

**API do chat**

- `src/sessions/login-attempt.entity.ts`: a entidade `LoginAttempt`.
- `src/sessions/login-attempts.repository.ts`: `findBlockedUntil(email)`, `registerFailure(email)`
  (devolve `{ blockedUntil } | null`, nulo quando já estava bloqueado), `clear(email)`.
- `src/sessions/login-attempts.service.ts`: `assertNotBlocked(email)`, `registerFailure(email)`,
  `clear(email)`, com o log do bloqueio.
- `src/sessions/sessions.service.ts`: o `login` com o limite.
- `src/sessions/sessions.errors.ts`: `TooManyAttemptsError(retryAfterSeconds)`.
- `src/sessions/session-rules.ts`: as constantes do limite.
- `src/sessions/sessions.controller.ts`: `@ApiProblemResponse(429, ['too_many_attempts'])`, com o
  cabeçalho `Retry-After` no contrato.
- `src/sessions/sessions.module.ts`: a entidade e as peças novas.
- `src/common/errors/domain.error.ts`: o campo opcional `headers`.
- `src/common/errors/error-code.ts` e `problem-details.filter.ts`: `too_many_attempts` e a gravação
  dos cabeçalhos do erro.
- `src/common/errors/problem-response.decorator.ts`: os cabeçalhos de resposta, se o decorator ainda
  não os aceitar.
- `migrations/<timestamp>-CreateLoginAttempts.ts`.
- `openapi.json`: regravado.
- `test/support/login-attempts.ts` e `test/login-attempts.e2e-spec.ts`: novos.

**Web**

- `src/app/services/chat-api.ts`: o resultado `too_many_attempts`.
- `src/app/actions/sign-in.ts`: o erro `too_many_attempts` no estado.
- `src/app/entrar/sign-in-form.tsx`: a mensagem do frame e o envio pelo `onSubmit`.
- `e2e/fixtures.ts`: a limpeza das tentativas na `person` e `blockLogin`.
- `e2e/01-entrar-e-sair/tentativas-demais.spec.ts`: novo.
- `e2e/plans/01-entrar-e-sair.plan.md`: a seção "Limite de tentativas (F01-T05)".

**Pasta da tarefa**

- `validacao-visual.md`.

## Testes existentes que mudam

- `test/openapi.e2e-spec.ts`: o mesmo teste, contra o snapshot regravado com o 429.
- `test/sessions.e2e-spec.ts`: nenhum caso muda de resultado; os e-mails únicos de cada teste
  mantêm as contagens separadas.
- `e2e/01-entrar-e-sair/falha-no-envio.spec.ts`: passa a conferir também que a Senha continua
  preenchida, como a spec pede para os dois estados.

## Mudança de dados

Nenhuma: a tabela nasce vazia.

## Documentos atualizados

- `docs/lld.md`, seção "Logs": "tentativa de login bloqueada" passa a "bloqueio de login", e o
  `warn` sai um por bloqueio, na falha que o causa, e não a cada tentativa recusada durante ele. O
  algoritmo do hash e o nome do campo ficam neste plano.

A tabela, as regras e os valores já estão na spec e no LLD ("Sessão e login", "Valores e
configuração"); a situação do módulo `sessions` muda no PR da tarefa.
