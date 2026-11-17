# Plano da F01-T03: Entrar com e-mail e senha

Tarefa: [tarefa.md](tarefa.md) · Spec: [spec.md](../../spec.md) · PRD: [prd.md](../../prd.md)

## Critérios

### CA1

**Marca:** teste de integração

**Cenário:** Dado o `chat_test` migrado, quando o comando de contas cria uma Pessoa, então as
tabelas `people` e `sessions` existem com as colunas, as únicas e a referência da spec, e a linha
da Pessoa é gravada. Uma segunda Pessoa com o mesmo e-mail é recusada pela única do banco, mesmo
sem passar pelo comando.

**Teste previsto:** integração, `src/accounts/accounts-command.int-spec.ts`, "cria a Pessoa com o
e-mail normalizado e o hash da senha"; `src/people/people.repository.int-spec.ts`, "recusa um
segundo registro com o mesmo e-mail".

### CA2

**Marca:** teste de integração

**Cenário:** Dado o comando de contas com uma leitura de senha que devolve a entrada dada, quando o
Operador roda `create`:
- com e-mail, nome e senha válidos, a Pessoa é criada, a senha é lida duas vezes e a saída não
  mostra a senha nem o hash;
- sem `--username`, o @usuário vem do e-mail, com os casos do LLD ("Sessão e login", seção
  "@usuário"): acentos, caractere fora do conjunto, prefixo `p`, mínimo, corte e sufixo numérico;
- com e-mail já usado, @usuário já usado ou inválido, nome fora do `tamanho do nome`, senha fora do
  `tamanho da senha` ou as duas leituras diferentes, nada é criado e o comando sai com código
  diferente de zero e a mensagem do que corrigir.

**Teste previsto:** integração, `src/accounts/accounts-command.int-spec.ts`, um caso por situação
acima.

### CA3

**Marca:** teste HTTP

**Cenário:** Dado uma Pessoa criada, quando alguém faz `POST /v1/sessions`:
- com o e-mail em maiúsculas e com espaços nas pontas e a senha certa, a resposta é 201 com o token
  e a Pessoa, e a Sessão gravada guarda o hash do token, e não o token, com o `expires_at` igual à
  criação mais a `duração da sessão`;
- com e-mail inexistente ou senha errada, a resposta é 401 `invalid_credentials`, com o mesmo corpo
  nos dois casos;
- com e-mail em formato inválido, e-mail acima do `tamanho do e-mail`, senha vazia ou senha acima do
  teto do `tamanho da senha`, a resposta é 400 `validation_failed`.

**Teste previsto:** e2e da API, `test/sessions.e2e-spec.ts`, um caso por situação acima.

### CA4

**Marca:** teste HTTP

**Cenário:** Dado uma Pessoa com Sessão, quando ela faz `GET /v1/me` com o cookie de sessão, então a
resposta é 200 com a Pessoa. Sem o cookie, com um token desconhecido ou com a Sessão vencida
(envelhecida pelo atalho da base de testes), a resposta é 401 `unauthenticated`, e a vencida é
apagada.

**Teste previsto:** e2e da API, `test/me.e2e-spec.ts`, "responde 200 com a Pessoa da Sessão",
"responde 401 sem o cookie", "responde 401 com um token desconhecido", "responde 401 e apaga a
Sessão vencida".

### CA5

**Marca:** teste no Playwright

**Cenário:** Dado uma Pessoa criada pela fixture, quando ela entra pela tela Entrar, então o cookie
de sessão é gravado com os atributos do LLD ("Segurança"), sem ser legível por `document.cookie`, e
ela cai na Home. Quem abre um endereço do produto sem cookie é mandado para
`/entrar?voltar=<caminho>` e, depois de entrar, cai nesse endereço; um `voltar` como `//outro-site`
leva à Home. Quem tem Sessão e abre `/entrar` vai para a Home.

**Teste previsto:** Playwright, `e2e/01-entrar-e-sair/entra-com-email-e-senha.spec.ts`,
`volta-a-pagina-pedida.spec.ts`, `ignora-voltar-externo.spec.ts`,
`com-sessao-abre-entrar-e-vai-para-home.spec.ts`.

### CA6

**Marca:** teste no Playwright

**Cenário:** Dado a tela Entrar, quando a Pessoa:
- abre a tela, o foco está no E-mail;
- envia com um campo vazio, a tela avisa o campo, o foco vai para o primeiro inválido e nada é
  enviado;
- erra o e-mail ou a senha, aparece "E-mail ou senha incorretos." abaixo da Senha, a senha é limpa,
  o foco vai para a Senha e o e-mail continua preenchido;
