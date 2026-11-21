# Plano da F02-T02: `#geral` na barra lateral

Tarefa: [tarefa.md](tarefa.md) · Spec: [spec.md](../../spec.md) · PRD: [prd.md](../../prd.md)

## Critérios

### CA1

**Marca:** teste HTTP

**Cenário:** Dado o banco de testes migrado, quando uma Pessoa com Sessão lê a lista de Canais e
abre o `#geral`, então ele existe, é um Canal público, não tem criador e tem a descrição "Canal de
todo o Workspace". O índice único parcial e a restrição do nome são conferidos na revisão da
migração (seção "Contrato").

**Teste previsto:** e2e da API, `test/conversations.e2e-spec.ts`, "o #geral existe depois da
migração, sem criador e com a descrição".

### CA2

**Marca:** teste HTTP

**Cenário:**
- Dado uma Pessoa criada pela criação de conta, quando ela pede `GET /v1/channels`, então recebe
  os Canais de que participa em ordem de nome, com o `#geral` entre eles, e sem cookie recebe 401
  `unauthenticated`.
- Dado um Canal de que ela participa, quando ela pede `GET /v1/conversations/:id`, então recebe
  200 com o id, o tipo, o nome, a descrição, a data de criação e o criador.
- Dado um id malformado, um id que não existe e um Canal sem participação dela, quando ela pede a
  Conversa, então recebe 404 `not_found` nos três, com o mesmo corpo.
- Dado o código, quando o snapshot do contrato é gerado, então ele é igual ao gravado.

**Teste previsto:** e2e da API:
- `test/channels.e2e-spec.ts`: "lista os Canais da Pessoa em ordem de nome, com o #geral" e "sem
  Sessão responde 401";
- `test/conversations.e2e-spec.ts`: "devolve o Canal com o criador", "id malformado, inexistente
  e sem participação respondem o mesmo 404";
- `test/openapi.e2e-spec.ts`, que já existe.

### CA3

**Marca:** teste de integração

**Cenário:** Dado o `#geral` e outro Canal público no banco, quando o Operador cria uma conta pelo
`create`, então a Pessoa nova participa dos dois. Quem revisa encontra, no diff, a Pessoa e as
participações gravadas na mesma transação, depois do lock consultivo das participações.

**Teste previsto:** integração, `src/accounts/accounts-command.int-spec.ts`, "create grava a
participação da Pessoa nova em todos os Canais públicos".

### CA4

**Marca:** documento

**Cenário:** Quem revisa abre o `apps/chat-api/AGENTS.md` e encontra:
- o `create` descrito "com participação em todos os Canais públicos", e não "já Membro";
- nenhuma linha do comando de canais (`channels create`, `set-topic`, `list`, `remove-member`);
- a frase final sem o ponteiro para "specs da F02 e da F04, 'Comando de canais'".

### CA5

**Marca:** teste no Playwright

**Cenário:**
- Dado uma Pessoa que entra sem `?voltar=`, então ela cai no `#geral`, e abrir `/` também leva a
  ele.
- No `#geral`, o cabeçalho mostra "geral" e a descrição, o título da aba é "#geral · Full Cycle
  Chat", e a área da Conversa mostra "Este é o começo do canal #geral" com a descrição.
- A barra lateral tem a seção "Canais", com a linha do `#geral` selecionada (`aria-current`).
- Um endereço de Canal que não existe e um id malformado mostram, dentro da casca, "Conversa não
  encontrada", "Ela não existe ou você não participa dela." e o link "Voltar ao início", que leva
  ao `#geral`.

**Teste previsto:** Playwright, em `e2e/02-canais-publicos/`:
- `entra-e-cai-no-geral.spec.ts`;
- `raiz-leva-ao-geral.spec.ts`;
- `geral-mostra-cabecalho-e-inicio.spec.ts`;
- `barra-lateral-com-canal-aberto.spec.ts`;
- `canal-inexistente-mostra-nao-encontrado.spec.ts`;
- `id-malformado-mostra-nao-encontrado.spec.ts`.

### CA6

**Marca:** teste no Playwright

