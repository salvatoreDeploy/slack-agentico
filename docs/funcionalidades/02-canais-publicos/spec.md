# Spec · F02 · Canais públicos

2026-11-20 · Status: pronta · PRD: [prd.md](prd.md)

Como a F02 será construída. O que a Pessoa consegue fazer, os critérios de aceite e o que não é
objetivo estão no PRD. As convenções transversais, os valores e as regras de Conversas e
participação estão no [LLD](../../lld.md), e esta spec aponta para eles em vez de repeti-los.

## Problema

Depois de entrar, a Pessoa encontra só a casca vazia do chat. Não há Conversa onde trocar
Mensagens com o time nem onde, mais tarde, mencionar um Agente (PRD, seção 1, "Resumo executivo").

## Solução

O Workspace já nasce com o `#geral`, e a página inicial abre nele. A barra lateral lista todos os
Canais públicos, e qualquer Pessoa cria um novo, com nome e descrição. Dentro do Canal, a Pessoa lê
as Mensagens mais recentes e envia as suas, que aparecem na hora para ela. As das outras Pessoas
aparecem ao reabrir o Canal, até a F05 trazer o tempo real. O fluxo completo está no PRD, seção 2,
"Fluxo principal".

## Histórias de usuário

As histórias H1 a H6 do PRD (seção 2, "Histórias de usuário e critérios de aceite") valem como
estão, com os critérios de aceite de lá. Esta spec acrescenta as que o PRD não detalha:

7. Como Operador, quero que a conta que eu crio já participe de todos os Canais públicos, para a
   Pessoa nova ver o `#geral` e os outros Canais no primeiro acesso.
8. Como Pessoa, quero que uma Mensagem reenviada depois de uma falha não apareça duas vezes, para
   a Conversa não ficar com repetições quando a rede oscila.
9. Como Pessoa, quero que um endereço de Canal inválido mostre o mesmo aviso que um Canal que não
   existe, para não descobrir pelo endereço que existe um Canal que eu não posso ver (vale a partir
   da F03).

## Decisões de implementação

### Conversas e participação (API do chat)

A forma segue as ADRs [0024](../../adr/0024-participacao-gravada-em-canal-publico.md), da
participação gravada, e [0025](../../adr/0025-conversas-numa-tabela-com-tipo.md), da tabela única
com tipo. As regras que o schema não mostra estão no LLD, "Dados".

Tabela `conversations`, `planejada`:

| Coluna | Tipo | Regra |
| --- | --- | --- |
| `id` | uuid | UUID v7 |
| `type` | enum | `public_channel`; `private_channel` e `direct` entram com a F03 e a F04 |
| `name` | texto, nulo | O nome normalizado ("Nome do Canal", abaixo); obrigatório nos Canais e nulo na Conversa direta, por restrição no banco |
| `description` | texto, nulo | A descrição já tratada, dentro do `tamanho da descrição do Canal`; nula quando vazia |
| `created_by` | uuid, nulo | Referência a `people`; nulo no `#geral`. Apagar a Pessoa deixa o campo nulo, sem apagar o Canal |
| `created_at`, `updated_at` | timestamptz | Convenção do LLD, "Dados" |

- Índice único parcial em `name`, só entre os Canais, com a condição `name IS NOT NULL`. Como só
  Canal tem nome (o `CHECK` do nome por tipo), a condição equivale a "entre os Canais" e não muda
  quando o enum ganha tipos. A condição pelo tipo foi descartada porque a conversão do enum para
  texto não é imutável, e o Postgres não a aceita num índice (decidido na F02-T02).

Tabela `participations`, `planejada`:

| Coluna | Tipo | Regra |
| --- | --- | --- |
| `conversation_id` | uuid | Referência a `conversations`; apagar a Conversa apaga as participações |
| `person_id` | uuid | Referência a `people`, com índice; apagar a Pessoa apaga as participações dela |
| `created_at`, `updated_at` | timestamptz | Convenção do LLD |

