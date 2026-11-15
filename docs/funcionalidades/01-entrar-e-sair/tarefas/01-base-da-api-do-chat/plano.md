# Plano da F01-T01: Base da API do chat

Tarefa: [tarefa.md](tarefa.md) · Spec: [spec.md](../../spec.md) · PRD: [prd.md](../../prd.md)

## Critérios

### CA1

**Marca:** teste de unidade

**Cenário:** Dado um ambiente sem o `DATABASE_URL`, quando a configuração é validada na subida,
então a validação falha com o nome da variável na mensagem; dado um ambiente completo, ela devolve
a configuração tipada, com `PORT` e `LOG_LEVEL` nos padrões quando ausentes.

**Teste previsto:** unidade, `src/config/env.schema.spec.ts`, "falha com o nome da variável quando
falta uma obrigatória" e "aplica os padrões de PORT e LOG_LEVEL".

### CA2

**Marca:** revisão humana

**Cenário:** Dado o ambiente de pé, quem revisa roda `pnpm migration:run` e `pnpm migration:revert`
no contêiner e encontra os dois sem erro e sem migração pendente; e confere que o `DatabaseModule`
registra o TypeORM, a estratégia de nomes em `snake_case` e o cls transacional. A suíte e2e roda
contra o `chat_test` migrado (CA6), o que prova a conexão.

### CA3

**Marca:** teste de integração

**Cenário:** Dado um módulo de teste com o filter e a validação globais e um controller de teste,
quando a rota lança um erro de domínio, então a resposta é `application/problem+json` com o status
do mapa, o `code` e o `detail`; quando lança um erro inesperado, a resposta é 500 com
`internal_error`, sem a mensagem interna; quando recebe um corpo que não passa no DTO, a resposta é
400 com `validation_failed` e os campos em `errors`; quando recebe um JSON malformado, a resposta é
400 com `malformed_body`.

**Teste previsto:** integração, `src/common/errors/problem-details.filter.int-spec.ts`, um caso por
situação acima.

### CA4

**Marca:** revisão humana

**Cenário:** Dado o diff e uma requisição feita à API de pé, quem revisa olha a linha do log da
requisição e encontra um `request_id`, nenhum corpo de requisição, e os campos da lista do LLD
("Logs") mascarados na configuração de redação.

### CA5

**Marca:** teste HTTP

**Cenário:** Dado o snapshot do contrato gravado, quando a suíte e2e gera o documento OpenAPI da
aplicação, então ele é igual ao gravado; e o `pnpm openapi` regrava o arquivo.

**Teste previsto:** e2e da API, `test/openapi.e2e-spec.ts`, "o contrato gerado é igual ao
snapshot gravado".

### CA6

**Marca:** revisão humana

**Cenário:** Dado o diff, quem revisa encontra `createTestApp()`, `uniqueEmail()`, o `globalSetup`
que zera e migra o `chat_test`, a suíte `pnpm test:int` e as duas na Verificação completa do
`AGENTS.md` da API; e roda `pnpm test:int` e `pnpm test:e2e` no contêiner com tudo passando.

### CA7

**Marca:** teste HTTP

**Cenário:** Dado a aplicação de pé no teste, quando alguém pede `GET /` (a rota do esqueleto, que
sai nesta tarefa), então a resposta é 404 `application/problem+json` com `not_found`.

**Teste previsto:** e2e da API, `test/errors.e2e-spec.ts`, "responde 404 com o corpo de erro para
uma rota inexistente".

## Contrato

### GET / · removida

A rota "Hello World!" do esqueleto gerado pelo Nest sai: não faz parte do produto.

### Corpo de erro · novo

Convenção que vale para todas as rotas, registrada no LLD ("Erros") neste commit de plano.

| Campo | Tipo | Observação |
| --- | --- | --- |
| `type` | string | Sempre `about:blank` |
| `title` | string | A frase padrão do status HTTP |
| `status` | int | O status HTTP |
| `code` | string | Código estável do catálogo |
| `detail` | string | Texto para pessoas, sem detalhe interno |
| `errors` | lista, opcional | Só em `validation_failed`: `{ field, message }` por campo inválido |

Códigos que esta tarefa cria, para qualquer rota:

| Código | Status | Quando |
| --- | --- | --- |
| `validation_failed` | 400 | O corpo, a consulta ou os parâmetros não passam na validação |
| `malformed_body` | 400 | O corpo não é JSON válido |
| `payload_too_large` | 413 | O corpo passa do limite do leitor do Express |
| `not_found` | 404 | Rota inexistente |
| `internal_error` | 500 | Erro inesperado |

Tabelas: nenhuma. O TypeORM cria a tabela própria de controle das migrações na primeira execução.

## Verificação do contrato

- `GET /` removida, respondendo 404 `not_found`: CA7.
- `validation_failed`, `malformed_body`, `internal_error` e o mapa de erro de domínio: CA3.
- `not_found`: CA7.
- `payload_too_large`: sem teste. É a tradução direta do status do leitor do Express pelo mesmo
  ramo do filter que trata `malformed_body`, que o CA3 prova.