- envia com a API do chat respondendo erro, aparece "Não foi possível entrar agora. Tente de novo em
  instantes." entre a Senha e o botão, com `role="alert"`.

O estado "enviando" (botão em `loading` e envio duplo bloqueado) é conferido na validação visual do
CA10.

**Teste previsto:** Playwright, `e2e/01-entrar-e-sair/foco-inicial-no-email.spec.ts`,
`avisa-campo-vazio.spec.ts`, `credenciais-incorretas.spec.ts`, `falha-no-envio.spec.ts`. A falha no
envio é produzida interceptando a chamada da Server Action no navegador, sem derrubar a API.

### CA7

**Marca:** teste no Playwright

**Cenário:** Dado uma Pessoa que entrou, quando a Home abre, então mostra o Rail com a marca,
"Início" ativo e o avatar de iniciais, a Sidebar só com o cabeçalho do Workspace e o estado
"Home / Vazio"; o UserMenu abre pelo avatar, por clique e por teclado, com o avatar e o nome dela.
As portas são provadas no CA10: a "Erro de sessão" pela verificação do agente com a API parada, e
a "Carregando o app" pela validação visual, porque o carregamento é rápido demais para um teste
estável.

**Teste previsto:** Playwright, `e2e/01-entrar-e-sair/home-mostra-a-casca.spec.ts`,
`menu-do-usuario-abre-pelo-teclado.spec.ts`.

### CA8

**Marca:** teste no Playwright

**Cenário:** Dado uma Pessoa com Sessão numa página da casca, quando a Sessão some do banco (a linha
é apagada no Arrange) e ela recarrega a página, então o cookie é apagado e ela vai para
`/entrar?voltar=<a página>`.

**Teste previsto:** Playwright, `e2e/01-entrar-e-sair/sessao-invalida-volta-para-entrar.spec.ts`.

### CA9

**Marca:** teste no Playwright

**Cenário:** O plano de testes e2e da F01 existe e aponta para a spec. A suíte cobre, além dos casos
do CA5 ao CA8: uma segunda aba do mesmo navegador já com Sessão; o navegador reaberto, num contexto
novo com o estado guardado, ainda com Sessão; o fluxo inteiro de entrar só pelo teclado; e o axe-core
sem violações na tela Entrar e na Home. As fixtures `person`, que apaga o que criou ao fim, e
`loggedInPage` estão criadas, e o teste-semente abre `/entrar` com uma Pessoa pronta.

**Teste previsto:** Playwright, `e2e/01-entrar-e-sair/segunda-aba-com-sessao.spec.ts`,
`navegador-reaberto-com-sessao.spec.ts`, `entra-so-pelo-teclado.spec.ts`,
`acessibilidade-entrar-e-home.spec.ts`; plano em `e2e/plans/01-entrar-e-sair.plan.md`.

### CA10

**Marca:** revisão humana

**Cenário:** Quem revisa encontra na pasta da tarefa:
- `verificacao-erro-de-sessao.md`: a API do chat parada, uma tela com Sessão mostrando "Portas /
  Erro de sessão", a API de volta e "Tentar de novo" mostrando a tela pedida, com o snapshot e a
  captura;
- as capturas da validação visual da tela Entrar (todos os estados, inclusive "enviando"), da Home
  e das portas, em 1440 × 900 e nos dois temas, comparadas com os frames do Pencil;
- `roteiro-manual.md`: a nota 100 de Acessibilidade do Lighthouse na tela Entrar.

## Contrato

### people · chat · nova

| Coluna | Tipo | Nulo | Padrão | Observação |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | não | — | UUID v7, gerado na aplicação |
| `name` | `text` | não | — | Dentro do `tamanho do nome` (conferido na aplicação) |
| `username` | `text` | não | — | O @usuário, sem o `@` |
| `email` | `text` | não | — | Normalizado (conferido na aplicação) |
| `password_hash` | `text` | não | — | Argon2id |
| `created_at` | `timestamptz` | não | `now()` | — |
| `updated_at` | `timestamptz` | não | `now()` | — |

- Chave primária: `id`.
- Únicas: `email`, `username`.

### sessions · chat · nova

| Coluna | Tipo | Nulo | Padrão | Observação |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | não | — | UUID v7 |
| `person_id` | `uuid` | não | — | Referência a `people.id`, `ON DELETE CASCADE` |
| `token_hash` | `bytea` | não | — | SHA-256 do token |
| `last_used_at` | `timestamptz` | não | — | — |
| `expires_at` | `timestamptz` | não | — | — |
| `created_at` | `timestamptz` | não | `now()` | — |
| `updated_at` | `timestamptz` | não | `now()` | — |