- A chave primária é composta, (`conversation_id`, `person_id`), e foge da convenção do id em
  UUID. A participação nunca é referenciada sozinha, e o par já é a identidade dela. A última
  leitura e os contadores da F06 entram nesta mesma linha
  ([ADR 0021](../../adr/0021-contadores-gravados.md)).
- **Gravar as participações:**
  - criar um Canal público grava a participação de todas as Pessoas, na mesma transação;
  - criar uma conta grava a participação da Pessoa em todos os Canais públicos, também na mesma
    transação.
- **Corrida entre as duas gravações:** uma conta e um Canal criados ao mesmo tempo poderiam deixar
  a Pessoa fora do Canal. Por isso, as duas operações tomam o mesmo lock consultivo de transação
  do Postgres antes de gravar. A inserção ignora o conflito no par.

**Migração do `#geral`:**
- cria o Canal público `geral`, com a descrição "Canal de todo o Workspace" e sem criador;
- grava a participação das Pessoas que já existem;
- o `#geral` não tem marcação especial: a web o encontra pelo nome.

### Nome do Canal

A regra está no PRD, H3. Ela tem duas implementações, uma na web, para a prévia enquanto a Pessoa
digita, e outra na API do chat, que é quem decide. Não há pacote compartilhado
([ADR 0017](../../adr/0017-projetos-pnpm-independentes.md)), e as duas passam pela mesma tabela
de casos. Passos, nesta ordem:

1. Decompõe os acentos e tira as marcas (NFD).
2. Passa a minúsculas.
3. Troca cada sequência de caracteres fora de `a-z` e `0-9` por um hífen. Uma letra que não
   decompõe numa letra de `a-z`, como `ß` ou um ideograma, conta como fora do conjunto.
4. Tira os hífens das pontas.

O resultado vazio é recusado, e o acima do `tamanho do nome do Canal` também.

| Entrada | Resultado |
| --- | --- |
| `Vendas` | `vendas` |
| `Café & Vendas 2026!` | `cafe-vendas-2026` |
| `  time   produto  ` | `time-produto` |
| `ação_comercial` | `acao-comercial` |
| `--a--b--` | `a-b` |
| `São Paulo/RJ` | `sao-paulo-rj` |
| `Ünïcödé` | `unicode` |
| `🎉 festa` | `festa` |
| `straße` | `stra-e` |
| `!!!` | vazio, recusado |
| 81 vezes `a` | recusado pelo tamanho |
| `GERAL` | `geral`, recusado por já existir (regra da API, não da função) |

**Descrição:** cada quebra de linha vira espaço, e os espaços das pontas são cortados. A descrição
vazia fica nula. O tamanho conta depois desse tratamento.

### Mensagens (API do chat)

Tabela `messages`, `planejada`:

| Coluna | Tipo | Regra |
| --- | --- | --- |
| `id` | uuid | UUID v7, gerado pela API ao gravar: é a ordem do histórico e o cursor da paginação |
| `conversation_id` | uuid | Referência a `conversations` |
| `author_person_id` | uuid | Referência a `people`; apagar a Pessoa apaga as Mensagens dela, o que só acontece fora do produto (decidido na F02-T03); o autor Bot entra com a F10 |
| `client_message_id` | uuid | Gerado no cliente; único com o autor (LLD, "Concorrência e idempotência") |
| `body` | texto | O texto já cortado, dentro do `tamanho da Mensagem` |
| `created_at`, `updated_at` | timestamptz | Convenção do LLD |

- Índice em (`conversation_id`, `id`), para a página do histórico.
- A Citação, a exclusão e a marca "dados de negócio" ficam para a F07 e a F13.
- **Corte e contagem:**
  - Antes de gravar, a API corta os espaços e as linhas em branco das pontas.
  - O tamanho conta em grafemas, que são os caracteres como a Pessoa os vê, pelo
    `Intl.Segmenter`. A web conta do mesmo jeito.
  - Uma Mensagem vazia depois do corte é recusada.
- **Autor:** a resposta traz o nome atual do autor, lido de `people` a cada leitura, e nunca uma
  cópia gravada na Mensagem.

### Rotas da API do chat

Todas `planejadas`, com Sessão e com o corpo de erro do LLD ("Erros"):

