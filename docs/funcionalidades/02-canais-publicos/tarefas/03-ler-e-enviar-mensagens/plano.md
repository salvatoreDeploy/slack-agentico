# Plano da F02-T03: Ler e enviar Mensagens

Tarefa: [tarefa.md](tarefa.md) · Spec: [spec.md](../../spec.md) · PRD: [prd.md](../../prd.md)

## Critérios

### CA1

**Marca:** teste HTTP

**Cenário:** Dado o banco de testes migrado, quando uma Pessoa envia duas Mensagens com
`client_message_id` diferentes e lê o histórico, então as duas estão lá, na ordem de envio. A
unicidade do autor com o `client_message_id` e o índice da página são conferidos na revisão da
migração (seção "Contrato"). A resposta 200 à repetição é prova da tarefa 04.

**Teste previsto:** e2e da API, `test/messages.e2e-spec.ts`, "devolve as Mensagens enviadas na
ordem de envio".

### CA2

**Marca:** teste HTTP

**Cenário:**
- Dado um Canal com mais Mensagens que o `tamanho da página do histórico`, quando a Pessoa lê o
  histórico sem `before`, então recebe as mais recentes, em ordem crescente, com `has_more`
  verdadeiro.
- Com o `before` do id mais antigo recebido, ela recebe a página anterior. A última página vem com
  `has_more` falso.
- Um `before` que não é UUID responde 400 `validation_failed`.
- Um Canal sem participação dela responde 404 `not_found`, com o mesmo corpo da leitura da
  Conversa.
- Depois de o nome do autor mudar no banco, o histórico mostra o nome novo.

**Teste previsto:** e2e da API, `test/messages.e2e-spec.ts`:
- "devolve a página mais recente em ordem crescente, com has_more";
- "o before devolve a página anterior, e a última vem com has_more falso";
- "um before malformado responde 400";
- "um Canal sem participação responde 404";
- "mostra o nome atual do autor".

### CA3

**Marca:** teste HTTP

**Cenário:**
- Dado um Canal de que a Pessoa participa, quando ela envia "  oi\n\n", então recebe 201 com a
  Mensagem, o corpo "oi" e o autor.
- Um corpo vazio ou só com espaços e quebras de linha responde 400.
- 4.000 grafemas, com emojis de vários pontos de código (👩🏽‍💻), passam; 4.001 respondem 400.
- Um `client_message_id` que não é UUID responde 400.
- Um Canal sem participação responde 404.
- O snapshot do contrato é igual ao gravado.

**Teste previsto:** e2e da API, `test/messages.e2e-spec.ts`:
- "responde 201 com a Mensagem cortada nas pontas e o autor";
- "um corpo vazio depois do corte responde 400";
- "4.000 grafemas passam e 4.001 respondem 400";
- "um client_message_id malformado responde 400";
- "enviar num Canal sem participação responde 404";
- `test/openapi.e2e-spec.ts`, que já existe.

### CA4

**Marca:** teste no Playwright

**Cenário:** Dado um Canal da fixture `channel` com Mensagens de dois autores em dois dias,
quando a Pessoa abre o Canal, então:
- vê cada Mensagem com o nome e o avatar do autor e o horário (`HH:mm`);
- vê o separador "Ontem" antes das de ontem e "Hoje" antes das de hoje;
- a lista começa rolada até o fim;
- uma Mensagem com `<b>oi</b>` aparece como texto;
- a quebra de linha aparece;
- `https://exemplo.com` vira um link com `target="_blank"`, e `exemplo.com` sem o esquema não vira.

O horário e os separadores são conferidos com o fuso do navegador fixado no teste
(`timezoneId: "America/Sao_Paulo"`).

**Teste previsto:** Playwright, em `e2e/02-canais-publicos/`:
- `historico-com-autor-horario-e-dias.spec.ts`;
- `texto-com-html-aparece-como-texto.spec.ts`;
- `link-e-varias-linhas.spec.ts`.

### CA5

**Marca:** teste no Playwright

**Cenário:**
- Dado um Canal da fixture, quando a Pessoa digita no composer e aperta Enter, então a Mensagem
  aparece no fim, com o nome dela e o horário, o campo fica vazio e, depois da confirmação, a
  Mensagem deixa de estar "enviando". Com o envio segurado no navegador, ela aparece com a
  opacidade de "enviando" antes da confirmação.