## Decisões

- O `AppController` e o `AppService` do esqueleto saem, com o teste de unidade deles; o e2e do
  esqueleto vira o de `test/errors.e2e-spec.ts`. Motivo: são código gerado, sem papel no produto.
- A validação de entrada usa `class-validator` e `class-transformer` no `ValidationPipe` global, com
  `whitelist` e `forbidNonWhitelisted`, e o `exceptionFactory` lança o erro de domínio
  `ValidationFailedError`. O `zod` fica só na configuração. Motivo: é o caminho padrão do Nest, e o
  plugin do `@nestjs/swagger` lê os DTOs para gerar o contrato.
- O filter traduz um `HttpException` pelo status dele, com o código do status (`not_found` para
  404), e os erros do leitor do corpo do Express em `malformed_body` e `payload_too_large`. Qualquer
  outro erro é inesperado: log `error` e 500 `internal_error` (rule de erros da API).
- O `request_id` é um UUID v7 gerado pela API em cada requisição, sem ler nem devolver cabeçalho.
  Motivo: o LLD só pede o campo de correlação no log; propagar do BFF entra quando houver o que
  correlacionar.
- O contrato só é gerado pelo `pnpm openapi`, sem rota de documentação servida pela API.
- As migrações rodam pelo CLI do TypeORM sobre um data source próprio, carregado com `tsx`. Como o
  `tsx` não emite os metadados de tipo, toda coluna declara o tipo explicitamente. Motivo: o projeto
  é ESM e o CLI do TypeORM não carrega TypeScript sozinho.
- Nomes em `snake_case` pelo `SnakeNamingStrategy` (`typeorm-naming-strategies`), como pede o LLD
  ("Dados").
- O banco dos testes vem do `DATABASE_URL`, trocando o nome do banco por `chat_test`, num arquivo de
  setup das suítes e2e e de integração, antes de a aplicação subir.
- O `chat_test` nasce no script de inicialização do Postgres, com o `chat` como dono. O
  `globalSetup` não apaga o banco: ele apaga e recria o schema `public` do `chat_test`, o que o dono
  do banco pode fazer, e roda as migrações. Num volume que já existe sem o `chat_test`, o
  `globalSetup` falha com uma mensagem que manda criar o banco uma vez ou recomeçar com `down -v`.
  Motivo: o papel `chat` não tem `CREATEDB`, e dar a ele esse poder só para os testes também
  exigiria recriar o volume. O texto do CA6 e o LLD foram corrigidos com essa decisão.

## Arquivos e interfaces

- `src/config/env.schema.ts`: schema `zod` das variáveis e `validateEnv(env)`, usado no `validate`
  do `ConfigModule`.
- `src/config/*.config.ts`: `databaseConfig`, `httpConfig` e `logConfig`, com `registerAs`.
- `src/database/database.module.ts`: `TypeOrmModule.forRootAsync`, `ClsModule` com o plugin
  transacional do TypeORM.
- `src/database/data-source.ts`: o data source do CLI das migrações.
- `migrations/`: a pasta das migrações, ainda vazia.
- `src/common/errors/domain.error.ts`: `DomainError`, com `code` e `detail`.
- `src/common/errors/error-code.ts`: o tipo `ErrorCode` e o mapa de status.
- `src/common/errors/validation-failed.error.ts`: `ValidationFailedError`, com os campos.
- `src/common/errors/problem-details.filter.ts`: o exception filter global.
- `src/common/logging/logging.module.ts`: `nestjs-pino`, com `genReqId` e a redação.
- `src/app.module.ts`: importa config, banco e logs; registra `APP_FILTER` e `APP_PIPE`.
- `src/main.ts`: porta pela configuração e o logger do pino.
- `scripts/generate-openapi.ts` e `openapi.json`: a geração do contrato e o snapshot.
- `test/support/create-test-app.ts`, `test/support/unique-email.ts`, `test/support/global-setup.ts`
  e `test/support/use-test-database.ts`: a base de testes.
- `vitest.config.int.ts` e o `vitest.config.e2e.ts` alterado: as suítes com o `globalSetup`.
- `package.json`: os scripts `test:int`, `openapi` e `migration:*`, e as dependências.
- `.env.example` do projeto e o `environment` do `chat-api` no `compose.yaml`.
- `docker/postgres/init/01-create-databases.sh`: cria o `chat_test`, com o `chat` como dono.

## Testes existentes que mudam

- `src/app.controller.spec.ts`: removido, junto com o controller que ele testa.
- `test/app.e2e-spec.ts`: substituído por `test/errors.e2e-spec.ts`, que prova o 404 da rota que
  sai.

## Mudança de dados

Nenhuma.

## Documentos atualizados

- `docs/lld.md`, seção "Erros": os campos do corpo `problem+json` e os códigos genéricos.
- `docs/lld.md`, seção "Estrutura do código": a validação de entrada com `class-validator`.
- `docs/lld.md`, seção "Ambiente de desenvolvimento": como o `chat_test` nasce e é zerado.
