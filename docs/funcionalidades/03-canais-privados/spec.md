# Spec · F03 · Canais privados

2026-11-28 · Status: pronta · PRD: [prd.md](prd.md)

Como a F03 será construída. O que a Pessoa consegue fazer, os critérios de aceite e o que não é
objetivo estão no PRD. As convenções transversais, os valores e as regras de Conversas e
participação estão no [LLD](../../lld.md) e na [spec da F02](../02-canais-publicos/spec.md), e esta
spec aponta para eles em vez de repeti-los.

## Problema

Todo Canal é público, e tudo o que se escreve nele chega a todo o Workspace. Não há onde conversar
só entre algumas Pessoas (PRD, seção 1, "Resumo executivo").

## Solução

O diálogo "Criar canal" ganha "Tornar privado". Depois de criar, a Pessoa cai no Canal privado e o
diálogo "Convidar pessoas" abre em seguida, com a opção de pular. Qualquer Participante convida
mais Pessoas a partir da lista de Participantes, aberta pelo cabeçalho. O Convite vale na hora e
fica registrado num Aviso no histórico. Para quem não participa, o Canal privado não existe. O
fluxo completo está no PRD, seção 2, "Fluxo principal".

## Histórias de usuário

As histórias H1 a H5 do PRD (seção 2, "Histórias de usuário e critérios de aceite") valem como
estão, com os critérios de aceite de lá. Esta spec acrescenta as que o PRD não detalha:

6. Como Participante, quero que convidar de novo quem já participa não registre nada, para um
   clique repetido ou dois Convites simultâneos não deixarem Avisos duplicados.
7. Como Pessoa, quero que a busca de Pessoas do Convite só funcione dentro de um Canal privado de
   que eu participo, para não usar o Convite como caminho para descobrir Canais privados.
8. Como Operador, quero que apagar uma Pessoa não apague os Avisos em que ela aparece, para o
   registro de quem passou a ler um Canal privado continuar no histórico.

## Decisões de implementação

### Conversas e participação (API do chat)