- Shift+Enter quebra a linha sem enviar.
- Com 3.801 grafemas, o composer mostra "Restam 199 caracteres"; com 4.012, mostra "12 caracteres
  acima do limite", e o botão de enviar fica desabilitado.

**Teste previsto:** Playwright, em `e2e/02-canais-publicos/`:
- `envia-uma-mensagem.spec.ts`;
- `envia-pelo-teclado-com-varias-linhas.spec.ts`;
- `contador-perto-e-acima-do-limite.spec.ts`.

### CA6

**Marca:** teste de unidade

**Cenário:** Dada a tabela de casos da contagem de grafemas (`a`, `ação`, `👩🏽‍💻`, `🇧🇷`, `é`,
um texto vazio e 4.000 emojis), as duas implementações, a da API e a da web, devolvem os mesmos
números. Quem revisa encontra o `pnpm test` do Vitest em "Comandos" e em "Verificação completa"
do `apps/web/AGENTS.md`.

**Teste previsto:**
- unidade da API, `src/messages/graphemes.spec.ts`, "conta os caracteres como a Pessoa os vê";
- unidade da web (Vitest), `src/app/utils/graphemes.test.ts`, com a mesma tabela.

### CA7

**Marca:** teste no Playwright

**Cenário:**
- Dado uma Mensagem de outra Pessoa gravada no banco depois de o Canal estar aberto, quando a
  Pessoa sai do Canal e volta pela barra lateral, então a Mensagem aparece.
- O envio funciona só pelo teclado: Tab chega ao composer, Enter envia.
- O axe-core não acusa violações no Canal com Mensagens.
- As fixtures `channel` e de Mensagem de outra Pessoa existem, e os testes escrevem só no Canal
  da fixture.

**Teste previsto:** Playwright, em `e2e/02-canais-publicos/`:
- `mensagem-de-outra-pessoa-ao-reabrir.spec.ts`;
- `envia-so-pelo-teclado.spec.ts`;
- `acessibilidade-canal-com-mensagens.spec.ts`.

### CA8

**Marca:** documento

**Cenário:** Quem revisa abre o `docs/lld.md` e encontra:
- o módulo `messages` em "Módulos da API do chat";
- o Vitest na tabela de bibliotecas de "Estrutura do código";
- a tabela de Mensagens e as duas rotas como `existe`.

### CA10

**Marca:** revisão humana

**Cenário:** Quem revisa abre um Canal com a rede lenta (o `playwright-cli` segurando a resposta
da página) e vê, na área da Conversa, o esqueleto do frame `Conversa / Estrutura / Histórico
carregando`, com a barra lateral visível. A comparação com o frame, nos dois temas, entra no
`validacao-visual.md` do CA9.

### CA9

**Marca:** documento

**Cenário:** Quem revisa abre o `validacao-visual.md` na pasta desta tarefa e encontra a
comparação nos dois temas, com como cada estado foi produzido:
- o Canal com histórico, com o frame `Conversa / Estrutura / Canal público`;
- a Mensagem "enviando", com `Conversa / Mensagem / Enviando`;
- o composer perto do limite e acima dele, com `Conversa / Composer / Perto do limite` e
  `Conversa / Composer / Acima do limite`.

## Contrato

### messages · chat · nova

| Coluna | Tipo | Nulo | Padrão | Observação |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | não | — | UUID v7 gerado pela API ao gravar; ordem do histórico e cursor |
| `conversation_id` | `uuid` | não | — | |
| `author_person_id` | `uuid` | não | — | O autor Bot entra com a F10 |
| `client_message_id` | `uuid` | não | — | Gerado no cliente |
| `body` | `text` | não | — | Já cortado nas pontas |
| `created_at` | `timestamptz` | não | `now()` | |
| `updated_at` | `timestamptz` | não | `now()` | |

- Chave primária: `id` (`messages_pkey`).
- Única: (`author_person_id`, `client_message_id`) (`messages_author_client_message_key`).
- Chaves estrangeiras: `conversation_id` → `conversations(id)`, `ON DELETE CASCADE`;
  `author_person_id` → `people(id)`, `ON DELETE CASCADE` (decisão "Autor apagado").
- Índice `messages_conversation_id_id_idx` em (`conversation_id`, `id`), para a página do
  histórico.

### GET /v1/conversations/:id/messages · nova

