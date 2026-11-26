# Plano da F02-T05: Criar Canal

Tarefa: [tarefa.md](tarefa.md) · Spec: [spec.md](../../spec.md) · PRD: [prd.md](../../prd.md)

## Critérios

### CA1

**Marca:** teste de unidade

**Cenário:** Dada a tabela de casos da spec ("Nome do Canal"), as duas implementações de
`normalizeChannelName`, a da API e a da web, devolvem o mesmo resultado para cada entrada,
inclusive o vazio de `!!!` e o `stra-e` de `straße`. O caso do tamanho (81 vezes `a`) e o do
`GERAL` já usado são regras da API, provadas no CA3.

**Teste previsto:**
- unidade da API, `src/conversations/channel-name.spec.ts`, "normaliza o nome do Canal";
- unidade da web, `src/app/utils/channel-name.test.ts`, com a mesma tabela.

### CA2

**Marca:** teste HTTP

**Cenário:**
- Dado uma Pessoa com Sessão, quando ela cria o Canal com o nome "Café & Vendas 2026!" e a
  descrição "  Metas\ndo time  ", então recebe 201 com o nome `cafe-vendas-2026` e a descrição
  "Metas do time".
- A Conversa responde com ela como criadora.
- Outra Pessoa que já existia vê o Canal na lista dela.
- A descrição vazia fica nula.

**Teste previsto:** e2e da API, `test/channels.e2e-spec.ts`:
- "cria o Canal com o nome normalizado e a descrição tratada";
- "o Canal novo aparece na lista de outra Pessoa";
- "a descrição vazia fica nula".

### CA3

**Marca:** teste HTTP

**Cenário:**
- O nome `!!!`, 81 vezes `a` e a descrição com 251 caracteres respondem 400 `validation_failed`,
  com o campo em `errors`.
- O nome `GERAL` e o nome de um Canal criado antes respondem 409 `channel_name_taken`, com o
  `detail` "Já existe um Canal com esse nome.", e nada é gravado.
- Duas criações simultâneas com o mesmo nome criam um Canal só: uma responde 201 e a outra 409.
- O snapshot do contrato é igual ao gravado, com o 409 do `POST /v1/channels`.

**Teste previsto:** e2e da API, `test/channels.e2e-spec.ts`:
- "um nome vazio depois da normalização ou longo demais responde 400";
- "uma descrição longa demais responde 400";
- "um nome já usado responde 409 sem gravar nada";
- "duas criações simultâneas com o mesmo nome criam um Canal só";
- `test/openapi.e2e-spec.ts`, que já existe.

### CA4

**Marca:** teste no Playwright

**Cenário:**
- Dado uma Pessoa no `#geral`, quando ela usa "Adicionar canal" na barra lateral, o diálogo "Criar
  canal" abre com o foco no Nome.
- Ao digitar "Café & Vendas", aparece a prévia "O canal vai se chamar #cafe-vendas.".
- Criar com o nome vazio mostra "Informe o nome do canal." no campo, sem enviar; com `!!!`, "Use
  letras ou números no nome.".
- Criar com o nome do `#geral` mostra "Já existe um canal chamado #geral." no campo, com o diálogo
  aberto e o texto digitado.
- Com o envio bloqueado no navegador, aparece "Não foi possível criar o canal. Tente de novo." no
  corpo do diálogo, com os campos preenchidos.
- Esc fecha o diálogo, e o foco volta a "Adicionar canal".
- No sucesso, a Pessoa vai para o Canal novo, selecionado na barra lateral.

**Teste previsto:** Playwright, em `e2e/02-canais-publicos/`:
- `criar-canal-mostra-a-previa-do-nome.spec.ts`;
- `criar-canal-com-sucesso.spec.ts`;
- `criar-canal-nome-vazio-ou-invalido.spec.ts`;
- `criar-canal-nome-ja-usado.spec.ts`;
- `criar-canal-falha-ao-criar.spec.ts`;
- `criar-canal-esc-devolve-o-foco.spec.ts`.

### CA5

**Marca:** teste no Playwright