- **Tipo:** o enum de `conversations.type` ganha `private_channel` (o `ALTER TYPE` que a F02
  previu). O `CHECK` do nome por tipo já aceita o Canal privado, e o índice único do nome, com a
  condição `name IS NOT NULL`, já vale entre públicos e privados (spec da F02, "Conversas e
  participação").
- **Participação:** a mesma tabela `participations`
  ([ADR 0024](../../adr/0024-participacao-gravada-em-canal-publico.md)). Criar um Canal privado
  grava só a participação de quem criou. Criar uma conta continua gravando a participação só nos
  Canais públicos.
- **Conferência de acesso:** a mesma do Canal público. O service de Conversas confere a
  participação, e o 404 `not_found` cobre o id malformado, a Conversa inexistente e a Conversa sem
  participação (LLD, "Segurança"). Isso fecha a pendência do LLD sobre o lugar da conferência no
  Canal privado.
- **Lock das participações:** criar um Canal privado não toma o lock consultivo da F02, porque não
  grava a participação de todas as Pessoas. O Convite também não, porque só insere os pares que
  faltam, com o conflito ignorado.

### Aviso no histórico (API do chat)

O Aviso fica na tabela `messages`, com tipo
([ADR 0026](../../adr/0026-aviso-no-historico-na-tabela-das-mensagens.md)). Mudança de schema:

| Coluna | Antes | Depois |
| --- | --- | --- |
| `kind` | — | enum `text` ou `invite`, com `text` como padrão para as Mensagens que já existem |
| `author_person_id` | obrigatório | obrigatório só no `text`; nulo no `invite` |
| `client_message_id` | obrigatório | obrigatório só no `text`; nulo no `invite` |
| `body` | obrigatório | obrigatório só no `text`; nulo no `invite` |
| `notice` | — | jsonb, obrigatório só no `invite`: `actor_person_id` e `invitee_person_ids`, na ordem do Convite |

- Um `CHECK` amarra cada coluna ao tipo. A única `messages_author_client_message_key` continua
  valendo, porque o Postgres não compara os nulos do Aviso.
- O `notice` guarda os ids sem chave estrangeira. Na leitura, a API busca as Pessoas e devolve
  `null` no lugar de uma que não existe mais (história 8). O apagamento em cascata pelo autor, da
  F02-T03, continua valendo só para a Mensagem.
- Enviar Mensagem continua gravando só `text`. A edição e a exclusão (F07), as Não lidas e as
  Menções (F06) e o Resumo (F11) leem só `text`. Cada uma dessas specs repete o filtro.

### Busca de Pessoas (API do chat)

- `GET /v1/people?q=&conversation_id=`, as duas obrigatórias. A rota confere a participação de
  quem pede na Conversa, com o mesmo 404, e só aceita Canal privado (história 7).
- **Comparação:** o termo, cortado nas pontas, é comparado com o começo de qualquer palavra do nome
  e com o começo do @usuário, sem diferenciar maiúsculas e acentos, pela extensão `unaccent` do
  Postgres, criada pela migração da tarefa. O termo vazio depois do corte responde 400.
- **Resultado:** até `tamanho da busca de Pessoas` (10, valor novo no LLD), em ordem de nome, cada
  um com `id`, `name`, `username` e `is_participant`. Bots não existem até a F10. A F04 reaproveita
  a busca para a Conversa direta, e decide então como ela funciona fora de um Canal.

### Rotas da API do chat

Mudanças e rotas novas, `planejadas`, com Sessão e com o corpo de erro do LLD ("Erros"):

| Rota | Entrada | Sucesso | Erros |
| --- | --- | --- | --- |
| `POST /v1/channels` · alterada | `type` opcional, `public_channel` (padrão) ou `private_channel` | 201 com `channel`, agora com `type` | Os da F02 |
| `GET /v1/channels` · alterada | — | 200 com `channels`, com os privados de que a Pessoa participa e o `type` em cada um | Os da F02 |
| `GET /v1/conversations/:id` · alterada | — | 200 com `conversation`, agora com `participant_count` | Os da F02 |
| `GET /v1/conversations/:id/messages` · alterada | Os da F02 | 200 com `messages`, que passam a ter `kind` | Os da F02 |
| `GET /v1/conversations/:id/participants` · nova | — | 200 com `participants` (`{ id, name, username }`), em ordem de nome | `not_found` (404) |
| `POST /v1/conversations/:id/participants` · nova | `person_ids`, de 1 a N uuids | 201 com `message`, o Aviso; 200 com `message: null` quando todos já participam | `validation_failed` (400), `not_found` (404), `conversation_not_private` (422) |
| `GET /v1/people` · nova | `q`, `conversation_id` | 200 com `people` | `validation_failed` (400), `not_found` (404), `conversation_not_private` (422) |

- **Forma do item do histórico:** `message` ganha `kind`. No `text`, segue a forma da F02. No
  `invite`, tem `id`, `conversation_id`, `kind`, `created_at`, `actor` e `invitees`, em que cada
  Pessoa é `{ id, name, username }` ou `null`.
- **Convite:**
  - Os ids que já participam são ignorados, e o Aviso lista só quem passou a participar agora.
    Um id que não é de uma Pessoa responde 400, e nada é gravado.
  - As participações e o Aviso são gravados na mesma transação. A inserção ignora o conflito no
    par e devolve os pares que entraram: dois Convites simultâneos com a mesma Pessoa deixam um
    Aviso só com ela (história 6).
  - Sem nenhum par novo, nada é gravado, e a resposta é 200 com `message: null`.
  - Num Canal público, responde 422 `conversation_not_private`.
- **Contagem:** `participant_count` vem em toda Conversa. A web só a mostra no Canal privado.
- **Códigos de erro novos:** `conversation_not_private` (422) entra no tipo de códigos e no mapa de
  status do filter, na tarefa do Convite.

### Módulos da API do chat

- **`conversations`:** cria o Canal privado, lê a contagem e a lista de Participantes e grava o
  Convite, que chama o `messages` para gravar o Aviso na mesma transação.
- **`messages`:** grava e lê o Aviso, e devolve o histórico com os dois tipos, buscando as Pessoas
  do `notice`.
- **`people`:** a busca de Pessoas. Depende do `conversations` para conferir a participação e o
  tipo.

### BFF e telas (web)

- **Chamadas:**
  - Criar Canal privado e Convidar são Server Actions.
  - A busca de Pessoas é uma Server Action chamada pelo diálogo, com espera de 250 ms depois da
    última tecla, e descarta a resposta de uma busca que já ficou para trás.
  - As leituras da página (Conversa, histórico e Participantes) são feitas pelos Server Components,
    como na F02.
- **Criar:** o diálogo "Criar canal" ganha o Switch "Tornar privado". No sucesso de um Canal
  privado, a ação redireciona para `/canais/<id>?convidar=1`. A página abre "Convidar pessoas" no
  modo de criação, com "Pular" no lugar de "Cancelar", e tira o parâmetro do endereço quando o
  diálogo fecha.
- **Cabeçalho:** o cadeado no lugar do `#`, no cabeçalho e na barra lateral (o ícone `Lock`). Só no
  Canal privado, o botão com o ícone de pessoas e a contagem abre "Participantes de #nome".
- **"Participantes de #nome":** a lista com o nome e o @usuário, "(você)" na própria Pessoa, em
  ordem de nome, e o botão "Convidar pessoas", que fecha a lista e abre o diálogo de Convite.
- **"Convidar pessoas para #nome":**
  - o campo de busca é um combobox, com as setas, o Enter e o Esc, e as escolhas viram fichas com
    o botão de tirar;
  - quem já participa aparece com "Participante", sem poder ser escolhido;
  - os estados seguem os frames: Escolhidas, Ninguém encontrado, Enviando e Falha ao convidar;
  - o aviso de histórico aparece só fora do modo de criação;
  - no sucesso, o diálogo fecha, e a página é revalidada para o Aviso e a contagem aparecerem.
- **Aviso no histórico:** uma linha própria no histórico, sem avatar e sem horário de Mensagem, com
  o texto montado por uma função pura: "@ana convidou @bruno", "@bruno e @carla", "@bruno, @carla e
  @davi", com "alguém" no lugar de `null`. O Aviso não entra no agrupamento de Mensagens seguidas do
  mesmo autor, mas entra no separador de dia.
- **Barra lateral:** os Canais privados ficam na seção Canais, na ordem de nome da API.

### Design no Pencil

O `slack-ia.pen` já tem o Canal privado:
- `Conversa / Estrutura / Canal privado`;
- `Conversa / Sobreposições / Membros do canal privado`;
- `Diálogos / Adicionar pessoas / Escolhidas`, `Ninguém encontrado`, `Enviando`, `Falha ao
  adicionar` e `Pela lista de Membros`;
- "Tornar privado" nos frames `Diálogos / Criar canal / <Estado>`.

A primeira tarefa da F03 ajusta esses frames a esta spec e desenha os que faltam, antes de qualquer
tarefa de tela, seguindo o `docs/design-system.md`, "Fluxo com a ferramenta de design":
- **Microtexto:** troca "Adicionar pessoas", "Adicionar" e "Membros" por "Convidar pessoas",
  "Convidar" e "Participantes", inclusive nos nomes dos frames.
- **Resultados da busca:** só o nome e o @usuário, sem cargo nem Presença (F04 e F09), com a marca
  "Participante".
- **Modo de criação:** o diálogo com "Pular", sem o aviso de histórico.
- **Frame novo:** o Aviso no histórico no meio de um Canal privado com Mensagens.
- **Fora da F03:** o `Conversa / Sobreposições / Membros do canal`, do Canal público, que o PRD
  deixa fora.

Depois da tarefa, os frames passam a se chamar `Conversa / Sobreposições / Participantes do canal
privado` e `Diálogos / Convidar pessoas / <Estado>` (`Escolhidas`, `Ninguém encontrado`,
`Enviando`, `Falha ao convidar` e `Pela lista de Participantes`), e o Aviso fica em `Conversa /
Lista / Aviso no histórico` (decidido na F03-T01).

### Tempo real

A F03 não sobe o WebSocket. O Canal privado aparece na barra lateral da Pessoa convidada, e o
Aviso no histórico dos outros Participantes, ao recarregar ou reabrir. Os eventos por Pessoa ficam
com a F05, que entrega os de um Canal privado só aos Participantes dele.

## Decisões de teste

**O que faz um bom teste aqui:** o teste prova o comportamento externo, que é a resposta HTTP, a
linha no banco ou o que a tela mostra, e não a forma interna dos services. A forma de cada teste
está na rule de testes da API e no `apps/web/AGENTS.md`, "Testes de ponta a ponta".

**Pontos de teste:**
- os testes de ponta a ponta da API, o ponto principal;
- o Playwright na web;
- o teste de unidade da função do texto do Aviso, no Vitest da web.

**API do chat, testes de ponta a ponta por HTTP com banco real:**

- **Criar Canal privado:**
  - responde 201 com `type: private_channel`, e só quem criou participa;
  - aparece em `GET /v1/channels` de quem criou, na ordem de nome, e não aparece na de outra
    Pessoa;
  - uma conta criada depois não participa dele;
  - o nome de um Canal privado já usado responde 409 com o mesmo corpo do Canal público.
- **Acesso:** a Conversa, o histórico, o envio, os Participantes, o Convite e a busca respondem 404
  com o mesmo corpo para quem não participa e para um id que não existe.
- **Convite:**
  - responde 201 com o Aviso, e a Pessoa convidada passa a ver o Canal e o histórico anterior;
  - os ids que já participam são ignorados, e todos já participando responde 200 com `null`, sem
    Aviso novo;
  - um id que não é de Pessoa responde 400, e nada é gravado;
  - num Canal público, responde 422;
  - dois Convites simultâneos com a mesma Pessoa deixam um Aviso só com ela.
- **Histórico:** o Aviso aparece na ordem, entre as Mensagens, com `actor` e `invitees`; com a
  Pessoa apagada no banco, ela vem `null`, e o Aviso continua.
- **Participantes:** a lista em ordem de nome e a `participant_count` da Conversa.
- **Busca:**
  - acha pelo começo de qualquer palavra do nome e pelo começo do @usuário, sem diferenciar
    maiúsculas e acentos;
  - devolve no máximo 10, em ordem de nome, com `is_participant`;
  - o termo vazio responde 400, e um Canal público responde 422.
- **Contrato:** o documento gerado é igual ao snapshot gravado.

**Texto do Aviso, teste de unidade:** a função da web com um, dois e três convidados, e com
`null` no lugar de quem convidou e de um convidado.

**Web, testes de ponta a ponta com o Playwright,** nas mesmas condições da F02:

- Criar um Canal privado: o cadeado na barra lateral e no cabeçalho, e "Convidar pessoas" aberto
  em seguida. "Pular" deixa o Canal só com quem criou.
- Convidar na criação: a busca, as fichas, o Convite e o Aviso no começo do histórico.
- Convidar pela lista de Participantes: a contagem, a lista, "Participante" nos resultados e o
  Aviso.
- A Pessoa convidada vê o Canal na barra lateral e o histórico anterior ao entrar.
- Outra Pessoa não vê o Canal, e o endereço dele mostra a Conversa não encontrada.
- Ninguém encontrado e a falha ao convidar, com a Server Action bloqueada pelo `page.route`.
- O fluxo só pelo teclado: o Switch, o combobox, as fichas, "Pular" e a lista.
- A checagem de acessibilidade com `@axe-core/playwright` no Canal privado com Aviso, na lista de
  Participantes e no diálogo de Convite com resultados e com fichas, sem violações.

**Base dos testes da web, que a F03 estende:**

- Uma fixture de Canal privado, com nome único e as participações escolhidas pelo teste, apagada
  ao fim.
- Os Canais privados criados pela tela usam a fixture `createdChannelName` da F02.
- O plano de testes e2e ganha o arquivo da F03, que aponta para esta spec.

**Verificações do agente com o `playwright-cli`**, registradas na pasta da tarefa da tela:
validação visual em 1440 × 900, nos temas claro e escuro, comparada com os frames do Pencil
(`docs/design-system.md`, "Validação visual").

**Exemplos anteriores:**
- `test/channels.e2e-spec.ts` e `test/messages.e2e-spec.ts` da API, com o `createTestApp()`, os
  atalhos de `authRoutes` e o `insertChannel` das rows de teste;
- `message-time.test.ts` e `channel-name.test.ts` na web, como modelo da função pura;
- os cenários de `e2e/02-canais-publicos/` e as fixtures `testChannel` e `createdChannelName`.

## Fora de escopo

- Tudo o que o PRD lista em "O que não é objetivo".
- O WebSocket e os eventos de Canal, de Convite e de Aviso (F05).
- A busca de Pessoas fora de um Canal privado e a Conversa direta (F04).
- A lista de Participantes do Canal público.
- Cargo e Presença nos resultados da busca (F04 e F09).

## Observações

- **LLD:** as tarefas atualizam o LLD pela skill `lld`, no modo atualizar:
  - a pendência "Lugar da conferência de participação em canal privado e conversa direta" sai, com
    a regra desta spec para o Canal privado; a Conversa direta continua com a F04;
  - as rotas novas entram em "Interfaces", e o `tamanho da busca de Pessoas` entra em "Valores e
    configuração";
  - a tabela de telas troca "Convidar para Canal privado (F03)" pelos diálogos desta spec;
  - o `kind` e o `notice` de `messages` entram em "Dados", e a ADR 0026 entra no índice de
    "Decisões".
- **HLD:** não muda. A seção 1 já tem o Canal privado visível só para quem foi convidado.
- **PRD:** ajustado nesta spec ao fluxo dos frames: o Convite na criação abre em seguida, num
  diálogo com "Pular", e não num campo do diálogo "Criar canal".
- **Os frames são citados pelo nome:** os ids mudam quando um frame é recriado.
- **Recorte em tarefas:** fica nos `tarefa.md` da pasta da funcionalidade, a partir desta spec.
