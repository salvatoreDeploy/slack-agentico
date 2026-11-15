# Spec · F01 · Entrar e sair

2026-11-15 · Status: pronta · PRD: [prd.md](prd.md)

Como a F01 será construída. O que a Pessoa consegue fazer, os critérios de aceite e o que não é
objetivo estão no PRD. As regras de Sessão e de login, os valores e as convenções transversais
estão no [LLD](../../lld.md), e esta spec aponta para eles em vez de repeti-los.

## Problema

Sem identificar quem usa o chat, nada mais do produto funciona: não há autor de Mensagem, nem
participação em Canal privado, nem Permissão de dados. Hoje não há como entrar (PRD, seção 1,
"Resumo executivo").

## Solução

A Pessoa entra com o e-mail e a senha da conta que o Operador criou para ela. Ela continua com a
Sessão em todas as abas do navegador enquanto usar o chat dentro da `duração da sessão`, troca a
senha inicial pelo menu do usuário e sai pelo mesmo menu. O Operador cria contas, redefine senhas
e revoga Sessões pelo comando de contas da API do chat. O fluxo completo está no PRD, seção 2,
"Fluxo principal".

## Histórias de usuário

As histórias H1 a H8 do PRD (seção 2, "Histórias de usuário e critérios de aceite") valem como
estão, com os critérios de aceite de lá. Esta spec acrescenta as do Operador que o PRD não detalha:

9. Como Operador, quero redefinir a senha de uma Pessoa, para que ela volte a entrar quando
   esquecer a senha.
10. Como Operador, quero apagar as Sessões vencidas, para o banco não acumular linhas mortas.
11. Como Operador, quero digitar a senha sem que ela apareça na tela nem fique no histórico do
    terminal, para não deixar a credencial exposta na máquina.

## Decisões de implementação

### Base que a F01 monta

A F01 é a primeira funcionalidade, e o código ainda é o esqueleto dos dois frameworks. Ela monta o
que as próximas reaproveitam, conforme o `AGENTS.md` de cada app. O que esses arquivos descrevem e
a F01 não usa (Membro de Canais públicos no `create`, `set-admin`, `create-bot`, comando de canais,
`--title` e `--phone`) fica para as funcionalidades donas.