**Cenário:**
- Dado uma Pessoa da fixture `person`, então ela participa de todos os Canais públicos, como uma
  conta criada pelo `create`.
- O plano de testes e2e da F02 existe e cobre os cenários do CA5 e estes:
  - a barra lateral pelo teclado: Tab chega à linha do `#geral`, com o foco visível, e Enter abre
    o Canal;
  - o axe-core sem violações no `#geral` vazio e na Conversa não encontrada.

**Teste previsto:** Playwright, em `e2e/02-canais-publicos/`: `barra-lateral-pelo-teclado.spec.ts`
e `acessibilidade-geral-e-nao-encontrado.spec.ts`. Os cenários do CA5 usam a fixture `person`, que
prova a primeira parte: sem a participação, o `#geral` não aparece.

### CA7

**Marca:** documento

**Cenário:** Quem revisa abre o `docs/lld.md` e encontra:
- o módulo `conversations` em "Módulos da API do chat", com a Situação `existe`;
- as tabelas `conversations` e `participations` como `existe` em "Dados", com o ponteiro para as
  migrações;
- as rotas `GET /v1/channels` e `GET /v1/conversations/:id` como `existe` em "Interfaces";
- as telas `/` e `/canais/<id>` como `existe` em "Cliente".

### CA8

**Marca:** documento

**Cenário:** Quem revisa abre, na pasta desta tarefa:
- o `roteiro-manual.md`, com a migração rodada no banco `chat` de desenvolvimento com Pessoas já
  criadas, a consulta que mostra todas participando do `#geral` e o resultado;
- o `validacao-visual.md`, com o `#geral` vazio, a barra lateral e a Conversa não encontrada
  comparados com os frames `Conversa / Lista / Início do canal` e `Conversa / Estrutura / Conversa
  não encontrada`, nos dois temas, e como cada estado foi produzido.

## Contrato

### conversations · chat · nova

| Coluna | Tipo | Nulo | Padrão | Observação |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | não | — | UUID v7 da aplicação; o do `#geral` vem do `uuidv7()` do Postgres 18, na migração |
| `type` | enum `conversations_type_enum` (`public_channel`) | não | — | `private_channel` e `direct` entram com a F03 e a F04 |
| `name` | `text` | sim | — | Nome normalizado do Canal |
| `description` | `text` | sim | — | Nula quando vazia |
| `created_by` | `uuid` | sim | — | Nulo no `#geral` |
| `created_at` | `timestamptz` | não | `now()` | |
| `updated_at` | `timestamptz` | não | `now()` | |

- Chave primária: `id` (`conversations_pkey`).
- Chave estrangeira: `created_by` → `people(id)`, `ON DELETE SET NULL`.
- Índice único parcial `conversations_channel_name_key` em `name`, `WHERE type IN
  ('public_channel', 'private_channel')`. Escrito à mão na migração, porque o enum ainda não tem
  `private_channel`: a condição usa `type::text`.
- `CHECK` `conversations_name_by_type`: `name` não é nulo quando o tipo é de Canal e é nulo nos
  outros. Escrito à mão na migração.
- Dados: a migração grava o `#geral` (`public_channel`, `geral`, "Canal de todo o Workspace", sem
  criador) e a participação de todas as Pessoas que existem.

### participations · chat · nova

| Coluna | Tipo | Nulo | Padrão | Observação |
| --- | --- | --- | --- | --- |
| `conversation_id` | `uuid` | não | — | |
| `person_id` | `uuid` | não | — | |
| `created_at` | `timestamptz` | não | `now()` | |
| `updated_at` | `timestamptz` | não | `now()` | |

- Chave primária composta: (`conversation_id`, `person_id`) (`participations_pkey`).
- Chaves estrangeiras: `conversation_id` → `conversations(id)` e `person_id` → `people(id)`, as
  duas `ON DELETE CASCADE`.
- Índice `participations_person_id_idx` em `person_id`, para a lista de Canais da Pessoa.

### GET /v1/channels · nova