| Rota | Entrada | Sucesso | Erros |
| --- | --- | --- | --- |
| `GET /v1/channels` | — | 200 com `channels`, os Canais de que a Pessoa participa, em ordem de `name` | `unauthenticated` (401) |
| `POST /v1/channels` | `name`, `description` opcional | 201 com `channel` | `validation_failed` (400), `channel_name_taken` (409) |
| `GET /v1/conversations/:id` | — | 200 com `conversation` | `not_found` (404) |
| `GET /v1/conversations/:id/messages` | `before` opcional | 200 com `messages` e `has_more` | `validation_failed` (400, `before` malformado), `not_found` (404) |
| `POST /v1/conversations/:id/messages` | `client_message_id`, `body` | 201 com `message`; 200 com a mesma Mensagem quando o par (autor, `client_message_id`) já existe | `validation_failed` (400), `not_found` (404) |

- **Formas devolvidas:**
  - `channel` tem `id`, `name` e `description`.
  - `conversation` tem `id` e `type`. Num Canal, tem também `name`, `description`, `created_at` e
    `created_by`, que é nulo ou `{ id, name, username }`.
  - `message` tem `id`, `conversation_id`, `client_message_id`, `author` (`{ id, name, username }`),
    `body` e `created_at`.
- **Leitura do histórico:** traz a página de `tamanho da página do histórico`, com as Mensagens
  mais recentes antes de `before`, devolvida em ordem cronológica crescente. A convenção do cursor
  está no LLD, "Interfaces".
- **Não encontrado:** as rotas `/v1/conversations/:id` respondem `not_found` nos três casos do LLD
  ("Segurança"): id malformado, Conversa inexistente e Conversa sem participação de quem pede. A
  participação é conferida pelo service de Conversas, que as rotas de Mensagens chamam.
- **Nome já usado:** o `channel_name_taken` vem da violação do índice único, e não de uma leitura
  anterior, para duas criações simultâneas não passarem as duas. O `detail` é genérico e não diz o
  tipo do Canal que já tem o nome.
- **Códigos de erro novos:** o `channel_name_taken` entra no tipo de códigos e no mapa de status
  do filter, na tarefa da rota.

### Módulos da API do chat

- **`conversations`:** Conversas, Canais e participação. Cria Canal, lista os Canais da Pessoa, lê
  uma Conversa conferindo a participação e grava as participações de uma Pessoa nova.
- **`messages`:** envia e lista as Mensagens de uma Conversa. Depende do service de
  `conversations` para conferir a participação.
- **`accounts`:** o `create` passa a chamar o `conversations` dentro da mesma transação da Pessoa.

### Comando de contas e comando de canais

- O `create` do comando de contas grava a participação da Pessoa nova em todos os Canais públicos
  (história 7).
- A F02 não traz comando de canais. O [`AGENTS.md` da API do chat](../../../apps/chat-api/AGENTS.md)
  descreve um (`channels create`, `set-topic`, `list`, `remove-member`), com os termos "Membro" e
  "Tópico", que o glossário não usa. A tarefa que mexe no `create` corrige o arquivo:
  - tira as linhas do comando de canais;
  - troca "Membro de todos os Canais públicos" por "com participação em todos os Canais públicos";
  - corrige o ponteiro "specs da F02 e da F04, 'Comando de canais'".

### BFF e telas (web)

- **Endereços:**
  - `/canais/<id>` é o Canal.
  - `/` redireciona para o `#geral`, achado pelo nome na lista de Canais que o layout já carrega.
  - Um `?voltar=` para um Canal segue as regras da F01 (LLD, "Cliente", "Sessão no cliente").
- **Chamadas:**
  - Criar Canal e enviar Mensagem são Server Actions.
  - As leituras (Canais, Conversa e histórico) são feitas pelos Server Components, por services
    HTTP da web (`apps/web/AGENTS.md`, "API Externas").
  - A página do Canal é dinâmica e não fica no cache do roteador. Assim, abrir de novo o Canal pela
    barra lateral sempre busca as Mensagens.
  - **Carregamento:** a casca e o segmento do Canal têm um `loading.tsx`. Com o `cacheComponents`,
    é o `<Suspense>` dele que deixa a troca de Canal instantânea: a barra lateral continua visível,
    e só a área da Conversa espera (decidido na F02-T02). O esqueleto do frame "Conversa /
    Estrutura / Histórico carregando" entra com a tarefa 03.