- **API do chat:**
  - Módulo de configuração com validação na subida (LLD, "Conceitos transversais de
    implementação", seção "Configuração").
  - TypeORM com migrações ([ADR 0018](../../adr/0018-typeorm-api-do-chat.md)) e ids UUID v7
    ([ADR 0022](../../adr/0022-uuid-v7.md)), com o cls transacional.
  - O erro de domínio base, o exception filter global, com o corpo `problem+json`, e o guard de
    autenticação, como na rule de erros da API.
  - Os logs do LLD, seção "Logs".
  - O snapshot do contrato pelo `@nestjs/swagger`, regravado pelo `pnpm openapi`.
- **Web:**
  - Módulo de configuração com a mesma validação.
  - O conjunto completo de tokens do design system, nos temas claro e escuro, com a fonte Lato. O
    tema claro é o padrão; o escuro vale só com `data-theme="dark"` na raiz, que a F09 liga à
    troca de tema.
  - Os primitivos e as bibliotecas do design system, à medida que as telas desta spec os usam
    (`docs/design-system.md`, "Stack de interface").
- **Testes:** o banco de testes da API, o Playwright num serviço próprio do compose e as bases de
  teste descritas em "Decisões de teste" (LLD, "Ambiente de desenvolvimento").
- **Ambiente:** o compose passa aos apps as variáveis do LLD ("Valores e configuração"), e cada
  projeto ganha um exemplo de `.env`.

Os módulos `people`, `sessions` e `accounts` estão no LLD, "Componentes e dependências", seção
"Módulos da API do chat".

### Pessoas (API do chat)

Tabela `people`, `planejada`:

| Coluna | Tipo | Regra |
| --- | --- | --- |
| `id` | uuid | UUID v7 |
| `name` | texto | Dentro do `tamanho do nome`; exibido no menu do usuário e nas iniciais |
| `username` | texto, único | O @usuário, sem o `@` (LLD, "Sessão e login", seção "@usuário") |
| `email` | texto, único | Gravado já normalizado |
| `password_hash` | texto | Argon2id (LLD, "Segurança") |
| `created_at`, `updated_at` | timestamptz | Convenção do LLD, "Dados" |

O cargo, o telefone, a Presença, o papel de Administrador e a Permissão de dados ficam para as
funcionalidades que os usam (F09, F10 e F13).

### Sessões (API do chat)

Tabela `sessions`, `planejada`:

| Coluna | Tipo | Regra |
| --- | --- | --- |
| `id` | uuid | UUID v7 |
| `person_id` | uuid | Referência a `people`, com índice; apagar a Pessoa apaga as Sessões dela |
| `token_hash` | bytes, único | SHA-256 do token; o token em si nunca é gravado nem vai para o log |
| `last_used_at` | timestamptz | Último uso que renovou a validade |
| `expires_at` | timestamptz | Validade, renovada pelo uso; com índice, para apagar as vencidas |
| `created_at`, `updated_at` | timestamptz | Convenção do LLD |

As regras de criação, verificação, renovação, vencimento, saída, troca de senha e revogação estão
no LLD, "Estados e regras", seção "Sessão e login".

**Rotas**, todas `planejadas`, com o corpo de erro do LLD ("Erros"):

| Rota | Entrada | Sucesso | Erros |
| --- | --- | --- | --- |
| `POST /v1/sessions` | `email`, `password` | 201 com `token` e `person` | `validation_failed` (400), `invalid_credentials` (401), `too_many_attempts` (429, com `Retry-After`) |
| `GET /v1/me` | Cookie de sessão | 200 com `person` | `unauthenticated` (401) |
| `DELETE /v1/sessions/current` | Cookie de sessão | 204 | `unauthenticated` (401) |
| `PUT /v1/me/password` | Cookie de sessão; `current_password`, `new_password` | 204 | `validation_failed` (400), `unauthenticated` (401), `wrong_current_password` (422), `password_unchanged` (422), `too_many_attempts` (429, com `Retry-After`) |

- `person` tem `id`, `name`, `username` e `email`.
- O guard de autenticação lê a Sessão do cookie, o mesmo que o BFF repassa (LLD, "Interfaces").
  A F05 reaproveita a mesma verificação no handshake do WebSocket.
- Os códigos de erro novos entram no tipo de códigos e no mapa de status do filter, na mesma
  tarefa da rota.

### Limite de tentativas de login (API do chat)

Tabela `login_attempts`, `planejada`:

| Coluna | Tipo | Regra |
| --- | --- | --- |
| `email` | texto | Chave primária; normalizado, sem referência a `people`, porque o e-mail pode não existir |
| `failures` | inteiro | Falhas na janela atual |
| `window_started_at` | timestamptz | Início da janela |
| `blocked_until` | timestamptz, nulo | Fim do bloqueio |
| `created_at`, `updated_at` | timestamptz | Convenção do LLD |

A tabela foge da convenção do id em UUID: a chave natural é o e-mail, e a linha é sobrescrita,
nunca referenciada. As regras estão no LLD, "Sessão e login", seção "Registro das falhas". A
escolha de contar só pelo e-mail está na [ADR 0023](../../adr/0023-limite-de-login-por-email.md).

### Comando de contas (API do chat)

Um script da própria API do chat, rodado no contêiner, que sobe o contexto do Nest sem HTTP e
chama os mesmos services de Pessoas e de Sessões.

| Operação | Recebe | Efeito |
| --- | --- | --- |
| `create` | E-mail, nome, `--username` opcional; senha pelo terminal | Cria a Pessoa. Recusa, sem criar nada: e-mail já usado, @usuário já usado ou inválido, nome fora do `tamanho do nome` e senha fora do `tamanho da senha` |
| `reset-password` | E-mail; senha nova pelo terminal | Troca o hash e revoga todas as Sessões da Pessoa |
| `revoke-sessions` | E-mail | Apaga todas as Sessões da Pessoa e diz quantas eram |
| `purge-expired-sessions` | — | Apaga as Sessões vencidas e diz quantas eram |

- A senha é lida do terminal duas vezes, sem eco, e nunca vem de argumento nem de variável.
- A leitura fica atrás de uma interface pequena, que o teste substitui pela entrada dada.
- Nenhuma saída mostra a senha nem o hash. Os erros dizem o que corrigir e saem com código
  diferente de zero.

### BFF e telas (web)

- **Endereços:** `/entrar` é a tela Entrar e `/` é a Home. As telas com Sessão ficam sob um layout
  comum. O parâmetro de volta é `?voltar=`, com as regras do LLD, "Cliente", "Sessão no cliente".
- **Chamadas do navegador:** Entrar, Sair e Trocar senha são Server Actions (LLD, "Estrutura do
  código"). Cada uma chama um service HTTP da web, que fala com a API do chat; nenhum componente
  nem Server Action chama o `fetch` direto (`apps/web/AGENTS.md`, "API Externas").
- **Cookie:** o BFF grava o cookie com o token devolvido por `POST /v1/sessions` e o repassa à API
  em cada chamada. Ele apaga o cookie ao sair ou ao receber 401. Os atributos estão no LLD,
  "Segurança".
- **Verificação da Sessão:** o proxy do Next confere só se o cookie existe. A verificação de
  verdade é feita pelo layout das telas com Sessão e pela tela `/entrar`, chamando `GET /v1/me`.
  A reação a cada resposta está no LLD, "Cliente".
- **Tela Entrar**, que reproduz a seção Login do design:
  - **Padrão:** foco inicial no E-mail.
  - **Erro de validação:** a validação roda no cliente e na Server Action, e o foco vai para o
    primeiro campo inválido.
  - **Enviando:** o botão fica em `loading`, e o envio duplo é bloqueado.
  - **Credenciais incorretas:** "E-mail ou senha incorretos." abaixo da Senha. A senha é limpa, o
    foco vai para a Senha e o e-mail continua preenchido.
  - **Tentativas demais:** "Muitas tentativas. Tente de novo em alguns minutos."
  - **Falha no envio**, de rede ou do servidor: "Não foi possível entrar agora. Tente de novo em
    instantes."

  Nos dois últimos estados, a mensagem fica no formulário, entre a Senha e o botão, com
  `role="alert"`. O e-mail e a senha continuam preenchidos, e o foco não muda. Os campos com erro
  levam `aria-invalid` e `aria-describedby` apontando para a mensagem. Um estado que não tiver
  frame ganha um, no padrão `Login / <Estado>`, antes do código da tela, com os componentes e as
  variables locais.
- **Home na F01:** o shell real, só com o que já funciona, e não uma tela provisória.
  - **Rail:** a marca, "Início" ativo e o avatar de iniciais. Ficam de fora a Atividade (F08), o
    controle de tema e o ponto de Presença (F09).
  - **Sidebar:** só o cabeçalho do Workspace, sem o ícone de nova mensagem e sem as seções de
    canais, Conversas diretas e Agentes (F02, F04, F10).
  - **Área principal:** o estado "Home / Vazio".

  O shell cresce a cada funcionalidade.
- **Menu do usuário (UserMenu):** abre pelo avatar do Rail, com o DropdownMenu do Radix, por mouse
  e teclado. Na F01, ele tem o cabeçalho, com o avatar de iniciais e o nome, sem a linha de
  Presença, e dois itens: "Trocar senha" e "Sair". Sair segue o LLD, "Cliente": o cookie é apagado
  mesmo se a API falhar, e a Pessoa vai para `/entrar`.
- **Diálogo "Trocar senha":** abre pelo menu do usuário, com a senha atual, a senha nova e Salvar.
  - Estados: enviando, senha atual errada, senha igual à atual, senha curta, tentativas demais e
    sucesso, com um toast.
  - O foco fica preso no diálogo, começa na senha atual e volta ao avatar quando o diálogo fecha
    pelo Esc.
  - O diálogo não existe no design e é desenhado antes do código, na tarefa dele.
- **Portas:**
  - Enquanto o layout com Sessão verifica a Sessão, aparece "Portas / Carregando o app".
  - Se a verificação falha por rede ou servidor, aparece "Portas / Erro de sessão", em tela cheia
    e sem o shell; "Tentar de novo" refaz a renderização da rota.
  - A "Portas / Casca de espera" não entra na F01.
- **Voltar pelo histórico depois de sair:** as telas com Sessão não ficam no cache do navegador
  (LLD, "Cliente", "Sessão no cliente").

### Ferramenta de design (questão em aberto)

Antes da primeira tarefa de tela, a tarefa de fundação da web resolve duas coisas:

1. Qual arquivo do Figma vale. O `AGENTS.md` da raiz cita o `ekcnMHgGn98DuH5GIApyVW`, e o design
   system e o LLD citam o `plW17JDOoRHydUJIIi2u87`.
2. Se o MCP do Figma lê os frames da F01.

Se o Figma falhar, porque o arquivo está errado, os frames faltam ou o MCP não responde, o design
da F01 é feito no Pencil, pelo MCP dele, que já está configurado. Para isso, o arquivo do Pencil
tem de estar aberto no aplicativo, porque o servidor do MCP só existe enquanto o Pencil roda.

A escolha fica registrada no plano da tarefa de fundação da web. Decidido: o Pencil, com o arquivo
`slack-ia.pen`. O fluxo de trabalho está no `docs/design-system.md`, "Fluxo com a ferramenta de
design", e na seção "Design e Pencil" do `AGENTS.md` da raiz.

### Tempo real

A F01 não sobe o WebSocket. Na F01, a "próxima ação" das histórias H3, H5 e H7 é a navegação ou a
chamada ao BFF que recebe 401. A recusa da conexão de tempo real com uma Sessão vencida ou
revogada é critério da F05, com a mesma verificação de Sessão desta spec.

## Decisões de teste

**O que faz um bom teste aqui:** o teste prova o comportamento externo, que é a resposta HTTP, a
linha no banco ou o redirecionamento, e não a forma interna dos services. A forma de cada teste
está na rule de testes da API. Os testes de tempo (janela, bloqueio, validade e renovação)
envelhecem as linhas no banco no Arrange, por atalhos da base de testes, sem relógio falso e sem
`overrideProvider`.

**Pontos de teste:** os testes de ponta a ponta da API são o ponto principal, porque todas as
regras da F01 moram na API. O comando de contas tem testes de integração, e a web tem o Playwright
como único ponto. Não há Vitest na F01: ele entra quando aparecer uma função pura com muitos casos,
lenta de provar pelo navegador.

**API do chat, testes de ponta a ponta por HTTP com banco real:**

- **Entrar:**
  - Com e-mail e senha certos, responde 201, devolve o token e grava a Sessão com o hash, e não
    com o token.
  - O e-mail é aceito com maiúsculas e com espaços nas pontas.
- **Validação de entrada, inclusive os tamanhos máximos:** responde 400 com `validation_failed`, e
  a tentativa não conta para o limite.
- **Credenciais erradas:** e-mail inexistente e senha errada respondem os dois 401, com o mesmo
  `invalid_credentials` e o mesmo corpo.
- **Limite:**
  - A falha que completa as `tentativas de login` dentro da janela bloqueia.
  - Durante o bloqueio, até a senha certa recebe 429, com `Retry-After`, e as tentativas não
    estendem o bloqueio.
  - Passado o bloqueio, a senha certa entra.
  - Um login certo antes do limite zera a contagem.
  - O limite vale também para e-mail sem conta.
  - Duas falhas simultâneas contam as duas.
  - Senhas atuais erradas na troca de senha contam no mesmo limite.
- **Verificação:**
  - `GET /v1/me` responde 200 com a Pessoa.
  - A validade é renovada quando passou o `intervalo de renovação da sessão`, e não antes disso.
  - Sessão vencida, Sessão revogada, token desconhecido e falta de cookie respondem 401 com
    `unauthenticated`, e a Sessão vencida é apagada.
- **Saída:** responde 204, e a mesma Sessão passa a responder 401; outra Sessão da mesma Pessoa
  continua valendo.
- **Troca de senha:**
  - Responde 204, a senha nova passa a entrar e a antiga não.
  - As outras Sessões da Pessoa passam a responder 401, e a atual continua.
  - Respondem com erro: senha atual errada, senha igual e senha fora do `tamanho da senha`.
- **Contrato:** o documento gerado é igual ao snapshot gravado.

**Comando de contas, testes de integração contra o banco de testes:**

- As quatro operações, com o efeito no banco.
- As recusas do `create`.
- A derivação do @usuário a partir do e-mail: acentos, caractere fora do conjunto, prefixo, mínimo,
  corte e sufixo numérico.

**Base de testes da API, criada na F01:**

- `createTestApp()` e `uniqueEmail()`.
- Os atalhos de `authRoutes`: criar a Pessoa direto pelo service e entrar.
- Os atalhos de envelhecer a Sessão e as tentativas.
- O banco `chat_test`, apagado, criado e migrado pelo `globalSetup` (LLD, "Ambiente de
  desenvolvimento").

**Web, testes de ponta a ponta com o Playwright.** Rodam contra o ambiente de desenvolvimento já
de pé (web, API do chat e banco `chat`) e provam o comportamento pela tela. Onde e como rodam
(contêiner `e2e`, headless em tudo, só Chromium, paralelo, sem retries) está no `apps/web/AGENTS.md`,
"Testes de ponta a ponta", e o acesso ao banco no LLD, "Ambiente de desenvolvimento". Cobrem:

- Entrar com sucesso.
- Os erros de validação, de credenciais incorretas e de tentativas demais, com os textos e o foco
  de "BFF e telas".
- O `?voltar=`, inclusive um valor como `//outro-site`, que cai na Home.
- Quem tem Sessão e abre `/entrar` vai para a Home.
- Uma segunda aba do mesmo navegador já com Sessão.
- Reabrir o navegador, num contexto novo com os cookies guardados, mantém a Sessão.
- Sair leva a Entrar, e a outra aba vai para Entrar na próxima ação.
- Uma Sessão revogada leva a Entrar na próxima ação.
- Voltar pelo histórico depois de sair não mostra conteúdo do chat.
- Trocar a senha: sucesso, senha atual errada e a nova senha valendo no próximo login.
- O fluxo inteiro só pelo teclado.
- A checagem de acessibilidade com `@axe-core/playwright` nas telas Entrar e Home e no diálogo
  "Trocar senha", sem violações.

**Como os testes da web são escritos:** pelo fluxo da skill `playwright-cli` (planejar, gerar e
corrigir), como descrito no `apps/web/AGENTS.md`, "Testes de ponta a ponta". O agente explora a
tela a partir do teste-semente, escreve o plano de testes e2e da F01, gera um arquivo de teste por
cenário com as ações gravadas e corrige um teste quebrado pelo mesmo caminho. O plano de testes e2e
aponta para esta spec e é dono dos passos de cada cenário; esta spec continua dona do que é coberto.
A tarefa da tela Entrar cria o plano, e a da troca de senha acrescenta os cenários dela.

**Base dos testes da web, criada na F01:**

- A fixture `person` cria a Pessoa direto no banco, com e-mail único e o hash Argon2id fixo de uma
  senha conhecida de teste, e devolve o e-mail e a senha. Ao fim do teste, ela apaga a Pessoa, com
  as Sessões dela, e as tentativas de login daquele e-mail.
- A fixture `loggedInPage` entra pelo formulário da tela Entrar, no único lugar que faz isso.
- O teste-semente abre `/entrar` com uma Pessoa pronta. Os cenários de login usam só `person`, e os
  que partem de alguém com Sessão usam `loggedInPage`.
- Os testes de revogação e de tempo mexem nas linhas do banco no Arrange, como na API.

**Verificações do agente com o `playwright-cli`**, registradas na pasta da tarefa da tela:

- **"Erro de sessão":** o agente para o processo da API do chat, abre uma tela com Sessão, confere
  a mensagem e o botão, sobe a API de novo e confere que "Tentar de novo" mostra a tela pedida. O
  snapshot e a captura ficam no registro.
- **Validação visual:** capturas em 1440 × 900, no tema claro e no escuro (trocando o
  `data-theme`), comparadas com os frames da ferramenta de design (`docs/design-system.md`,
  "Validação visual").

**Roteiro manual**, feito por uma pessoa e registrado na mesma pasta: a nota 100 de
Acessibilidade do Lighthouse na tela Entrar, pelo Chrome DevTools.

**Exemplos anteriores:** não há testes de comportamento no código. Os testes da F01 viram o
exemplo para as próximas funcionalidades.

## Fora de escopo

- Tudo o que o PRD lista em "O que não é objetivo".
- O WebSocket e a recusa da conexão por Sessão inválida, que ficam para a F05 (seção "Tempo
  real").
- Presença, perfil, notificações e troca de tema no menu do usuário e no Rail (F08 e F09).
- Os itens da Sidebar e a Atividade.
- Rotina agendada de limpeza de Sessões, limite de tentativas por IP e Redis.
- Vitest na API e na web.
- Testes do Playwright em outros navegadores além do Chromium, e uma instância da web e da API só
  para os testes.

## Observações

- **Questões do LLD fechadas pela F01:**
  - formato e guarda do identificador de Sessão;
  - atributos do cookie, `SameSite` e CSRF;
  - como o BFF leva a Sessão à API do chat;
  - chave do limite de tentativas;
  - bibliotecas de validação da configuração, de log na API do chat e de hash;
  - Server Actions nas mutações;
  - corpo de erro;
  - Sessões vencidas.

  O registro está no LLD, nas seções citadas acima.
- **Bloqueio de propósito:** o risco de uma pessoa travar a conta de outra durante a `duração do
  bloqueio de login` foi aceito na [ADR 0023](../../adr/0023-limite-de-login-por-email.md).
- **Verificação completa:** a da API do chat ganha `pnpm test:int`, e a do snapshot vem dentro da
  suíte e2e. A da web hoje lista `pnpm test`, do Vitest, que não existe na F01: a tarefa de
  fundação da web tira esse passo e o comando da seção "Comandos" até o Vitest entrar.
- **Os frames são citados pelo nome:** os ids mudam quando um frame é recriado.
- **Recorte em tarefas:** fica nos `tarefa.md` da pasta da funcionalidade, a partir desta spec,
  com as tarefas numeradas na ordem de dependência (`AGENTS.md` da raiz, "Planejamento").