| Item | O que descreve |
| --- | --- |
| Autenticação | Sessão, pelo cookie `session` |
| Parâmetros | Nenhum |
| Resposta de sucesso | 200 com `{ channels: Channel[] }`, os Canais de que a Pessoa participa, em ordem de `name`. `Channel` é `{ id: string (uuid), name: string, description: string \| null }` |
| Erros | 401 `unauthenticated` |

### GET /v1/conversations/:id · nova

| Item | O que descreve |
| --- | --- |
| Autenticação | Sessão, pelo cookie `session` |
| Parâmetros de caminho | `id`: texto. Um valor que não é UUID responde 404, e não 400 |
| Resposta de sucesso | 200 com a Conversa no corpo, sem envelope, como o `GET /v1/me`: `{ id: string (uuid), type: "public_channel", name: string, description: string \| null, created_at: string (ISO 8601), created_by: { id, name, username } \| null }` |
| Erros | 401 `unauthenticated`; 404 `not_found`, com o `detail` "A conversa não existe ou você não participa dela.", igual para id malformado, Conversa inexistente e Conversa sem participação |

## Verificação do contrato

| Item | Critério |
| --- | --- |
| `conversations`: o `#geral` gravado pela migração | CA1 |
| `conversations`: índice único parcial e `CHECK` | CA1, na revisão da migração |
| `conversations`: `created_by` com `SET NULL` | Sem teste: não há como apagar uma Pessoa pelo produto; conferido na revisão da migração |
| `participations`: chave composta | CA3 (a inserção que ignora o conflito no par) |
| `participations`: `CASCADE` da Pessoa | CA6 (a fixture `person` apaga a Pessoa e, junto, as participações) |
| `GET /v1/channels` 200 | CA2 |
| `GET /v1/channels` 401 | CA2 |
| `GET /v1/conversations/:id` 200 | CA2 |
| `GET /v1/conversations/:id` 404, nos três casos | CA2 |
| `GET /v1/conversations/:id` 401 | Sem teste próprio: o guard é o mesmo de todas as rotas, provado na F01 |

## Decisões

- **Criação de conta numa função só.** Nasce `createAccount(app, input)` no módulo `accounts`:
  - Dentro de uma transação, toma o lock consultivo das participações, chama o `PeopleService.create`
    e grava a participação da Pessoa em todos os Canais públicos.
  - O `create` do comando de contas e o atalho `createPerson` dos testes e2e da API passam a
    chamá-la. Assim, a Pessoa dos testes nasce como a do Operador, e o `PeopleService` não passa a
    depender de Conversas.
- **Lock consultivo.** O `ConversationsRepository` expõe `lockPublicChannelParticipations()`, que
  chama `pg_advisory_xact_lock` com uma chave fixa, declarada como constante no módulo. A tarefa 05
  chama o mesmo método ao criar Canal (decisão consumida por ela).
- **Gravar as participações da Pessoa nova** com um `INSERT … SELECT` dos Canais públicos e `ON
  CONFLICT DO NOTHING`, para a corrida que o lock não cobre (como uma segunda chamada) não falhar.
- **Id malformado.** O service confere o formato do id com o `isUUID` do `class-validator` antes de
  consultar o banco. Um id inválido lança o mesmo `ConversationNotFoundError` do inexistente, sem
  `ParseUUIDPipe`, que responderia 400.
- **Erro de domínio novo.** O `ConversationNotFoundError` usa o código `not_found`, que já existe
  no tipo de códigos e no mapa de status. Nenhum código novo nesta tarefa.
- **Formas de resposta.** A lista vem num envelope (`{ channels }`), porque o corpo de uma resposta
  é um objeto. A Conversa vem sem envelope, como o `GET /v1/me`, e as datas vêm em ISO 8601.
- **Enum no banco.** O tipo é um enum do Postgres, gerado pelo TypeORM. A F03 e a F04 acrescentam
  os valores com `ALTER TYPE`.
- **Web: Canais carregados uma vez por requisição.** O `listChannels` do service HTTP é embrulhado
  no `cache()` do React. Assim, o layout da casca, que monta a barra lateral, e a página `/`, que
  procura o `#geral`, fazem uma chamada só.