**Cenário:** Dado um Canal recém-criado pela Pessoa, quando ela cai nele, o começo do Canal mostra
"@<o @usuário dela> criou este canal em <dia> de <mês>." e a descrição. O `#geral` continua sem a
linha do criador.

**Teste previsto:** Playwright, `e2e/02-canais-publicos/criar-canal-com-sucesso.spec.ts` (o mesmo do
sucesso do CA4) e o `geral-mostra-cabecalho-e-inicio.spec.ts`, que já existe, ganha a conferência
de que o `#geral` não tem a linha do criador.

### CA6

**Marca:** teste no Playwright

**Cenário:** Os cenários do CA4 e do CA5, e mais estes:
- o diálogo só pelo teclado: Tab chega a "Adicionar canal", Enter abre o diálogo, o nome é
  digitado, Enter cria, e a Pessoa cai no Canal novo;
- o axe-core sem violações no diálogo aberto, com a prévia e com um erro no campo.

Os testes apagam os Canais que criaram.

**Teste previsto:** Playwright, em `e2e/02-canais-publicos/`: `criar-canal-pelo-teclado.spec.ts` e
`acessibilidade-dialogo-criar-canal.spec.ts`.

### CA7

**Marca:** documento

**Cenário:** Quem revisa abre o `validacao-visual.md` na pasta desta tarefa e encontra a comparação
nos dois temas, com como cada estado foi produzido:
- o diálogo nos seis frames `Diálogos / Criar canal / <Estado>`: Padrão, Com nome, Nome inválido,
  Erro no nome, Enviando e Falha ao criar;
- o Canal vazio com o criador, no frame `Conversa / Lista / Início do canal com criador`.

## Contrato

### POST /v1/channels · nova

| Item | O que descreve |
| --- | --- |
| Autenticação | Sessão, pelo cookie `session` |
| Corpo da requisição | `name`: texto, obrigatório, normalizado pela API; `description`: texto ou `null`, opcional, com as quebras de linha trocadas por espaço e as pontas cortadas |
| Resposta de sucesso | 201 com o `Channel` (`{ id, name, description }`), como em `GET /v1/channels` |
| Erros | 400 `validation_failed` (nome vazio depois da normalização, nome acima do `tamanho do nome do Canal`, descrição acima do `tamanho da descrição do Canal`, campo que não é texto), com os campos `name` ou `description` em `errors`; 400 `malformed_body`; 401 `unauthenticated`; 409 `channel_name_taken`, com o `detail` genérico; 413 `payload_too_large` |

O tamanho do nome conta depois da normalização, e o da descrição depois do tratamento (spec da
F02, "Nome do Canal").

### Server Action `createChannel` (web) · nova

Chamada pelo diálogo. Recebe o nome e a descrição do formulário, confere os campos como a API e
chama `POST /v1/channels` com o cookie repassado. Devolve `{ fieldErrors }` (nome ou descrição),
`{ error: "unavailable" }` (rede, 5xx ou resposta inesperada) ou, no 201, revalida o layout da
casca e redireciona para `/canais/<id>`. Num 401, apaga o cookie e manda para `/entrar`, como as
outras ações.

### Tabelas · sem mudança

`conversations` e `participations` já existem com a forma da F02-T02. A criação grava uma linha em
`conversations` (`public_channel`, com `created_by`) e a participação de todas as Pessoas em
`participations`.

## Verificação do contrato

| Item | Critério |
| --- | --- |
| `POST /v1/channels` 201, com o nome normalizado e a descrição tratada | CA2 |
| Participação de todas as Pessoas na criação | CA2 |
| `POST /v1/channels` 400 nos três casos | CA3 |
| `POST /v1/channels` 409, sem gravar nada, inclusive na concorrência | CA3 |
| `POST /v1/channels` 401 | Sem teste próprio: o guard é o mesmo de todas as rotas |
| `createChannel` com `fieldErrors`, `unavailable` e o redirecionamento | CA4 |

## Decisões