- **Barra lateral:**
  - A Sidebar ganha a SidebarSection "Canais", com uma SidebarRow por Canal, com o ChannelIcon e o
    nome, e a SidebarAction de criar Canal.
  - A linha do Canal aberto usa o estado "Selecionado" do design system, que um componente cliente
    pequeno lê do endereço.
- **Diálogo "Criar Canal":**
  - Usa o Dialog do design system, com o Field do nome, a prévia do nome normalizado e o Field da
    descrição, com o contador.
  - O foco começa no nome, o Esc fecha, e o foco volta à SidebarAction.
  - Com nome vazio ou longo demais, o aviso aparece no campo, sem enviar.
  - No `channel_name_taken`, o aviso aparece no campo do nome, e o diálogo continua aberto com o
    que a Pessoa digitou.
  - Numa falha de rede ou do servidor ao criar, a mensagem do frame aparece no corpo do diálogo,
    com `role="alert"`, e os campos continuam preenchidos.
  - No sucesso, a Pessoa vai para `/canais/<id>`, e a barra lateral já tem o Canal novo.
- **Canal:**
  - **Cabeçalho:** o ConversationHeader, com o `#nome` e a descrição.
  - **Título da aba:** `#nome`, seguido do nome do produto.
  - **Histórico:**
    - Mostra MessageItem, com DayDivider entre os dias, e começa rolado até o fim.
    - Sem Mensagens, mostra o ConversationIntro, com o criador e a data. No `#geral`, mostra a
      descrição.
  - **Horário e separadores de dia:**
    - São formatados no cliente, em `pt-BR` e no fuso do navegador, num componente cliente.
    - O servidor não conhece o fuso, e formatar lá daria um horário errado e uma divergência na
      hidratação.
- **Texto da Mensagem:**
  - É renderizado como nós de texto.
  - Os endereços `http://` e `https://` viram `<a>` com `target="_blank"` e
    `rel="noopener noreferrer"`.
  - As quebras de linha são mantidas pelo CSS.
  - Nunca se injeta HTML.
- **MessageComposer:**
  - Enter envia e Shift+Enter quebra a linha.
  - O contador aparece perto do `tamanho da Mensagem`, a partir do limiar do frame do MessageComposer
    no Pencil, e acima do limite o envio fica bloqueado.
  - A contagem usa grafemas, como a API.
- **Envio otimista:**
  - O MessageComposer gera o `client_message_id`, acrescenta a Mensagem ao fim da lista no estado
    `sending` e limpa o campo.
  - Na resposta, a Mensagem passa a `sent`.
  - Na falha, de rede ou do servidor, passa a `failed`, com o texto preservado e "Tentar de novo".
  - "Tentar de novo" reenvia com o mesmo `client_message_id`.