| Item | O que descreve |
| --- | --- |
| Autenticação | Sessão, pelo cookie `session` |
| Parâmetros de caminho | `id`: texto; um valor que não é UUID responde 404, como em `GET /v1/conversations/:id` |
| Parâmetros de consulta | `before`: UUID, opcional; o id da Mensagem mais antiga já recebida |
| Resposta de sucesso | 200 com `{ messages: Message[], has_more: boolean }`, no máximo o `tamanho da página do histórico`, em ordem crescente de id. `Message` é `{ id: uuid, conversation_id: uuid, client_message_id: uuid, author: { id, name, username }, body: string, created_at: string (ISO 8601) }` |
| Erros | 400 `validation_failed` (`before` que não é UUID); 401 `unauthenticated`; 404 `not_found`, com o corpo de `GET /v1/conversations/:id` |

### POST /v1/conversations/:id/messages · nova

| Item | O que descreve |
| --- | --- |
| Autenticação | Sessão, pelo cookie `session` |
| Parâmetros de caminho | `id`, como na leitura |
| Corpo da requisição | `client_message_id`: UUID, obrigatório; `body`: texto, obrigatório |
| Resposta de sucesso | 201 com a `Message` gravada, sem envelope |
| Erros | 400 `validation_failed` (`client_message_id` que não é UUID, corpo vazio depois do corte, corpo acima do `tamanho da Mensagem` em grafemas), com o campo em `errors`; 400 `malformed_body`; 413 `payload_too_large`; 401 `unauthenticated`; 404 `not_found` |

A resposta 200 ao `client_message_id` repetido entra com a tarefa 04. Até lá, a repetição cai na
única do banco e responde 500.

### Server Action `sendMessage` (web) · nova

Chamada pelo composer. Recebe o id da Conversa, o `client_message_id` e o corpo; chama
`POST /v1/conversations/:id/messages` com o cookie repassado e devolve
`{ status: "sent", message }`, `{ status: "failed" }` (rede, 5xx ou 400) ou, num 401, apaga o
cookie e manda para `/entrar` com o `voltar` do Canal, como as ações da F01.

## Verificação do contrato

| Item | Critério |
| --- | --- |
| `messages`: gravação e ordem pelo id | CA1 |
| `messages`: única (autor, `client_message_id`) | Revisão da migração no CA1; o comportamento da repetição é da tarefa 04 |
| `messages`: índice da página | Revisão da migração no CA1 |
| `messages`: `CASCADE` da Conversa | CA7 (a fixture `channel` apaga o Canal e, junto, as Mensagens) |
| `messages`: `CASCADE` do autor | CA7 (a fixture `person` apaga a Pessoa e, junto, as Mensagens dela) |
| Esqueleto do carregamento | CA10 |
| `GET … /messages` 200, `before` e `has_more` | CA2 |
| `GET … /messages` 400 | CA2 |
| `GET … /messages` 404 | CA2 |
| `POST … /messages` 201 | CA3 |
| `POST … /messages` 400 (vazio, acima do limite, `client_message_id` malformado) | CA3 |
| `POST … /messages` 404 | CA3 |
| `GET` e `POST … /messages` 401 | Sem teste próprio: o guard é o mesmo de todas as rotas, provado na F01 |
| `sendMessage` `sent` | CA5 |
| `sendMessage` `failed` e o estado `failed` na tela | Tarefa 04, que prova a falha e a nova tentativa |

## Decisões

