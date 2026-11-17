# LLD — Full Cycle Chat

2026-11-15 · Luiz Carlos · Status: rascunho · HLD: [hld.md](hld.md)

**Onde mora cada fato**

| Fato | Dono |
| --- | --- |
| Arquitetura, contêineres, integrações e motivos | [HLD](hld.md) |
| Decisões com porquê | `docs/adr/`, com o índice na seção "Decisões" deste documento e do HLD |
| Escopo e público | [Product brief](product-brief.md) |
| Vocabulário | `GLOSSARY.md` na raiz |
| Linguagem visual (cores, componentes, microtexto) | [Figma](https://www.figma.com/design/plW17JDOoRHydUJIIi2u87/slack) |
| Contrato REST da API do chat | `apps/chat-api/openapi.json`, gerado pelo `@nestjs/swagger` (`pnpm openapi`) |
| Contrato REST do Serviço de agentes | `apps/agents/openapi.json`, gerado pelo FastAPI (planejado) |
| Catálogo de códigos de erro | Os snapshots OpenAPI, como enum na resposta de erro de cada rota (planejado) |
| Eventos do WebSocket | Tipos TypeScript em `packages/chat-events/` (planejado) |
| Schema do Banco do chat | `apps/chat-api/migrations/`, migrações do TypeORM |
| Schema do Banco dos agentes | A definir |
| Schema do Banco de negócio | Script de carga em `apps/agents/scripts/` (planejado) |
| Schema das variáveis de ambiente | Nos projetos TypeScript, o schema `zod` do módulo de configuração de cada um; no `agents`, a definir |
| Práticas e comandos | `apps/*/AGENTS.md`, um por app, apontados pelo `AGENTS.md` da raiz (planejado) |

Os snapshots OpenAPI ficam gravados no repositório, e a CI falha quando o código muda o contrato
sem atualizar o snapshot.

## 1. Estrutura do código

Um repositório com três aplicações implantadas separadamente (HLD, seção 5) e um pacote de tipos
compartilhado. `web`, `chat-api` e `chat-events` são projetos pnpm independentes, cada um com o
seu lockfile, sem workspace ([ADR 0017](adr/0017-projetos-pnpm-independentes.md)); `chat-events`
entra em `web` e em `chat-api` como dependência `file:../../packages/chat-events`, e uma mudança
nele exige reinstalar nos dois projetos. O projeto `agents` é gerenciado pelo uv.

```
apps/
  web/            Frontend/BFF (Next.js)                              existe
  chat-api/       API do chat (NestJS): REST, WebSocket e o comando   existe
                  de contas e permissões (HLD, seção 2)
    migrations/   migrações do Banco do chat                          existe
  agents/         Serviço de agentes e Worker (Python + ADK),         planejada
                  dois processos do mesmo projeto
    scripts/      script de carga do Banco de negócio                 planejada
packages/
  chat-events/    tipos dos eventos do WebSocket, usados por          planejada
                  chat-api e web
docs/             HLD, LLD, ADRs, brief
```

| Papel | Escolha | Por quê |
| --- | --- | --- |
| Frontend/BFF | Next.js com App Router | Next.js: HLD, seção 5 ([ADR 0002](adr/0002-next-bff-websocket-direto.md)); App Router: a definir |
| Leituras no cliente que o tempo real altera | SWR | A definir |
| Tempo real, no servidor e no cliente | Socket.IO | [ADR 0019](adr/0019-socket-io-tempo-real.md) |
| API do chat | NestJS | HLD, seção 5 |
| ORM e migrações do Banco do chat | TypeORM | [ADR 0018](adr/0018-typeorm-api-do-chat.md) |
| Snapshot do contrato da API do chat | `@nestjs/swagger` | Gera o OpenAPI a partir do código |
| Hash de senha | Argon2id, pelo `@node-rs/argon2` | Argon2id: primeira recomendação da OWASP para senhas; `@node-rs/argon2`: binários prontos, sem compilar no contêiner |
| Mutações do navegador ao BFF | Server Actions | O Next confere a origem de cada Server Action, o que dispensa token CSRF ("Segurança") |
| Leitura da senha no comando de contas | `@inquirer/password` | Lê do terminal sem eco |
| Leitura do cookie de sessão na API do chat | `cookie` (só o `parse`, no guard) | Só o guard lê o cookie; um middleware global seria trabalho em toda requisição sem uso |
| Validação de entrada na API do chat | `class-validator` e `class-transformer`, no `ValidationPipe` global | Caminho padrão do Nest, e o plugin do `@nestjs/swagger` lê os DTOs para gerar o contrato; o `zod` fica só na configuração |
| Testes de ponta a ponta da web | Playwright (`@playwright/test`), só pelo navegador; sem component testing, sem a fixture `request` e, por enquanto, sem `@next/playwright` | O Next recomenda ponta a ponta para Server Components assíncronos, e o Playwright é um dos guias oficiais dele. Roda em modo headless no contêiner sem tela, guarda o `trace` na falha e tem a skill `playwright-cli`, com que o agente planeja, gera e corrige os testes. Descartado: Cypress, sem skill no projeto e com uma CLI menos ligada ao fluxo do agente. O `instant()` do `@next/playwright` entra quando uma funcionalidade precisar provar o estado logo após uma navegação |
| Gerenciador dos projetos TypeScript | pnpm, um projeto por pasta, sem workspace | [ADR 0017](adr/0017-projetos-pnpm-independentes.md) |
| Agentes | Python + Google ADK | [ADR 0003](adr/0003-agentes-python-google-adk.md) |
| HTTP do Serviço de agentes | FastAPI próprio, com as rotas chamando o `Runner` do ADK | A definir |
| Gerenciador do projeto Python | uv | A definir |
| Fila de pedidos demorados | A definir | — |
| Acesso ao modelo, trocável por configuração (HLD, seção 2) | A definir | — |
| Geração do PDF | A definir | — |
| Acesso ao Banco dos agentes e migrações | A definir | — |
| Validação das variáveis de ambiente | `zod` nos projetos TypeScript (no `validate` do `@nestjs/config`, na API do chat); no `agents`, a definir | Um schema só por projeto, que também dá os tipos da configuração |
| Parser da conferência de somente leitura | A definir | — |
| Log estruturado | `nestjs-pino` na API do chat; na web e no `agents`, a definir | Log em JSON com contexto por requisição |

## 2. Componentes e dependências

Os tipos de peça de cada aplicação, o que cada tipo pode chamar e o diagrama das dependências
permitidas estão a definir, assim como os módulos de domínio do projeto `agents` e do projeto
`web`. O que já vale vem do HLD: o BFF dispara o agente
([ADR 0009](adr/0009-bff-dispara-agente.md)), o agente grava pela API do chat como bot
([ADR 0010](adr/0010-agente-grava-como-bot.md)) e o Worker nunca chama o modelo (HLD, seção 5).

### Módulos da API do chat

Os módulos das outras funcionalidades entram com elas.

| Módulo | Responsabilidade | Situação |
| --- | --- | --- |
| `people` | Pessoas: criar, buscar por e-mail, trocar a senha | planejada |
| `sessions` | Login, limite de tentativas, validação, renovação e revogação da Sessão ("Sessão e login"); o guard global que exige Sessão, com o decorator `@Public()` nas rotas abertas | planejada |
| `accounts` | O comando de contas, fora do HTTP | planejada |

### Integrações externas

Situação de todas: `planejada`.

**Armazenamento de objetos (S3)** — usado pelo Worker (gravar) e pela API do chat (URL).

| Operação | Recebe | Devolve | Garante |
| --- | --- | --- | --- |
| Gravar PDF | Chave e arquivo | Nada | Regravar a mesma chave substitui o arquivo; uma nova tentativa do Worker não duplica |
| Gerar URL de download | Chave e validade | URL assinada | Vencida a validade (`validade da URL do PDF`), a URL recusa |

**Fila de pedidos demorados** — o Serviço de agentes enfileira e o Worker consome.

| Operação | Recebe | Devolve | Garante |
| --- | --- | --- | --- |
| Enfileirar | Identificador de pedido e consulta já conferida | Nada | Enfileirar duas vezes o mesmo identificador gera uma tarefa só |
| Consumir | — | Uma tarefa ao Worker | Se o Worker falha, a tarefa volta à fila até `tentativas do Worker` |

**Eventos por pessoa (Redis)** — usado pela API do chat para a reconexão (HLD 6.2).

| Operação | Recebe | Devolve | Garante |
| --- | --- | --- | --- |
| Guardar evento | Pessoa e evento | Identificador crescente por pessoa | A ordem dos identificadores é a ordem dos eventos daquela pessoa |
| Ler desde | Pessoa e último identificador confirmado | Os eventos seguintes, ou "perdido" | "Perdido" quando o identificador já saiu da `retenção dos eventos de reconexão`; o cliente então recarrega pelo histórico |

**Contadores (Redis)** — usados pelo Serviço de agentes (HLD 6.3).

| Operação | Recebe | Devolve | Garante |
| --- | --- | --- | --- |
| Conferir e contar pedido | Pessoa | Permitido ou negado | Nega acima do `limite de pedidos por pessoa` |
| Somar custo | Pedido e custo | Se o teto foi atingido | Compara com o `teto de custo por pedido` |

Com o Redis fora, as operações de contadores falham e o pedido é recusado (HLD, seção 8, "Erros,
novas tentativas e idempotência").

## 3. Conceitos transversais de implementação

### Segurança

- **Cookie de sessão:** nome `session`, com `httpOnly`, `Secure`, `SameSite=Lax`, `Path=/` e
  `Max-Age` igual ao `Max-Age do cookie de sessão`. Vale para os subdomínios pelo `Domain` de
  `SESSION_COOKIE_DOMAIN` (HLD 6.1). O cookie dura mais que a Sessão de propósito: quem decide se
  a Sessão vale é só o servidor ("Sessão e login"), e um cookie de Sessão vencida leva a 401. Quem
  grava e apaga o cookie é o BFF. O `Secure` vale também em `http://localhost`, que os navegadores
  tratam como contexto seguro.
- **CSRF:** as mutações do navegador são Server Actions, e o Next recusa a que chega com `Origin`
  diferente do host. Com o `SameSite=Lax`, isso dispensa token CSRF. O REST da API do chat não fica
  exposto ao navegador (HLD, seção 5). A conferência de origem do WebSocket fica na API do chat
  (HLD 6.1).
- **Identificador de sessão:** token de 32 bytes aleatórios em base64url, entregue só na resposta
  do login. O Banco do chat guarda apenas o SHA-256 dele, para quem lê o banco não conseguir se
  passar por ninguém.
- **Senha:** guardada como hash Argon2id, com 19 MiB, 2 iterações e paralelismo 1 (parâmetros da
  OWASP). Para e-mail inexistente, a API confere a senha contra um hash fixo, gerado na subida,
  para o tempo de resposta não revelar se a conta existe.
- **Limite de tentativas de login:** a chave é só o e-mail normalizado, exista ele ou não. O IP
  fica de fora, porque a origem dele atrás do proxy depende da PaaS (HLD, seção 12)
  ([ADR 0023](adr/0023-limite-de-login-por-email.md)). A regra está em "Sessão e login".
- **Participação em canal privado e conversa direta:** o lugar no código onde a API do chat a
  confere está a definir.
- **Credenciais de bot e de serviço:** a forma (um segredo por processo ou por agente) está a
  definir. Toda ação de bot leva o identificador de pedido
  ([ADR 0011](adr/0011-identificador-de-pedido.md)).
- **Dados de negócio no tempo real:** uma mensagem marcada "dados de negócio" é emitida pelo
  WebSocket pessoa a pessoa. Quem tem permissão de dados recebe o evento com o conteúdo; os outros
  membros recebem o evento com a versão bloqueada. O evento guardado nos eventos de reconexão
  segue a mesma regra, por pessoa. Mensagens sem a marca saem num evento só para a conversa
  ([ADR 0020](adr/0020-dados-de-negocio-pessoa-a-pessoa.md); depende de mudança no HLD). Se uma
  função única monta a mensagem para cada destinatário (histórico, REST, evento e notificação)
  está a definir.

### Concorrência e idempotência

- **Envio de mensagem:** unicidade em (autor, identificador gerado no cliente). A inserção tolera
  o conflito: se o identificador já existe, a API devolve a mensagem já gravada, com o mesmo
  status de sucesso, e não gera de novo menções, notificações, contadores nem eventos.
- **Ação de bot:** unicidade em (identificador de pedido, tipo de ação). Tipos: resposta, pergunta
  ao usuário, aviso de início, entrega do PDF, criação de tarefa. A repetição devolve o que já foi
  gravado, sem nova mensagem, tarefa ou notificação.
- **Contadores de não lidas e de menções:** um registro por pessoa e conversa, somado de forma
  atômica na transação da mensagem (incremento no próprio `UPDATE`, sem ler antes) e zerado quando
  a pessoa lê ([ADR 0021](adr/0021-contadores-gravados.md); depende de mudança no HLD).
- **Última leitura:** só avança. A atualização é condicional: grava só se a nova posição for
  posterior à gravada; uma posição igual ou anterior, vinda de uma aba atrasada, não muda nada e
  não altera os contadores.

### Transações

O que precisa ser atômico é do HLD (seção 7, "Regras que pesam no desenho"): a mensagem com as
menções, as notificações e os contadores; a tarefa com a notificação dela. O evento só sai depois
do commit. Onde a transação começa, como passa de um módulo a outro e como o evento é publicado
depois do commit (publicação direta ou tabela de saída) estão a definir.

### Erros

- Corpo de erro nas três APIs (BFF, API do chat, Serviço de agentes): `application/problem+json`
  (RFC 9457), com o campo `code`, estável, e o `detail`, que é para pessoas e não traz detalhe
  interno. Um erro inesperado responde 500, sem mensagem interna nem stack trace.
- Campos do corpo: `type` (sempre `about:blank`), `title` (a frase do status), `status`, `code` e
  `detail`. Só no `validation_failed` entra também `errors`, uma lista de `{ field, message }`.
- Códigos que valem para qualquer rota da API do chat: `validation_failed` (400), `malformed_body`
  (400, corpo que não é JSON), `payload_too_large` (413), `not_found` (404, rota inexistente),
  `unauthenticated` (401), `request_rejected` e `internal_error` (500).
- Um `HttpException` 4xx lançado pelo Nest, pelo Express ou por uma biblioteca mantém o status
  dele. Os que têm código próprio (400, 401, 404 e 413) saem com ele, e os outros 4xx, como 403,
  405 e 415, saem como `request_rejected`. Só o que não é `HttpException` 4xx vira
  `internal_error`, com log de erro.
- O catálogo de códigos fica nos snapshots OpenAPI, como enum na resposta de erro de cada rota.
- Na API do chat, o service e o guard lançam erros de domínio sem status HTTP, e só o exception
  filter global os traduz em resposta. O mapa de `code` para status mora nele. As peças estão na
  rule de erros da API (`.claude/rules/nest-api-errors.md`). Nos outros dois projetos, quem
  traduz exceção em resposta está a definir.
- **Mensagem gravada, mas o Serviço de agentes não recebeu o pedido** (HLD 6.3): o BFF responde
  sucesso, com a mensagem gravada e um campo que diz que o agente não recebeu o pedido. A tela
  mostra a mensagem enviada e um aviso de erro do agente ao lado.

### Logs

A regra do HLD vale para todos os projetos: logs estruturados, sem conteúdo de mensagens e sem
resultado de consultas (HLD, seção 8, "Observabilidade").

Na API do chat:

- Cada requisição leva um `request_id`, que serve de campo de correlação.
- O corpo da requisição nunca vai para o log.
- Os campos `password`, `current_password`, `new_password`, `token`, `authorization` e `cookie`
  são mascarados.
- O e-mail de uma tentativa de login bloqueada vai para o log como hash.

A biblioteca e os campos de correlação dos outros projetos, e o resto da lista do que nunca vai
para o log, estão a definir.

| Nível | Quando |
| --- | --- |
| info | Fim de cada requisição e de cada pedido a agente, com tempo de resposta e custo como campos |
| warn | Resposta barrada pelo lastro; limite de pedidos ou teto de custo atingido; tentativa de login bloqueada |
| error | Falha do modelo; tentativas do Worker esgotadas; exceção inesperada |

### Configuração

- Cada projeto tem um módulo de configuração só, que lê e valida as variáveis uma vez na subida.
  Nenhum outro arquivo lê `process.env` ou `os.environ`; as peças recebem a configuração já
  tipada.
- Faltou uma variável obrigatória: o processo falha na subida, com o nome da variável na
  mensagem, e nunca no primeiro uso. Assim, a conferência de saúde da PaaS barra a versão nova e
  mantém a anterior (HLD, seção 9).
- Cada projeto tem um `.env.example` gravado no repositório, com todas as variáveis e valores
  falsos; o `.env` real fica no `.gitignore`.
- A biblioteca de validação está na seção 1; a lista das variáveis fica em "Valores e
  configuração".

## 4. Dados

**Convenções** (tabelas nossas do Banco do chat e do Banco dos agentes; as tabelas de sessão do
ADK seguem o ADK):

- Nomes em `snake_case`, tabelas no plural (`messages`, `channel_members`); o TypeORM usa uma
  estratégia de nomes que converte os nomes do código.
- Id em UUID v7, gerado na aplicação ([ADR 0022](adr/0022-uuid-v7.md)).
- Datas em `timestamptz`, sempre em UTC, com `created_at` e `updated_at` em toda tabela. A
  conversão para o fuso de quem pediu acontece só na borda: na tela e no recorte "hoje" do agente.
- Exclusão física. A exceção é a mensagem: apagar zera o conteúdo e grava `deleted_at`, e a linha
  fica para mostrar "mensagem apagada" (HLD, seção 7).

O diagrama de entidades e relações está a definir. As unicidades e os contadores que as regras já
exigem estão em "Conceitos transversais de implementação", seção "Concorrência e idempotência".

| Banco | Entidade (HLD, seção 7) | Situação |
| --- | --- | --- |
| Chat | Pessoas (perfil, papel de administrador, permissão de dados) | planejada; as colunas da F01 estão na spec da F01, e o perfil, o papel e a permissão entram com as F09, F10 e F13 |
| Chat | Sessões | planejada; forma na spec da F01 |
| Chat | Tentativas de login | planejada; forma na spec da F01 |
| Chat | Canais e membros | a detalhar |
| Chat | Conversas diretas | a detalhar |
| Chat | Mensagens (autor pessoa ou bot, citação, marca "dados de negócio") | a detalhar |
| Chat | Menções | a detalhar |
| Chat | Última leitura e contadores por pessoa e conversa | a detalhar |
| Chat | Notificações | a detalhar |
| Chat | Tarefas | a detalhar |
| Chat | Pedidos aos agentes e ações de bot | a detalhar |
| Chat | Perguntas pendentes | a detalhar |
| Chat | Referência ao PDF de uma mensagem | a detalhar |
| Agentes | Registro de agentes conectados | a detalhar |
| Agentes | Sessões do ADK | criadas pelo ADK |
| Negócio | Dados de vendas | dono: script de carga |

Regras de dados de Pessoas, Sessões e Tentativas de login que o schema não mostra: uma linha de
tentativas por e-mail normalizado, sem ligação com a Pessoa, porque o e-mail pode não existir; o
token da Sessão guardado só como hash; e apagar a Pessoa apaga as Sessões dela. O resto está em
"Estados e regras", seção "Sessão e login".

## 5. Interfaces

**Convenções**

- Prefixo `/v1` na API do chat e no Serviço de agentes; `/api`, sem versão, no BFF, porque o
  Frontend e o BFF são implantados juntos. Uma mudança que quebra entre serviços sai como nova
  versão do prefixo, em duas implantações.
- Autenticação: o navegador fala com o BFF por cookie de sessão. O BFF repassa esse mesmo cookie à
  API do chat em cada chamada REST, e o WebSocket o recebe direto do navegador; os dois passam pela
  mesma verificação de Sessão. Toda rota da API do chat exige Sessão, salvo as marcadas
  `@Public()`. O BFF chama o Serviço de agentes com a credencial de serviço; os bots chamam a API
  do chat com a credencial de bot e o identificador de pedido (forma em "Segurança").
- Campos do JSON em `snake_case`, nas três APIs.
- Paginação: a definir.
- Erros: "Conceitos transversais de implementação", seção "Erros".
- Eventos do WebSocket: tipos em `packages/chat-events/`, consumidos por `chat-api` e `web`.

**Índice das rotas**

O índice por domínio (BFF; API do chat, para o BFF e para os bots; Serviço de agentes) e a lista
de eventos do WebSocket estão a definir. O que já está decidido:

| Método e caminho | Situação | Comportamento |
| --- | --- | --- |
| Envio de mensagem no BFF (caminho a definir) | a detalhar | Mensagem gravada e agente sem receber o pedido: "Conceitos transversais de implementação", seção "Erros" |

**API do chat: Sessão e Pessoa** (para o BFF). Entrada, saída e erros estão na spec da F01, até
o snapshot recebê-los.

| Método e caminho | Situação | Comportamento |
| --- | --- | --- |
| `POST /v1/sessions` | planejada | Entrar; única rota `@Public()` da F01 ("Sessão e login") |
| `DELETE /v1/sessions/current` | planejada | Sair ("Sessão e login") |
| `GET /v1/me` | planejada | A Pessoa da Sessão |
| `PUT /v1/me/password` | planejada | Trocar a senha ("Sessão e login") |

## 6. Estados e regras

As subseções que faltam nesta parte (pedido ao agente, pergunta pendente, mensagem, consulta a
dados de negócio, limite de pedidos e teto de custo) e as regras de cada uma estão a definir. As
regras já decididas ficam abaixo.

### 6.1 Tarefa

Dois estados: aberta e concluída (HLD 6.6).

- Só o responsável conclui e reabre a tarefa. Outra pessoa, inclusive quem delegou, recebe um
  erro do catálogo.
- Ao concluir ou reabrir, quem delegou é avisado (HLD 6.6).
- Concluir uma tarefa já concluída, ou reabrir uma aberta: a definir.

### 6.2 Sessão e login

Uma Sessão vale enquanto a linha existe e o `expires_at` está no futuro; não há outro estado.

**Login**

1. A entrada é validada antes de tudo: um e-mail em formato válido, dentro do `tamanho do
   e-mail`, e uma senha não vazia, dentro do teto do `tamanho da senha`. A entrada inválida
   responde `validation_failed` e não conta como falha.
2. O e-mail é normalizado com `trim` e minúsculas. A mesma regra vale no comando de contas.
3. Com o e-mail bloqueado, a resposta é `too_many_attempts`, com o cabeçalho `Retry-After` em
   segundos até o fim do bloqueio. A tentativa não conta como falha nem prolonga o bloqueio.
4. A API confere a senha (hash e e-mail inexistente: "Segurança").
5. **Senha errada:** a API registra a falha e responde `invalid_credentials`, ou
   `too_many_attempts` se a falha completou as `tentativas de login`.
6. **Senha certa:** a API apaga as falhas do e-mail e cria a Sessão, com `last_used_at` = agora e
   `expires_at` = agora + `duração da sessão`.

**Registro das falhas**

Uma linha de `login_attempts` por e-mail, atualizada numa operação atômica (`INSERT … ON CONFLICT
DO UPDATE`), para duas falhas simultâneas não se perderem:

- Se a janela começou antes de `janela das tentativas de login`, a contagem volta a 1 e a janela
  recomeça agora.
- Senão, a contagem soma 1.
- Ao chegar a `tentativas de login`, o bloqueio vale até agora + `duração do bloqueio de login`, e
  a contagem e a janela zeram.

Com uma linha por e-mail, o bloqueio dura exatamente o prazo a partir da falha que o causou. Numa
contagem por falha, a falha mais antiga sairia da janela antes do fim do bloqueio, e o bloqueio
terminaria cedo.

**Validação de cada requisição**

1. O guard procura a Sessão pelo SHA-256 do token do cookie de sessão.
2. Sem cookie, com token desconhecido ou com o `expires_at` no passado, a resposta é
   `unauthenticated`, sem distinguir os casos. Uma Sessão vencida é apagada nessa hora.
3. Se o `last_used_at` tem `intervalo de renovação da sessão` ou mais, a API grava `last_used_at` =
   agora e `expires_at` = agora + `duração da sessão`. Assim, a renovação grava no máximo uma vez
   por intervalo, e o vencimento erra em no máximo um intervalo.

**Sair, trocar a senha e revogar**

- **Sair** apaga a Sessão da requisição. As outras Sessões da Pessoa continuam.
- **Trocar a senha** exige a senha atual. Uma senha atual errada conta como falha do e-mail da
  Pessoa, no mesmo registro do login, e com o e-mail bloqueado a troca responde
  `too_many_attempts`. A senha nova respeita o `tamanho da senha` e tem de ser diferente da atual.
  Na mesma transação, a API grava o hash novo e apaga as outras Sessões da Pessoa; a atual
  continua.
- **No comando de contas**, `reset-password` troca a senha e apaga todas as Sessões da Pessoa, e
  `revoke-sessions` apaga todas. A Sessão revogada é recusada na próxima requisição.

**@usuário**

- Respeita o `tamanho do @usuário`, com minúsculas, dígitos, `.`, `_` e `-`, e começa por letra. É
  guardado sem o `@` e é único.
- **Derivado do e-mail**, quando o comando de contas não recebe um. A parte antes do `@` passa a
  minúsculas, perde os acentos e tem trocado por `-` todo caractere fora do conjunto. Ganha o
  prefixo `p` se não começar por letra, é completada com `-` até o mínimo e é cortada no máximo.
  Se já existir, ganha o primeiro sufixo numérico livre (`ana`, `ana2`), com o corte refeito.
- **Informado no comando e inválido ou já usado:** o comando recusa.
- A reserva do @usuário de um Bot entra com os Bots.

## 7. Processos de segundo plano

| Tarefa | Disparo | O que faz | Na falha | Situação |
| --- | --- | --- | --- | --- |
| Relatório em PDF (Worker) | Pedido na fila (HLD 6.5) | HLD 6.5 | Nova tentativa até `tentativas do Worker`; esgotadas, grava "não consegui" (HLD 6.5) | a detalhar |
| Apagar Sessões vencidas | O Operador, à mão, pelo `purge-expired-sessions` do comando de contas; não há agendamento | Apaga as Sessões com `expires_at` no passado e diz quantas eram. Rodar de novo não muda nada | O comando sai com erro e pode ser rodado de novo | planejada |

As Sessões vencidas também são apagadas quando uma requisição as encontra ("Sessão e login"). A
idempotência da tarefa do PDF (chave no S3 e entrega única) e as outras rotinas (retenção dos
PDFs, perguntas pendentes vencidas) estão a definir.

## 8. Cliente

**Telas**

| Rota | Acesso | Lê | Ações | Situação |
| --- | --- | --- | --- | --- |
| `/entrar` | Público; quem tem Sessão vai para `/` | — | Entrar com e-mail e senha | planejada |
| `/` | Sessão | A Pessoa da Sessão (`GET /v1/me`), na casca vazia | Trocar a senha (diálogo pelo menu do usuário); Sair | planejada |
| A definir | Sessão | Histórico da conversa | Enviar, editar, apagar, citar; "digitando"; botões de resposta pronta | a detalhar |
| A definir (lateral) | Sessão | Conversas, com não lidas e menções | Abrir conversa | a detalhar |
| A definir | Sessão | Atividade: Menções, DMs, Tarefas | Abrir a mensagem; concluir e reabrir tarefa | a detalhar |
| A definir | Sessão | Perfil próprio e de outras pessoas | Editar o próprio perfil e a presença | a detalhar |
| A definir | Sessão | Busca de pessoas | Abrir conversa direta | a detalhar |
| A definir | Sessão | — | Criar canal; convidar para canal privado | a detalhar |
| A definir | Sessão; conectar e desconectar só para administrador | Agentes e estado de conexão | Conectar e desconectar agente | a detalhar |

**Leituras e tempo real.** A página carrega pelos Server Components. No cliente, o SWR guarda as
leituras que o tempo real altera (mensagens, não lidas, notificações), e cada evento do WebSocket
atualiza esse cache direto, sem nova requisição.

**Sessão no cliente.**

- O `proxy` do Next (o antigo `middleware`, renomeado no Next 16) confere só se o cookie de sessão
  existe; sem ele, manda para
  `/entrar?voltar=<caminho>`. A validação de verdade é da API do chat.
- A ação Entrar só segue um `voltar` que começa com `/` e não com `//` nem `/\`, para não virar um
  redirecionamento aberto. Qualquer outro valor leva a `/`.
- Qualquer 401 vindo do BFF apaga o cookie e manda para "Entrar", com o `voltar` da página atual.
  Numa Server Action, ela mesma apaga o cookie. Ao renderizar, um Server Component não grava
  cookie, então redireciona para `GET /api/sessao/expirada?voltar=…`, um Route Handler do BFF que
  apaga o cookie e manda para "Entrar".
- Um 401 no WebSocket fecha a conexão e manda para "Entrar".
- Sair apaga o cookie mesmo quando a API do chat falha por rede ou com um 5xx. A Sessão fica no
  banco até vencer ou ser revogada.
- As páginas com Sessão são dinâmicas, porque leem o cookie, e não ficam em cache. Voltar pelo
  histórico depois de Sair não mostra conteúdo protegido.

**Notificação do navegador.**

- A permissão do navegador é pedida só quando a pessoa liga a opção (brief, item 6 do escopo).
- A notificação sai do evento do WebSocket, com o chat aberto em alguma aba (HLD, seção 4).
- O clique abre a conversa posicionada na mensagem.

**Reação a erros da API.**

- **401:** "Sessão no cliente".
- **5xx ou falha de rede ao carregar a casca:** a tela mostra a porta de erro, com "Tentar de
  novo".
- **5xx ou falha de rede ao entrar:** o formulário mostra que não foi possível entrar agora.
- **Mensagem gravada com erro do agente:** "Conceitos transversais de implementação", seção
  "Erros".

## 9. Valores e configuração

**Valores de regra**

| Nome | Valor | Onde vale | Constante ou variável |
| --- | --- | --- | --- |
| Limite de pedidos por pessoa | 10 por minuto (brief, RNF "Custo") | Serviço de agentes | A definir |
| Teto de custo por pedido | A definir | Serviço de agentes | A definir |
| Tentativas do Worker | A definir | Worker | A definir |
| Validade da URL do PDF | A definir | API do chat | A definir |
| Duração da sessão | 30 dias desde a última atividade | API do chat | Constante |
| Intervalo de renovação da sessão | 24 h | API do chat | Constante |
| Tentativas de login | 5 falhas, por e-mail | API do chat | Constante |
| Janela das tentativas de login | 15 min | API do chat | Constante |
| Duração do bloqueio de login | 15 min | API do chat | Constante |
| Tamanho da senha | De 8 a 128 caracteres; o teto barra o custo do hash de uma entrada enorme | API do chat | Constante |
| Tamanho do e-mail | Até 254 caracteres, o teto de um endereço de e-mail | API do chat | Constante |
| Tamanho do @usuário | De 3 a 30 caracteres | API do chat | Constante |
| Tamanho do nome | De 1 a 80 caracteres, sem espaços nas pontas | API do chat | Constante |
| Max-Age do cookie de sessão | 400 dias, o teto dos navegadores | BFF | Constante |
| Validade do identificador de pedido | A definir | API do chat | A definir |
| Retenção dos eventos de reconexão | A definir | API do chat (Redis) | A definir |
| Tempo limite da consulta ao Banco de negócio | A definir | Serviço de agentes e Worker | A definir |
| Tamanho da página do histórico | A definir | API do chat | A definir |

**Variáveis de ambiente**

O que cada contêiner recebe está no HLD, seção 8, "Configuração e segredos". Tipo,
obrigatoriedade e padrão são do schema de cada projeto (seção 1). Estas entram com a F01; as
outras chegam com as funcionalidades que as usam.

| Variável | Projeto | Significado | Origem em produção |
| --- | --- | --- | --- |
| `DATABASE_URL` | API do chat | Conexão com o Banco do chat | Segredo da PaaS |
| `PORT` | API do chat | Porta HTTP | Plataforma |
| `LOG_LEVEL` | API do chat | Nível mínimo do log | Variável da PaaS |
| `CHAT_API_URL` | Web | Endereço interno da API do chat, usado pelo BFF | Variável da PaaS |
| `SESSION_COOKIE_DOMAIN` | Web | `Domain` do cookie de sessão; vazio deixa o cookie só de host | Variável da PaaS |

## 10. Ambiente de desenvolvimento

Tudo roda em contêineres, pelo `compose.yaml` da raiz (projeto `fullcycle-slack-ia`). O que
substitui cada serviço de produção segue o HLD, seção 9, "Implantação e ambientes".

| Serviço | Imagem | Porta no host | Papel |
| --- | --- | --- | --- |
| `web` | `apps/web/Dockerfile.dev` (Node 26, pnpm 11) | 3000 | Frontend/BFF |
| `chat-api` | `apps/chat-api/Dockerfile.dev` (Node 26, pnpm 11) | 3001 (3000 no contêiner) | API do chat |
| `postgres` | `postgres:18` | 5432 | Banco do chat, dos agentes e de negócio |
| `s3` | `chrislusf/seaweedfs:4.52` (`weed mini`) | 8333 (só ela) | Substituto do armazenamento compatível com S3, com o bucket `reports` |

Entram depois: o Redis, quando o primeiro uso dele for implementado, e os serviços `agents` e
`worker`, quando `apps/agents` existir.

O `postgres` e o `s3` têm healthcheck; o `chat-api` só sobe com os dois saudáveis, e o `web`
sobe depois do `chat-api`. Os dados ficam nos volumes nomeados `postgres-data` e `s3-data`;
`docker compose down -v` zera os dois e faz o script do Postgres rodar de novo.

**Contêineres dos apps**

- Imagem `node:26` (Debian completo, com compilador para os bindings nativos). O Node 26 não
  traz corepack: o pnpm entra por `npm install -g`, na versão de um `ARG` igual ao
  `packageManager` do projeto; mudou um, muda o outro.
- A imagem não tem dependências. O `CMD` roda `pnpm install --frozen-lockfile` e mantém o
  contêiner de pé; o app sobe na mão: `docker compose exec chat-api pnpm start:dev` e
  `docker compose exec web pnpm dev`. Se o install falha, o contêiner continua de pé e o erro
  fica em `docker compose logs`.
- O repositório inteiro é montado em `/home/node/app`, para o `file:../../packages/chat-events`
  resolver igual dentro e fora. O `node_modules` fica no disco do host, visível para o editor.
- Os contêineres rodam como `node` (uid 1000), o mesmo usuário do host no WSL.
- O store do pnpm fica em `.pnpm-store/` na raiz, ignorado pelo git e compartilhado pelos dois
  apps. A versão do pnpm é a do `packageManager` de cada projeto, igual nos dois.
- Bindings nativos são compilados no contêiner: o Node do host precisa ser o mesmo major (26)
  para rodar ferramentas pelo host sobre o mesmo `node_modules`. O `.nvmrc` da raiz fixa o 26.

**Postgres.** O script `docker/postgres/init/01-create-databases.sh` roda só com o volume vazio
e cria os bancos `chat`, `agents` e `business`, cada um com um usuário dono de mesmo nome, e o
usuário `business_readonly`, que só conecta no `business` e só lê, inclusive as tabelas que o
script de carga criar depois ([ADR 0013](adr/0013-somente-leitura-banco-e-codigo.md)). Nenhum
usuário conecta num banco que não é o seu. Senhas iguais ao nome do usuário, só locais.

**S3.** O `weed mini` exige assinatura, como em produção: as credenciais são falsas e fixas no
`compose.yaml` (`local-access-key` / `local-secret-key`), e uma requisição sem assinatura recebe
403. O bucket `reports` nasce na subida (`S3_BUCKET`), e a criação automática no primeiro envio
fica desligada (`-s3.autoCreateBucket=false`): um bucket com nome errado falha no local como
falharia em produção.

**Diferenças do ambiente local que mudam o código**

- **Cookie de sessão:** localmente é só de host, em `localhost`, sem o atributo `Domain`; os
  cookies não separam portas, então `web` e `chat-api` o recebem. Em produção vale para os
  subdomínios (HLD 6.1).
- **Endereço da API do chat:** o BFF a chama pela rede interna (`http://chat-api:3000`); o
  navegador abre o WebSocket em `localhost:3001`. São dois endereços configurados.
- **Endereço do S3:** a API do chat assina a URL do PDF com o endereço que o navegador alcança
  (`http://localhost:8333`), porque a assinatura inclui o host; o Worker grava pelo endereço
  interno (`http://s3:8333`). São dois endereços configurados, com acesso por caminho
  (path-style).
- O `compose.yaml` passa aos apps as variáveis de "Valores e configuração", e cada projeto tem um
  `.env.example`. Os nomes das variáveis dos dois endereços do S3 seguem em aberto, e
  as credenciais do S3 dos apps são as mesmas do serviço `s3`.
- **Banco dos testes:** as suítes e2e e de integração da API do chat rodam no banco `chat_test`,
  com o endereço montado a partir do `DATABASE_URL`.
  - O banco nasce no script de inicialização do Postgres, com o `chat` como dono.
  - A cada execução, o `globalSetup` apaga e recria o schema `public` dele e roda as migrações.
    Ele não apaga o banco, porque o papel `chat` não tem `CREATEDB`.
  - Num volume criado antes do `chat_test`, o `globalSetup` falha com a instrução de criar o banco
    uma vez ou de recomeçar com `down -v`.
- **Tempo nos testes:** sem relógio falso e sem `overrideProvider`
  (`.claude/rules/nest-api-testing.md`). Os testes que dependem de prazo, como o bloqueio de login,
  a renovação e o vencimento da Sessão, envelhecem as linhas no banco no Arrange, por atalhos da
  base de testes (planejado).
- **Serviço `e2e`:** o Playwright roda no próprio contêiner e encaminha `localhost:3000` para a
  web e `localhost:3001` para a API do chat. Assim, o navegador do teste usa os mesmos endereços
  que o da máquina, e o cookie de sessão, só de host em `localhost`, vale também no WebSocket.
  O encaminhamento escuta no IPv4 e no IPv6 de `localhost`.
- **Dados dos testes da web:** os testes do Playwright rodam contra o ambiente de desenvolvimento
  de pé, no banco `chat`, e não num banco separado. O contêiner `e2e` recebe um `DATABASE_URL` do
  banco `chat`.
  - As fixtures gravam direto no banco o que cada teste precisa, como a Pessoa, com e-mail único.
  - A senha da Pessoa de teste vai num hash Argon2id fixo, calculado uma vez, para a web não
    depender de Argon2.
  - Ao fim de cada teste, a fixture apaga o que criou: a Pessoa, com as Sessões dela, e as
    tentativas de login daquele e-mail.

  Assim, os testes rodam em paralelo sem um depender do dado de outro (planejado).
- O local não reproduz a rede privada nem a volta automática da PaaS (HLD, seção 9).

## 11. Decisões

| ADR | Decisão | Status |
| --- | --- | --- |
| [0017](adr/0017-projetos-pnpm-independentes.md) | Três projetos pnpm independentes, sem workspace | aceita |
| [0018](adr/0018-typeorm-api-do-chat.md) | TypeORM na API do chat | aceita |
| [0019](adr/0019-socket-io-tempo-real.md) | Socket.IO no tempo real | aceita |
| [0020](adr/0020-dados-de-negocio-pessoa-a-pessoa.md) | Mensagem de dados de negócio emitida pessoa a pessoa no WebSocket | aceita |
| [0021](adr/0021-contadores-gravados.md) | Contadores de não lidas e de menções gravados na transação | aceita |
| [0022](adr/0022-uuid-v7.md) | UUID v7 como id, gerado na aplicação | aceita |
| [0023](adr/0023-limite-de-login-por-email.md) | Limite de tentativas de login só pelo e-mail | aceita |

As decisões que mudam o desenho estão no HLD, seção 10.

## 12. Questões em aberto

**Estrutura e bibliotecas**

- [ ] Biblioteca da fila no Redis (arq, Celery ou RQ).
- [ ] Acesso ao modelo: `LiteLlm` do ADK para os três provedores, ou Gemini nativo e `LiteLlm`
      para OpenAI e Anthropic.
- [ ] Biblioteca do PDF (WeasyPrint, ReportLab ou fpdf2).
- [ ] Acesso ao Banco dos agentes e migrações (SQLAlchemy com Alembic, ou SQL cru); com ela, o
      dono do schema desse banco.
- [ ] Biblioteca de validação das variáveis no `agents` (pydantic-settings?); com ela, o dono do
      schema das variáveis desse projeto.
- [ ] Parser da conferência de somente leitura (pglast ou sqlglot).
- [ ] Biblioteca de log estruturado na web e no `agents` (structlog?).
- [ ] Porquê das escolhas sem motivo registrado: App Router, SWR, FastAPI próprio, uv; ADRs 0017,
      0018, 0019, 0021 e 0022.

**Componentes**

- [ ] Tipos de peça e dependências permitidas na API do chat, no Serviço de agentes e no Worker, e
      no `web`, com o diagrama.
- [ ] Módulos de domínio do `agents` e da web; os da API do chat além dos da F01.

**Conceitos transversais**

- [ ] Credenciais de bot (por processo ou por agente) e credencial de serviço.
- [ ] Lugar da conferência de participação em canal privado e conversa direta.
- [ ] Função única que monta a mensagem para cada destinatário.
- [ ] Onde a transação começa e como passa entre módulos.
- [ ] Publicação do evento depois do commit: direta ou por tabela de saída.
- [ ] Quem traduz exceção em resposta.
- [ ] Campos de correlação dos logs na web e no `agents`.
- [ ] O que nunca vai para o log, além do que o HLD já diz.
- [ ] Contadores quando a leitura avança até uma mensagem que não é a última da conversa.

**Dados e interfaces**

- [ ] Canais e conversas diretas: uma tabela com tipo, ou tabelas separadas.
- [ ] Bots na mesma tabela das pessoas, ou não.
- [ ] Diagrama de entidades e relações; forma das tabelas.
- [ ] Paginação do histórico e das listas.
- [ ] Índice das rotas (BFF, API do chat para o BFF e para os bots, Serviço de agentes) e lista
      de eventos do WebSocket.

**Estados, regras e processos**

- [ ] Subseções de "Estados e regras": pedido ao agente (estados; resposta a uma pergunta como
      pedido novo ou continuação), pergunta pendente (quando termina), mensagem (exclusão com
      menções, notificações e contadores; edição que acrescenta menção), consulta
      a dados de negócio (comparação do lastro), limite de pedidos e teto de custo, presença e
      "digitando".
- [ ] Tarefa: concluir uma já concluída, ou reabrir uma aberta.
- [ ] Idempotência da tarefa do PDF (chave no S3, entrega única) e outras rotinas (retenção dos
      PDFs, perguntas pendentes vencidas).

**Valores, configuração e ambiente**

- [ ] Valores de regra marcados "A definir" em "Valores e configuração", e se o limite de pedidos
      é constante ou variável.
- [ ] Nomes, projetos e origem das variáveis de ambiente.
- [x] Diferenças do ambiente local que mudam o código ou os testes (seção 10).