- **Estado do cliente:**
  - As Mensagens enviadas ficam no estado local do componente da lista, sobre a página que veio do
    servidor.
  - O SWR que o LLD prevê para as leituras que o tempo real altera ("Cliente", "Leituras e tempo
    real") entra com a F05, junto com os eventos.
- **Canal não encontrado:** quando a API responde `not_found`, a tela mostra o estado de Canal não
  encontrado dentro da casca, com um link para o `#geral`.
- **Textos:** o microtexto de cada estado vem dos frames do Pencil (LLD, "Onde mora cada fato").

### Design no Pencil

A primeira tarefa da F02 confere, no `slack-ia.pen`, os frames de:
- seção Canais na barra lateral, com a linha ativa;
- diálogo "Criar Canal", nos estados padrão, nome inválido, nome já usado, enviando e falha ao
  criar;
- Canal com histórico e separador de dia;
- Canal vazio, comum e `#geral`;
- Mensagem `sending` e `failed`;
- composer perto do limite e acima dele;
- Canal não encontrado.

Ela reaproveita os que já existem, ajustando o que diverge desta spec, e desenha os que faltarem
antes de qualquer tarefa de tela, seguindo o `docs/design-system.md`,
"Fluxo com a ferramenta de design". O Pencil precisa estar aberto no aplicativo para o MCP
responder.

### Tempo real

A F02 não sobe o WebSocket. A Mensagem e o Canal de outra Pessoa, ou de outra aba, aparecem quando
a página do Canal é renderizada de novo: ao abrir o Canal ou recarregar a página. Os eventos de
Mensagem e de Canal novo são da F05.

## Decisões de teste

**O que faz um bom teste aqui:** o teste prova o comportamento externo, que é a resposta HTTP, a
linha no banco ou o que a tela mostra, e não a forma interna dos services. A forma de cada teste
está na rule de testes da API e no `apps/web/AGENTS.md`, "Testes de ponta a ponta".

**Pontos de teste:**
- os testes de ponta a ponta da API, que são o ponto principal;
- os testes de integração do comando de contas;
- o Playwright na web;
- os testes de unidade da normalização do nome, nas duas pontas, com a tabela de "Nome do Canal".

**API do chat, testes de ponta a ponta por HTTP com banco real:**

- **`#geral`:**
  - existe depois da migração, sem criador e com a descrição;
  - aparece em `GET /v1/channels` para uma Pessoa criada pelo service.
- **Criar Canal:**
  - responde 201, grava o nome normalizado e grava a participação de todas as Pessoas que existem;
  - o Canal aparece na lista de outra Pessoa.
- **Nome:**
  - o vazio depois da normalização e o acima do `tamanho do nome do Canal` respondem 400;
  - o já usado, inclusive `GERAL`, responde 409 `channel_name_taken`, e nada é gravado;
  - duas criações simultâneas com o mesmo nome criam um Canal só.
- **Descrição:** a quebra de linha vira espaço, as pontas são cortadas, a vazia fica nula e a
  acima do `tamanho da descrição do Canal` responde 400.
- **Lista:** vem em ordem de nome, sem o `#geral` fixo no topo.
- **Ler a Conversa:** um Canal responde 200 com o criador. Um id malformado e um id que não existe
  respondem os dois 404, com o mesmo corpo.
- **Histórico:**
  - um Canal com mais Mensagens que o `tamanho da página do histórico` devolve as mais recentes,
    em ordem crescente, com `has_more`;
  - o `before` devolve a página anterior;
  - a última página vem com `has_more` falso;
  - um `before` malformado responde 400.
- **Enviar:**
  - responde 201 com a Mensagem e o autor;
  - as pontas do texto são cortadas;
  - um texto vazio ou só com espaços responde 400;
  - 4.000 grafemas passam, inclusive com emojis que ocupam vários pontos de código, e 4.001
    respondem 400;
  - o mesmo `client_message_id` enviado duas vezes responde 200 na segunda, com a mesma Mensagem,
    e o banco tem uma linha só.
- **Autor:** depois de mudar o nome da Pessoa no banco, o histórico mostra o nome novo.
- **Contrato:** o documento gerado é igual ao snapshot gravado.

**Comando de contas, testes de integração contra o banco de testes:** o `create` grava a
participação da Pessoa nova no `#geral` e em todos os outros Canais públicos que existem.

**Normalização do nome, testes de unidade:** a tabela de "Nome do Canal" nas duas pontas. Na API,
com o Jest que já existe. Na web, com o Vitest, que entra nesta funcionalidade, como a spec da F01
previa ("Decisões de teste", "Pontos de teste"). A tarefa que o traz acrescenta o `pnpm test` à
"Verificação completa" do `apps/web/AGENTS.md` e aos "Comandos" dele. A contagem de grafemas, nas
duas pontas, entra no mesmo nível.

**Web, testes de ponta a ponta com o Playwright,** no mesmo fluxo e nas mesmas condições da F01
(`apps/web/AGENTS.md`, "Testes de ponta a ponta"). Cobrem:

- Entrar sem `?voltar=` cai no `#geral`, e `/` redireciona para ele.
- A barra lateral lista os Canais, com a linha do Canal aberto selecionada.
- Criar um Canal pelo diálogo: a prévia do nome normalizado, o sucesso, que leva ao Canal novo, já
  na barra lateral, o nome já usado e o nome vazio.
- O Canal vazio mostra o criador e a data.
- Enviar uma Mensagem: ela aparece no fim, com o nome e o horário, e o campo fica vazio.
- A Mensagem com várias linhas, enviada pelo Shift+Enter, e o link que abre numa aba nova.
- Um texto com marcação HTML aparece como texto.
- A falha no envio, com a rota do BFF bloqueada pelo `page.route`: a Mensagem fica `failed`, e
  "Tentar de novo", com a rota liberada, deixa uma Mensagem só.
- A Mensagem de outra Pessoa, gravada no banco pela fixture, aparece depois de reabrir o Canal.
- O endereço de um Canal que não existe e um id malformado mostram o Canal não encontrado, com o
  link para o `#geral`.
- O fluxo inteiro só pelo teclado: a barra lateral, o diálogo e o envio.
- A checagem de acessibilidade com `@axe-core/playwright` no Canal com Mensagens, no Canal vazio,
  no diálogo "Criar Canal" e no Canal não encontrado, sem violações.

**Base dos testes da web, que a F02 estende:**

- A fixture `person` passa a gravar a participação da Pessoa em todos os Canais públicos, como o
  `create` faz, porque grava direto no banco e não passa pelo service.
- Uma fixture nova, `channel`, cria um Canal público com nome único, com a participação de todas
  as Pessoas, e o apaga ao fim, levando as Mensagens e as participações.
- Uma fixture para gravar uma Mensagem de outra Pessoa direto no banco.
- Os testes de Mensagem escrevem só no Canal da própria fixture, nunca no `#geral`, porque a
  suíte roda em paralelo no banco `chat`. Os testes de criar Canal apagam o que criaram.
- O plano de testes e2e da F02 aponta para esta spec e é dono dos passos de cada cenário.

**Verificações do agente com o `playwright-cli`**, registradas na pasta da tarefa da tela:
validação visual em 1440 × 900, nos temas claro e escuro, comparada com os frames do Pencil
(`docs/design-system.md`, "Validação visual").

**Roteiro manual**, registrado na pasta da tarefa da migração: rodar a migração no banco `chat` de
desenvolvimento com Pessoas já criadas e conferir que todas passam a participar do `#geral`.

**Exemplos anteriores:**
- os `test/*.e2e-spec.ts` da API, com o `createTestApp()` e os atalhos de `authRoutes`;
- o `accounts-command.int-spec.ts`;
- a função de derivação do @usuário e o teste dela, como modelo da normalização;
- os cenários de `e2e/01-entrar-e-sair/` e as fixtures `person` e `loggedInPage`.

## Fora de escopo

- Tudo o que o PRD lista em "O que não é objetivo".
- O WebSocket, os eventos de Mensagem e de Canal novo e o SWR no cliente (F05).
- Os tipos `private_channel` e `direct` em uso, os convites e a Conversa direta (F03 e F04). A
  tabela e o 404 já nascem prontos para eles.
- O comando de canais.
- Bots como autor de Mensagem (F10).

## Observações

- **LLD:** as tarefas atualizam o LLD pela skill `lld`, no modo atualizar:
  - os módulos `conversations` e `messages` entram em "Módulos da API do chat";
  - o Vitest entra na tabela de bibliotecas, na seção "Estrutura do código";
  - as tabelas passam a `existe` em "Dados" quando a migração entra.
- **HLD:** não muda. A seção 7 já lista os Canais, os membros e as Conversas diretas como conteúdo
  do Banco do chat.
- **Os frames são citados pelo nome:** os ids mudam quando um frame é recriado.
- **Recorte em tarefas:** fica nos `tarefa.md` da pasta da funcionalidade, a partir desta spec,
  com as tarefas numeradas na ordem de dependência (`AGENTS.md` da raiz, "Planejamento"). A de
  design vem primeiro.