- **Normalização.** `normalizeChannelName(input)` é uma função pura, nos passos da spec: NFD, tirar
  as marcas (`\p{Diacritic}`), minúsculas, cada sequência fora de `[a-z0-9]` vira um hífen, e os
  hífens das pontas caem. Ela fica em `src/conversations/channel-name.ts` na API e em
  `src/app/utils/channel-name.ts` na web, sem pacote compartilhado (ADR 0017). Cada uma tem o teste
  com a tabela da spec.
- **Criação na API.** `ConversationsService.createChannel(personId, name, description)`:
  1. Normaliza o nome e trata a descrição. Recusa o nome vazio ou longo e a descrição longa com um
     `ValidationFailedError` nos campos `name` e `description`.
  2. Numa transação, toma o lock consultivo das participações e grava a Conversa com
     `created_by`. Depois grava a participação de todas as Pessoas com um `INSERT … SELECT` de
     `people`.
  3. A violação do índice `conversations_channel_name_key` vira `ChannelNameTakenError`
     (`channel_name_taken`, 409). Ela vem do banco, e não de uma leitura anterior, para duas
     criações simultâneas não passarem as duas (spec, "Nome já usado").
- **Código de erro novo.** `channel_name_taken` entra no tipo `ErrorCode` e no mapa de status do
  filter, com 409.
- **Diálogo.** `CreateChannelDialog`, um componente cliente com o `Dialog` do design system, no
  molde do "Trocar senha":
  - "Adicionar canal" é uma SidebarAction no fim da seção Canais, com o ícone `Plus`, como no
    frame. Ela abre o diálogo.
  - O foco começa no Nome. O Esc fecha, e o Radix devolve o foco a "Adicionar canal".
  - Abaixo do Nome aparece a dica do frame, "Minúsculas, sem espaços. Ex.: planejamento-q4", até
    haver um nome. Depois aparece a prévia "O canal vai se chamar #<normalizado>.".
  - A descrição tem o rótulo "Descrição", a marca "(opcional)" e o contador "N/250".
  - O formulário envia pela Server Action numa transição, como o "Trocar senha", para os campos
    não serem limpos depois de um erro.
  - "Tornar privado" fica fora, porque é da F03.
- **Validação no cliente.** O nome vazio, o vazio depois da normalização e o acima de 80 são
  recusados no navegador, sem enviar, com o foco no Nome. A Server Action confere de novo.
- **Sucesso.** A Server Action chama `revalidatePath("/", "layout")`, para a barra lateral trazer o
  Canal novo, e `redirect` para `/canais/<id>`.
- **Microtexto:** o dos frames `Diálogos / Criar canal / <Estado>`, registrado no `frames-da-f02.md`
  da F02-T01:
  - "Criar canal", "Canais organizam a conversa por assunto, projeto ou time.", "Nome",
    "Descrição", "(opcional)", "Cancelar" e "Criar canal";
  - os erros "Informe o nome do canal.", "Use letras ou números no nome.", "O nome pode ter até 80
    caracteres." e "Já existe um canal chamado #<nome>.";
  - a falha "Não foi possível criar o canal. Tente de novo.".

  A descrição longa demais, que o contador e o `maxLength` do campo já impedem na tela, usa "A
  descrição pode ter até 250 caracteres.".
- **Linha do criador.** O `ConversationIntro` recebe o criador e a data e mostra "@<usuário> criou
  este canal em <dia> de <mês>." antes da descrição. Num ano anterior, o ano entra no fim. A data é
  formatada no navegador, como o horário das Mensagens, por um componente cliente pequeno com o
  `useIsClient`, porque o servidor não conhece o fuso. O `#geral`, sem criador, continua sem a
  linha.
- **Testes e2e e o lock das participações.** A criação de Canal pela tela grava a participação de
  todas as Pessoas. Se uma Pessoa de outro teste estiver sendo apagada no mesmo instante, a chave
  estrangeira falha. Por isso, a limpeza da fixture `person` passa a apagar a Pessoa numa
  transação que toma o mesmo lock consultivo da API, como a regra da F02-T02 manda para quem mexe
  nas participações. A chave do lock fica copiada na fixture, com um comentário que aponta para o
  `ConversationsRepository`.