- **Módulo `messages`.** Controller, service e repository próprios. O service chama o
  `ConversationsService.getConversation` para conferir a participação (spec, "Módulos da API do
  chat"), e o 404 sai do mesmo erro de domínio.
- **Leitura do histórico.** O repository busca o `tamanho da página do histórico` mais um,
  `WHERE conversation_id = :id AND id < :before ORDER BY id DESC`. A sobra diz o `has_more` e sai
  da resposta. O resto vem invertido, em ordem crescente. O autor vem num `JOIN` com `people`, a
  cada leitura.
- **Corte e contagem.** O service corta as pontas com o `trim()` do JavaScript, que tira espaços e
  quebras de linha, e conta com `countGraphemes`, uma função pura com o `Intl.Segmenter` em
  `granularity: "grapheme"`. A recusa é um `ValidationFailedError` no campo `body`. O formato do
  `client_message_id` é validado pelo DTO.
- **Contagem nas duas pontas.** `countGraphemes` tem uma cópia na web (`src/app/utils/graphemes.ts`),
  com a mesma tabela de casos (ADR 0017: sem pacote compartilhado).
- **Vitest na web.** Entra como dependência de desenvolvimento, com um `vitest.config.ts` que roda
  `src/**/*.test.ts` em Node, sem DOM, e o script `pnpm test`. O `apps/web/AGENTS.md` ganha o
  comando em "Comandos" e em "Verificação completa".
- **Página do Canal.** O Server Component busca a Conversa e a primeira página do histórico em
  paralelo, com um `listMessages` no service HTTP, e passa as Mensagens a um componente cliente,
  `MessageList`, e o id do Canal ao `MessageComposer`. O `ConversationIntro` aparece quando o
  Canal não tem Mensagens e quando a primeira página é a última (`has_more` falso), acima da
  primeira Mensagem, como no frame.
- **Lista no cliente.** A `MessageList` guarda as Mensagens enviadas nesta visita sobre as do
  servidor (spec, "Estado do cliente"). O composer avisa a lista por um contexto pequeno do Canal.
  A lista é uma coluna alinhada ao fim (`flex-col-reverse` no contêiner de rolagem), que começa
  rolada até a Mensagem mais recente sem JavaScript.
- **Horário e separadores no cliente.** Como o servidor não conhece o fuso, a `MessageList`
  agrupa por dia e formata o horário só depois de montar no navegador, com `Intl.DateTimeFormat`
  em `pt-BR`. Na renderização do servidor, o horário e os separadores ainda não aparecem, para não
  divergir na hidratação. Os rótulos são "Hoje", "Ontem", "20 de novembro" e, num ano anterior,
  "20 de novembro de 2025", com o microtexto registrado no `frames-da-f02.md` da tarefa 01.
- **MessageItem.** Sempre o layout `full` do frame: avatar de 36 no "gutter", nome em negrito e
  horário na mesma linha, e o texto abaixo, com `padding` 4/20. O layout `compact`, que agrupa
  Mensagens seguidas do mesmo autor, fica fora da F02. O estado `sending` usa a opacidade 0,6 do
  frame `Conversa / Mensagem / Enviando`.
- **Texto da Mensagem.** Uma função pura `linkify(text)` divide o texto em pedaços de texto e de
  link, só para `http://` e `https://`, e a `MessageItem` os renderiza como nós de texto e `<a>`,
  com `whitespace-pre-wrap`. A função tem teste de unidade no Vitest, além da prova pelo
  Playwright.
- **Composer.** Um `<textarea>` com o placeholder "Mensagem para #nome" e a dica "Shift + Enter
  para nova linha" do frame. Enter envia, Shift+Enter quebra a linha. O contador aparece com 200
  grafemas restantes ou menos ("Restam N caracteres"). Acima do limite, ele vira "N caracteres
  acima do limite", no tom de erro, e o envio fica desabilitado. Um corpo vazio depois do corte
  não envia.
- **Envio otimista.** O composer gera o `client_message_id` com o `crypto.randomUUID()`, põe a
  Mensagem no fim da lista como `sending`, limpa o campo e chama a Server Action. No `sent`, a
  Mensagem da lista é trocada pela que a API devolveu. No `failed`, ela passa a `failed`, com o
  texto "Não foi possível enviar." do frame. "Tentar de novo" e a prova da falha são da tarefa 04.
- **Carregamento do Canal.** O `loading.tsx` da casca e do Canal passa a mostrar o esqueleto do
  frame `Conversa / Estrutura / Histórico carregando`, como a spec registra ("BFF e telas",
  "Carregamento"), no lugar do Spinner da tarefa 02. É provado pelo CA10.
- **Fixtures e2e.**
  - `channel`: grava um Canal público com nome único e a participação de todas as Pessoas e o
    apaga ao fim, com as Mensagens.
  - `otherPerson`: grava uma segunda Pessoa e a apaga ao fim.
  - Atalho `insertMessage(database, { channelId, authorId, body, createdAt? })`: grava uma
    Mensagem direto no banco, com a data opcional, para montar o histórico de dois dias.
  - Os testes desta tarefa usam o `timezoneId` do Playwright para fixar o fuso.
- **Microtexto:** o dos frames listados no CA9 e o do registro da tarefa 01.
- **Autor apagado.** Apagar a Pessoa autora apaga as Mensagens dela (`ON DELETE CASCADE`). Isso
  só acontece fora do produto, por SQL, e na limpeza das fixtures do e2e. O `RESTRICT` quebraria
  a limpeza das fixtures se a ordem mudasse, e o `SET NULL` exigiria um "autor removido" na tela.
  A regra vai para a spec, em "Mensagens".
- **Critério do esqueleto.** A tarefa ganha o CA10, que cobre o esqueleto que a spec manda
  entrar aqui.

## Arquivos e interfaces

**API do chat**

- `src/messages/message.entity.ts`: `Message`.
- `src/messages/graphemes.ts`: `countGraphemes(text)`; `graphemes.spec.ts`, o teste.
- `src/messages/messages.repository.ts`: `listPage(conversationId, before?, limit)` e
  `insert(message)`.
- `src/messages/messages.service.ts`: `listMessages(conversationId, personId, before?)` e
  `sendMessage(conversationId, personId, clientMessageId, body)`.
- `src/messages/messages.dto.ts`: `ListMessagesQuery`, `SendMessageDto`, `MessageResponse`,
  `MessagePageResponse`.
- `src/messages/messages.controller.ts`: as duas rotas.
- `src/messages/messages.module.ts`: importa o `ConversationsModule`.
- `src/app.module.ts`: importa o `MessagesModule`.
- `migrations/<timestamp>-CreateMessages.ts`.
- `openapi.json`: regravado.
- `test/messages.e2e-spec.ts` e `test/support/message-rows.ts` (gravar Mensagens no Arrange, com
  data, e mudar o nome de uma Pessoa).

**Web**

- `package.json`, `vitest.config.ts`: o Vitest e o script `test`.
- `src/app/utils/graphemes.ts` e `graphemes.test.ts`; `src/app/utils/linkify.ts` e
  `linkify.test.ts`.
- `src/app/services/chat-api.ts`: `listMessages(token, id)` e `sendMessage(token, id,
  clientMessageId, body)`, com o tipo `Message`.
- `src/app/actions/send-message.ts`: a Server Action.
- `src/app/(app)/(shell)/canais/[id]/page.tsx`: o histórico e o composer.
- `src/app/(app)/(shell)/loading.tsx`: o esqueleto do CA10.
- `src/app/components/message-list.tsx`, `message-item.tsx`, `day-divider.tsx`,
  `message-composer.tsx` e `conversation-skeleton.tsx`.
- `e2e/fixtures.ts`: `channel`, `otherPerson` e `insertMessage`.
- `e2e/02-canais-publicos/*.spec.ts`: os cenários dos CAs 4, 5 e 7.
- `e2e/plans/02-canais-publicos.plan.md`: a seção 2 desta tarefa.
- `apps/web/AGENTS.md`: o `pnpm test`.

## Testes existentes que mudam

- `geral-mostra-cabecalho-e-inicio` (F02-T02): o começo do Canal continua no `#geral` vazio. Só
  muda se outro teste escrever no `#geral`, o que nenhum faz.
- Os testes que abrem um Canal passam a ver o composer. Nenhum confere a ausência dele.

## Mudança de dados

Nenhuma, além da tabela nova.

## Documentos atualizados

- `docs/funcionalidades/02-canais-publicos/spec.md`, "Mensagens": o autor apagado apaga as
  Mensagens dele.
- `docs/funcionalidades/02-canais-publicos/tarefas/03-ler-e-enviar-mensagens/tarefa.md`: entra o
  CA10.

Pela skill `lld`, no modo atualizar:

- `docs/lld.md`, "Módulos da API do chat": entra `messages` ("envia e lista as Mensagens de uma
  Conversa, conferindo a participação pelo `conversations`"), `planejada`.
- `docs/lld.md`, "Dados", tabela de entidades: "Mensagens" passa de `a detalhar` a `planejada;
  forma na spec da F02` (a Citação, a exclusão e a marca "dados de negócio" seguem para a F07 e a
  F13).
- `docs/lld.md`, "Interfaces", "API do chat: Conversas": entram `GET` e `POST
  /v1/conversations/:id/messages`, `planejadas`.
- `docs/lld.md`, "Estrutura do código", tabela de bibliotecas: entra o Vitest na web, para os
  testes de unidade de funções puras, `planejada`.