- **Web: `/` sem `#geral`.** Se a lista não tem o `#geral` (o banco não foi migrado), `/` mostra o
  estado "Home / Vazio" que já existe, em vez de quebrar.
- **Web: rota do Canal.** `/canais/[id]` fica sob o layout da casca. Ela chama
  `GET /v1/conversations/:id`:
  - no 404, mostra o estado de Conversa não encontrada, com o EmptyState e o texto do frame;
  - no 401, passa pelo Route Handler da Sessão expirada, como o layout;
  - numa falha de rede ou num 5xx, sobe para a porta "Erro de sessão" que já existe.
- **Web: o que a tela do Canal mostra nesta tarefa.**
  - Mostra o ConversationHeader (`#nome` e descrição) e o ConversationIntro ("Este é o começo do
    canal #nome" e a descrição).
  - O histórico e o composer entram na tarefa 03, e a linha do criador na tarefa 05.
  - O ConversationIntro aparece sempre, porque ainda não há Mensagens.
- **Web: barra lateral.**
  - A SidebarSection "Canais" recebe os Canais do layout. Cada SidebarRow é um link para
    `/canais/<id>`, com o ChannelIcon e o nome.
  - Um componente cliente pequeno lê o `usePathname` e põe o estado "Selecionado" e o
    `aria-current="page"` na linha do Canal aberto.
  - A SidebarAction "Adicionar canal" entra na tarefa 05, com o diálogo.
- **Web: título da aba.** `generateMetadata` da página do Canal devolve "#nome · Full Cycle Chat"
  (o título do layout raiz). Na Conversa não encontrada, o título é "Conversa não encontrada · Full
  Cycle Chat".
- **Microtexto:** o dos frames `Conversa / Lista / Início do canal`, `Conversa / Estrutura / Canal
  público` e `Conversa / Estrutura / Conversa não encontrada`, registrado no `frames-da-f02.md` da
  tarefa 01.
- **Fixture `person`:** depois de inserir a Pessoa, grava a participação dela em todos os Canais
  públicos com o mesmo `INSERT … SELECT` da API. Ao fim, apagar a Pessoa leva as participações
  (`CASCADE`).
- **`voltar` para um Canal.** O teste `volta-a-pagina-pedida`, da F01, passa a usar o endereço do
  `#geral` com uma consulta, porque `/` agora redireciona e descarta a consulta. Isso prova o PRD,
  H4: quem abre um Canal sem Sessão volta a ele depois de entrar.

## Arquivos e interfaces

**API do chat**

- `src/conversations/conversation.entity.ts`: `Conversation`, com o enum `ConversationType`.
- `src/conversations/participation.entity.ts`: `Participation`.
- `src/conversations/conversations.repository.ts`: `listChannelsOf(personId)`,
  `findParticipatedById(id, personId)` (com o criador), `joinPublicChannels(personId)` e
  `lockPublicChannelParticipations()`.
- `src/conversations/conversations.service.ts`: `listChannels(personId)`,
  `getConversation(id, personId)` e `joinPublicChannels(personId)`.
- `src/conversations/conversations.errors.ts`: `ConversationNotFoundError` (`not_found`).
- `src/conversations/conversations.controller.ts`: `GET /v1/channels` e
  `GET /v1/conversations/:id`.
- `src/conversations/conversations.dto.ts`: `ChannelResponse`, `ChannelListResponse`,
  `ConversationResponse` e `ConversationCreatorResponse`, com os decorators do Swagger.
- `src/conversations/conversations.module.ts`: exporta o `ConversationsService`.
- `src/app.module.ts` e `src/accounts/accounts.module.ts`: importam o `ConversationsModule`.
- `src/accounts/create-account.ts`: `createAccount(app, input)`.
- `src/accounts/accounts-command.ts`: o `create` chama o `createAccount`.
- `migrations/<timestamp>-CreateConversationsAndParticipations.ts`: as tabelas, o índice parcial,
  o `CHECK`, o `#geral` e as participações.
- `openapi.json`: regravado pelo `pnpm openapi`.
- `test/support/auth-routes.ts`: o `createPerson` chama o `createAccount`.
- `test/channels.e2e-spec.ts` e `test/conversations.e2e-spec.ts`: novos.
- `test/support/conversation-rows.ts`: atalhos para gravar um Canal público direto no banco, com
  ou sem a participação de uma Pessoa, e apagá-lo.
- `AGENTS.md` do projeto: a correção do CA4.

**Web**

- `src/app/services/chat-api.ts`: `listChannels(token)` (com `cache()`) e
  `getConversation(token, id)`, que devolvem `{ status: "ok", … }`, `{ status: "not_found" }` ou
  `{ status: "unauthenticated" }` e lançam `ChatApiUnavailableError` numa falha de rede ou num 5xx.
- `src/app/(app)/(shell)/layout.tsx`: carrega os Canais e os passa à `Sidebar`.
- `src/app/(app)/(shell)/page.tsx`: redireciona para o `#geral` ou mostra "Home / Vazio".
- `src/app/(app)/(shell)/canais/[id]/page.tsx`: o Canal ou a Conversa não encontrada, com o
  `generateMetadata`.
- `src/app/components/sidebar.tsx`: recebe `channels` e mostra a seção Canais.
- `src/app/components/sidebar-section.tsx`, `sidebar-row.tsx` e `channel-icon.tsx`: novos, com o
  componente cliente da linha ativa.
- `src/app/components/conversation-header.tsx` e `conversation-intro.tsx`: novos.
- `e2e/fixtures.ts`: a fixture `person` grava as participações; o `loggedInPage` espera o endereço
  do `#geral`; nasce o atalho `expectGeral(page)`.
- `e2e/02-canais-publicos/*.spec.ts`: os cenários do CA5 e do CA6.
- `e2e/plans/02-canais-publicos.plan.md`: o plano de testes e2e da F02.

## Testes existentes que mudam

Na web, porque `/` passa a redirecionar para o `#geral`:

- `e2e/fixtures.ts`: o `loggedInPage` espera o endereço do `#geral`, e não `/`.
- `entra-com-email-e-senha`, `com-sessao-abre-entrar-e-vai-para-home`, `entra-so-pelo-teclado`,
  `ignora-voltar-externo` e `trocar-senha-com-sucesso`: esperam o `#geral` no lugar de `/`.
- `home-mostra-a-casca` e `acessibilidade-entrar-e-home`: o estado "Nenhuma conversa ainda" sai
  da casca, e os dois passam a conferir o `#geral`.
- `volta-a-pagina-pedida`: usa o endereço do `#geral` com uma consulta (decisão "`voltar` para um
  Canal").
- `e2e/plans/01-entrar-e-sair.plan.md`: os passos e os resultados esperados desses cenários.

Na API, o `createPerson` dos testes e2e passa a gravar as participações. Os testes da F01 não
olham as participações e não mudam.

## Mudança de dados

A migração grava o `#geral` e a participação das Pessoas que já existem no banco. Rodar de novo
não muda nada, porque a migração roda uma vez só.

## Documentos atualizados

Propostos para o commit de plano, pela skill `lld` no modo atualizar:

- `docs/lld.md`, "Módulos da API do chat": entra `conversations` ("Conversas, Canais e
  participação: lista os Canais da Pessoa, lê uma Conversa conferindo a participação e grava as
  participações"), `planejada`.
- `docs/lld.md`, "Dados", tabela de entidades: "Conversas" e "Participação de Pessoa em Conversa"
  passam de `a detalhar` a `planejada; forma na spec da F02`.
- `docs/lld.md`, "Interfaces": nasce a tabela "API do chat: Conversas" (para o BFF), com
  `GET /v1/channels` e `GET /v1/conversations/:id`, `planejadas`, com a forma na spec da F02.
- `docs/lld.md`, "Cliente", tabela de telas:
  - a linha `/` ganha "Alteração `planejada`: redireciona para o `#geral`; sem ele, mostra a casca
    vazia";
  - nasce a linha `/canais/<id>`, `planejada`, que lê a Conversa, com a ação "Abrir Canal pela
    barra lateral";
  - a linha "A definir (lateral)" passa a dizer que a seção Canais entra na F02 e as não lidas e
    menções na F06.
