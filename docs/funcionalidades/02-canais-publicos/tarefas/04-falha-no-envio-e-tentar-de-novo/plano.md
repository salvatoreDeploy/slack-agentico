# Plano da F02-T04: Falha no envio e tentar de novo

Tarefa: [tarefa.md](tarefa.md) · Spec: [spec.md](../../spec.md) · PRD: [prd.md](../../prd.md)

## Critérios

### CA1

**Marca:** teste HTTP

**Cenário:**
- Dado uma Mensagem já enviada, quando a mesma Pessoa envia de novo com o mesmo
  `client_message_id`, então recebe 200 com a Mensagem já gravada (o mesmo `id`, o corpo e a data
  da primeira), mesmo que o corpo da repetição seja outro, e o banco fica com uma linha só.
- Duas Pessoas com o mesmo `client_message_id` gravam duas Mensagens, porque a unicidade é por
  autor.
- O snapshot do contrato é igual ao gravado, com o 200 do `POST`.

**Teste previsto:** e2e da API, `test/messages.e2e-spec.ts`:
- "o mesmo client_message_id do mesmo autor responde 200 com a Mensagem já gravada";
- "o mesmo client_message_id de outro autor grava outra Mensagem";
- `test/openapi.e2e-spec.ts`, que já existe.

### CA2

**Marca:** teste no Playwright

**Cenário:** Dado um Canal da fixture, quando o envio da Server Action falha, a Mensagem fica com o
texto, o aviso "Não foi possível enviar." e o botão "Tentar de novo". Com o envio liberado, "Tentar
de novo" volta a Mensagem a "enviando" e depois a enviada, sem o aviso.

**Teste previsto:** Playwright, `e2e/02-canais-publicos/falha-no-envio-e-tentar-de-novo.spec.ts`.

### CA3

**Marca:** teste no Playwright

**Cenário:**
- Dado um envio que chega à API e grava, mas cuja resposta se perde no caminho (o `page.route`
  repassa a requisição e devolve uma falha ao navegador), quando a Pessoa usa "Tentar de novo",
  então, depois de reabrir o Canal, há uma Mensagem só.
- Na falha comum, com a requisição bloqueada, "Tentar de novo" funciona pelo teclado: o botão
  recebe o foco por Tab, e Enter reenvia.

**Teste previsto:** Playwright, em `e2e/02-canais-publicos/`:
- `tentar-de-novo-nao-duplica.spec.ts`;
- `tentar-de-novo-pelo-teclado.spec.ts`.

### CA4

**Marca:** documento

**Cenário:** Quem revisa abre o `validacao-visual.md` na pasta desta tarefa e encontra a Mensagem
`failed` comparada com o frame `Conversa / Mensagem / Falha no envio`, nos dois temas, e como o
estado foi produzido.

## Contrato

### POST /v1/conversations/:id/messages · alterada

| Item | Antes | Depois |
| --- | --- | --- |
| Resposta de sucesso | 201 com a `Message` gravada | 201 com a `Message` gravada; **200** com a `Message` já gravada quando o par (autor, `client_message_id`) já existe, sem gravar nada |
| Erros | Sem mudança | Sem mudança |

O 200 devolve a Mensagem como ela foi gravada da primeira vez, mesmo que o corpo da repetição seja
outro. A participação continua conferida antes, então a repetição numa Conversa sem participação
responde 404.

### Server Action `sendMessage` (web) · sem mudança no contrato

Ela já trata o 200 como `sent`. A nova tentativa só a chama de novo com o mesmo
`client_message_id` e o mesmo corpo.

## Verificação do contrato

| Item | Critério |
| --- | --- |
| `POST … /messages` 200 na repetição, com uma linha só | CA1 |
| Unicidade por autor, e não por Conversa | CA1 |
| `POST … /messages` 201 e erros | Já provados na F02-T03 |
| Nova tentativa sem duplicar, ponta a ponta | CA3 |

## Decisões

- **Repetição na API.** O `MessagesRepository.insert` passa a usar `INSERT … ON CONFLICT DO
  NOTHING` na única `messages_author_client_message_key`, como o de Pessoas. Sem linha gravada, o
  service busca a Mensagem pelo par (autor, `client_message_id`), com o autor, e a devolve com
  `created: false`. O controller responde 200 nesse caso e 201 no resto, pelo `@Res({ passthrough:
  true })`. A conferência fica no controller, porque o status é HTTP, e o service só diz se gravou.
- **Repetição em outra Conversa.** Se o par já existe numa Conversa diferente, a API devolve a
  Mensagem gravada, como diz o LLD ("devolve a mensagem já gravada"). O id é gerado pelo cliente
  para cada envio, e a colisão entre Conversas só acontece com um cliente com defeito.
- **Tela da falha.** A `MessageItem` em `failed` mostra a linha do frame: o ícone `CircleAlert` de
  16 e "Não foi possível enviar." no tom de erro, e o botão "Tentar de novo", no estilo de link,
  com `padding` 4 em cima e `gap` 8. "Descartar" fica fora, como decidiu a F02-T01.
- **Nova tentativa.** A `ChannelConversation` ganha `retry(clientMessageId)`, que volta a Mensagem
  a `sending` e chama a Server Action com o mesmo `client_message_id` e o mesmo corpo. A
  `MessageItem` recebe `onRetry` só no estado `failed`, e o `memo` continua valendo para as
  Mensagens enviadas.
- **Foco.** O botão "Tentar de novo" é um `<button>` comum, na ordem do Tab. Depois da nova
  tentativa, o foco volta ao composer, para a Pessoa seguir escrevendo.
- **Testes de falha.** Bloqueiam o `POST` da Server Action no endereço do Canal com o
  `page.route`. Para a resposta perdida, o handler chama `route.fetch()`, que entrega a requisição
  à API, e responde ao navegador com `route.abort()`.
- **Status da repetição.** A repetição responde 200, e a primeira gravação 201, como a spec
  ("Rotas da API do chat") e o CA1. O 200 diz ao cliente que nada novo foi criado. O LLD, que dizia
  "com o mesmo status de sucesso", é corrigido no commit de plano.

## Arquivos e interfaces

**API do chat**

- `src/messages/messages.repository.ts`: `insert(message)` devolve se gravou;
  `findByAuthorAndClientId(authorId, clientMessageId)`, com o autor.
- `src/messages/messages.service.ts`: `sendMessage` devolve `{ message, created }`.
- `src/messages/messages.controller.ts`: o 200 na repetição e o `@ApiOkResponse` do `POST`.
- `openapi.json`: regravado.
- `test/messages.e2e-spec.ts`: os casos do CA1.

**Web**

- `src/app/components/message-item.tsx`: a linha da falha e o `onRetry`.
- `src/app/components/channel-conversation.tsx`: o `retry`.
- `src/app/components/message-composer.tsx`: um `ref` para devolver o foco ao composer.
- `e2e/02-canais-publicos/*.spec.ts`: os cenários do CA2 e do CA3.
- `e2e/plans/02-canais-publicos.plan.md`: a seção 3 desta tarefa.

## Testes existentes que mudam

Nenhum. O teste da F02-T03 que segura o envio (`envia-uma-mensagem`) continua igual, porque ele
libera a requisição.

## Mudança de dados

Nenhuma.

## Documentos atualizados

Pela skill `lld`, no modo atualizar:

- `docs/lld.md`, "Concorrência e idempotência", "Envio de mensagem": "com o mesmo status de
  sucesso" passa a "com 200, em vez do 201 da primeira gravação".