- **Limpeza dos Canais criados pela tela.** Cada teste que cria um Canal usa um nome único
  `e2e-criado-<id>` e o apaga no fim, pela fixture `createdChannelName`, que gera o nome e apaga o
  Canal ao terminar.
- **Texto dos CAs.** O CA1 e a spec ("Decisões de teste") diziam "Jest" para os testes de unidade
  da API, mas o runner da API é o Vitest desde a F01. O CA7 dizia "quatro estados", mas a F02-T01
  deixou seis frames do diálogo. Os dois textos foram corrigidos no commit de plano.

## Arquivos e interfaces

**API do chat**

- `src/conversations/channel-name.ts`: `normalizeChannelName(input)`, `normalizeChannelDescription(input)`
  e as constantes `CHANNEL_NAME_MAX_LENGTH` e `CHANNEL_DESCRIPTION_MAX_LENGTH`; `channel-name.spec.ts`.
- `src/conversations/conversations.errors.ts`: `ChannelNameTakenError`.
- `src/conversations/conversations.repository.ts`: `insertChannel(conversation)`, que devolve se o
  nome já existia, e `joinAllPeople(conversationId)`.
- `src/conversations/conversations.service.ts`: `createChannel`.
- `src/conversations/conversations.dto.ts`: `CreateChannelDto`.
- `src/conversations/conversations.controller.ts`: `POST /v1/channels`.
- `src/common/errors/error-code.ts` e `problem-details.filter.ts`: o `channel_name_taken`.
- `openapi.json`: regravado.
- `test/channels.e2e-spec.ts`: os casos do CA2 e do CA3.

**Web**

- `src/app/utils/channel-name.ts` e `channel-name.test.ts`.
- `src/app/services/chat-api.ts`: `createChannel(token, name, description)`.
- `src/app/actions/create-channel.ts`: a Server Action.
- `src/app/components/create-channel-dialog.tsx`: o diálogo e a SidebarAction.
- `src/app/components/sidebar.tsx`: a SidebarAction no fim da seção Canais.
- `src/app/components/conversation-intro.tsx`: a linha do criador; `created-on.tsx`, a data no
  navegador.
- `src/app/utils/message-time.ts`: `formatLongDate(date, now)`, com o teste em `message-time.test.ts`.
- `src/app/(app)/(shell)/canais/[id]/page.tsx`: passa o criador e a data ao `ConversationIntro`.
- `e2e/fixtures.ts`: o lock na limpeza da `person` e a fixture `createdChannelName`.
- `e2e/02-canais-publicos/*.spec.ts`: os cenários do CA4 ao CA6.
- `e2e/plans/02-canais-publicos.plan.md`: a seção 4 desta tarefa.

## Testes existentes que mudam

- `geral-mostra-cabecalho-e-inicio` (F02-T02): passa a conferir que o `#geral` não tem a linha do
  criador.
- A limpeza da fixture `person` passa a tomar o lock das participações. Nenhum teste muda de
  comportamento.

## Mudança de dados

Nenhuma.

## Documentos atualizados

Pela skill `lld`, no modo atualizar:

- `docs/lld.md`, "Interfaces", "API do chat: Conversas": entra `POST /v1/channels`, `planejada`.
- `docs/lld.md`, "Cliente", tabela de telas: a linha "A definir | Sessão | — | Criar canal;
  convidar para canal privado" vira duas. Uma é "Diálogo na casca | Sessão | — | Criar Canal
  público (F02), pela ação "Adicionar canal" da barra lateral", `planejada`. A outra é "A definir |
  Sessão | — | Convidar para Canal privado (F03)", `a detalhar`.
- `docs/lld.md`: a data do cabeçalho passa a 2026-11-25.

Fora do LLD:

- `docs/funcionalidades/02-canais-publicos/spec.md`, "Decisões de teste": "com o Jest que já existe"
  passa a "com o Vitest que já existe".
- `docs/funcionalidades/02-canais-publicos/tarefas/05-criar-canal/tarefa.md`: o CA1 passa a "nos
  testes de unidade da API e da web (Vitest nas duas)", e o CA7 a "nos seis estados dos frames".