- Chave primária: `id`.
- Única: `token_hash`.
- Chave estrangeira: `person_id` → `people.id`, `ON DELETE CASCADE`.
- Índices: `person_id` e `expires_at`.

### POST /v1/sessions · nova

| Item | O que descreve |
| --- | --- |
| Autenticação | Pública (`@Public()`) |
| Corpo da requisição | `email` (string, obrigatório, sem espaços nas pontas, formato de e-mail, até o `tamanho do e-mail`) e `password` (string, obrigatório, não vazia, até o teto do `tamanho da senha`) |
| Resposta de sucesso | 201 `{ token, person: { id, name, username, email } }` |
| Erros | 400 `validation_failed`; 401 `invalid_credentials` |

O limite de tentativas e o 429 `too_many_attempts` entram com a tarefa 05.

### GET /v1/me · nova

| Item | O que descreve |
| --- | --- |
| Autenticação | Cookie de sessão (`session`) |
| Resposta de sucesso | 200 `{ id, name, username, email }` |
| Erros | 401 `unauthenticated` |

### GET /api/sessao/expirada · nova (BFF)

| Item | O que descreve |
| --- | --- |
| Autenticação | Pública |
| Parâmetros de consulta | `voltar` (string, opcional; validado pela regra do `voltar` do LLD, "Sessão no cliente") |
| Resposta de sucesso | 307 para `/entrar?voltar=<voltar validado>` |
| Cabeçalhos de resposta | `Set-Cookie` que apaga o cookie `session` |
| Rota da API que chama | Nenhuma |

## Verificação do contrato

- `people`, única de `email`: CA1. Única de `username`: CA2 (o comando recusa e a única garante).
- `sessions`, gravação do hash e do `expires_at`: CA3. Referência e `ON DELETE CASCADE`: sem teste
  nesta tarefa; a exclusão de Pessoa não tem rota nem comando, e a regra entra no teste quando
  houver.
- `POST /v1/sessions` 201, 400 e 401: CA3.
- `GET /v1/me` 200 e 401: CA4.
- `GET /api/sessao/expirada`, cookie apagado e redirecionamento com o `voltar`: CA8.

## Decisões

- **Comando de contas.** O `pnpm accounts` roda do build (`nest build` e depois `node` sobre o
  `dist`), porque o `tsx` não emite os metadados de tipo de que a injeção do Nest depende. A leitura
  da senha (`@inquirer/password`, sem eco) é um parâmetro do executor do comando, e não um
  provider: o `cli.ts` passa a leitura do terminal, e o teste passa uma função que devolve a entrada
  dada, sem `overrideProvider`. O executor sobe o contexto do Nest sem HTTP e abre o contexto do cls
  com `ClsService.run`.
- **Derivação do @usuário.** Uma função pura do módulo `people`, provada pelos testes de integração
  do comando (spec, "Decisões de teste").
- **Sessão.** Token de 32 bytes do `crypto.randomBytes`, em base64url; o hash é o SHA-256 em
  `bytea`. Esta tarefa já confere o vencimento e apaga a Sessão vencida ao encontrá-la (LLD, "Sessão
  e login", "Validação de cada requisição", passos 1 e 2). A renovação (passo 3) entra com a tarefa
  06.
- **Hash de senha.** `@node-rs/argon2`, com os parâmetros do LLD. O hash fixo para e-mail inexistente
  é calculado uma vez, na subida do módulo `sessions`.
- **Cookie na API do chat.** O guard lê o cabeçalho `Cookie` com o pacote `cookie`, sem middleware
  global, porque só o guard precisa dele.
- **Entrada do login.** O DTO tira os espaços das pontas do e-mail antes de validar o formato,
  porque o PRD aceita o e-mail com espaços; a normalização para minúsculas fica no service.
- **Contrato.** Os DTOs e as respostas de erro levam `@ApiProperty` e `@ApiResponse` explícitos, com
  os códigos de erro como enum, porque o plugin do `@nestjs/swagger` não roda no `tsx` nem no
  Vitest. O snapshot é regravado com `pnpm openapi`.
- **Código novo.** `invalid_credentials` (401) entra no `ErrorCode` e no mapa do filter.
- **401 ao renderizar.** Um Server Component não grava cookie, então o layout das telas com Sessão,
  ao receber 401 de `GET /v1/me`, redireciona para `GET /api/sessao/expirada?voltar=…`, um Route
  Handler do BFF que apaga o cookie e manda para Entrar. A Server Action Entrar e as próximas apagam
  o cookie direto.
- **Telas.** A tela Entrar é um Server Component com o formulário num Client Component
  (`useActionState`), porque o foco, a validação no cliente e o envio duplo bloqueado precisam de
  estado. A Home e as portas ficam num grupo de rotas com layout próprio, com o `loading.tsx` na
  porta "Carregando o app" e o `error.tsx` na porta "Erro de sessão", cujo "Tentar de novo" chama o
  `reset`.
- **Componentes e bibliotecas.** Entram os componentes que as telas desta tarefa usam (Button,
  Input, Field, Spinner, Avatar, EmptyState, DropdownMenu, Rail, Sidebar e UserMenu), com
  `radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge` e `lucide-react` (design system,
  "Stack de interface"). O cabeçalho da Sidebar mostra o nome do Workspace, "Full Cycle", fixo.
- **Fixtures da web.** A `person` grava a Pessoa no banco `chat` com `pg`, com e-mail único e um
  hash Argon2id fixo de uma senha de teste, calculado uma vez pelo `@node-rs/argon2` da API do chat
  com os parâmetros do LLD e guardado como constante. Ao fim do teste, ela apaga a Pessoa, o que leva
  as Sessões junto.
- **Validação visual.** Depende do MCP do Pencil, que precisa do aplicativo aberto com o
  `slack-ia.pen`. Sem ele, a tarefa para no CA10 e avisa.

## Arquivos e interfaces

**API do chat**

- `src/people/person.entity.ts`, `people.repository.ts`, `people.service.ts`, `username.ts`,
  `people.module.ts`: a entidade, `findByEmail`, `create`, e `deriveUsername(email, taken)`.
- `src/sessions/session.entity.ts`, `sessions.repository.ts`, `sessions.service.ts`
  (`login`, `authenticate`), `sessions.controller.ts` (`POST /v1/sessions`, `GET /v1/me`),
  `session.guard.ts`, `public.decorator.ts`, `passwords.ts` (hash e verificação),
  `login.dto.ts`, `person.response.ts`, `invalid-credentials.error.ts`,
  `unauthenticated.error.ts`, `sessions.module.ts`.
- `src/accounts/accounts-command.ts` (`runAccountsCommand(argv, { readPassword, output })`),
  `cli.ts`, `accounts.module.ts`.
- `src/common/errors/error-code.ts` e `problem-details.filter.ts`: `invalid_credentials`.
- `src/app.module.ts`: os três módulos novos e o guard global.
- `migrations/<timestamp>-CreatePeopleAndSessions.ts`.
- `openapi.json`: regravado.
- `test/support/auth-routes.ts`: `createPerson`, `login`, `expireSession`.
- `package.json`: `@node-rs/argon2`, `cookie`, `@inquirer/password` e o script `accounts`.

**Web**

- `src/proxy.ts`: sem cookie, manda para `/entrar?voltar=`.
- `src/app/entrar/page.tsx` e `src/app/entrar/sign-in-form.tsx`.
- `src/app/(app)/layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`: a casca e as portas.
- `src/app/api/sessao/expirada/route.ts`.
- `src/app/actions/sign-in.ts`: a Server Action Entrar.
- `src/app/services/chat-api.ts`: `createSession`, `getMe`, com o cookie repassado.
- `src/app/utils/return-path.ts` (`safeReturnPath`), `session-cookie.ts`, `cn.ts`.
- `src/app/components/`: os componentes da lista acima.
- `src/app/page.tsx`: removido (a Home passa ao grupo de rotas).
- `e2e/fixtures.ts`, `e2e/seed.spec.ts`, `e2e/01-entrar-e-sair/*.spec.ts`,
  `e2e/plans/01-entrar-e-sair.plan.md`.
- `package.json`: as bibliotecas de interface, `pg` e `@axe-core/playwright`.

## Testes existentes que mudam

- `e2e/seed.spec.ts`: passa a abrir `/entrar` com uma Pessoa da fixture, em vez da página
  provisória, que sai.
- `test/openapi.e2e-spec.ts`: o mesmo teste, contra o snapshot regravado com as rotas novas.

## Mudança de dados

Nenhuma: as tabelas nascem vazias, e as contas são criadas pelo comando.

## Documentos atualizados

- `docs/lld.md`, seção "Estrutura do código": o pacote `cookie` na leitura do cookie pela API do
  chat.
- `docs/lld.md`, seção "Cliente", "Sessão no cliente": o 401 ao renderizar passa pelo Route Handler
  `GET /api/sessao/expirada`, que apaga o cookie, porque um Server Component não grava cookie.
