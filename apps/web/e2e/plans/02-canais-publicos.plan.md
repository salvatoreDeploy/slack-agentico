# Canais públicos (F02): plano de testes e2e

Plano de testes e2e da F02 (`apps/web/AGENTS.md`, "Testes de ponta a ponta"). A spec da F02
(`docs/funcionalidades/02-canais-publicos/spec.md`, "Decisões de teste") é dona do que é coberto;
este plano é dono dos passos de cada cenário. Cada tarefa de tela acrescenta os cenários dela.

**Seed:** `e2e/seed.spec.ts`

**Fixtures:** em `e2e/fixtures.ts`:
- `person`: uma Pessoa gravada no banco `chat`, com a participação em todos os Canais públicos,
  apagada ao fim;
- `otherPerson`: uma segunda Pessoa, autora das Mensagens "de outra Pessoa";
- `testChannel`: um Canal público com nome único, com a participação das Pessoas, apagado ao fim
  com as Mensagens;
- `loggedInPage`: uma página que já entrou pelo formulário e está no `#geral`;
- `createdChannelName`: um nome único `e2e-criado-<id>` para o Canal criado pela tela, apagado ao
  fim. A limpeza da `person` toma o lock das participações, para não correr com uma criação de
  Canal de outro teste.

Os atalhos `expectGeral` e `openChannel` conferem que a página está no Canal, com o título, e o
`insertMessage` grava uma Mensagem direto no banco, com a data opcional.

Os testes desta funcionalidade nunca escrevem no `#geral`, porque a suíte roda em paralelo no
banco `chat`.

## 1. `#geral` na barra lateral (F02-T02)

### 1.1 entra-e-cai-no-geral

**File:** `e2e/02-canais-publicos/entra-e-cai-no-geral.spec.ts`

Steps:
1. Abrir `/entrar` e entrar com a Pessoa da fixture.

Expected: a página é `/canais/<id>`, com o título "geral" no cabeçalho.

### 1.2 raiz-leva-ao-geral

**File:** `e2e/02-canais-publicos/raiz-leva-ao-geral.spec.ts`

Steps:
1. Com Sessão (`loggedInPage`), abrir `/`.

Expected: a página volta ao `#geral`.

### 1.3 geral-mostra-cabecalho-e-inicio

**File:** `e2e/02-canais-publicos/geral-mostra-cabecalho-e-inicio.spec.ts`

Steps:
1. Com Sessão, no `#geral`.

Expected: o cabeçalho mostra "geral" e "Canal de todo o Workspace"; o título da aba é
"#geral · Full Cycle Chat"; o começo do Canal mostra "Este é o começo do canal #geral" e a
descrição.

### 1.4 barra-lateral-com-canal-aberto

**File:** `e2e/02-canais-publicos/barra-lateral-com-canal-aberto.spec.ts`

Steps:
1. Com Sessão, no `#geral`.

Expected: a barra lateral tem a seção "Canais", com o link "geral" marcado com
`aria-current="page"`.

### 1.5 canal-inexistente-mostra-nao-encontrado

**File:** `e2e/02-canais-publicos/canal-inexistente-mostra-nao-encontrado.spec.ts`

Steps:
1. Com Sessão, abrir `/canais/<um UUID que não existe>`.
2. Clicar em "Voltar ao início".

Expected: no passo 1, a casca continua (barra lateral visível) e a área principal mostra
"Conversa não encontrada" e "Ela não existe ou você não participa dela."; o título da aba é
"Conversa não encontrada · Full Cycle Chat". No passo 2, a página vai ao `#geral`.

### 1.6 id-malformado-mostra-nao-encontrado

**File:** `e2e/02-canais-publicos/id-malformado-mostra-nao-encontrado.spec.ts`

Steps:
1. Com Sessão, abrir `/canais/nao-e-um-id`.

Expected: o mesmo estado de Conversa não encontrada do 1.5.

### 1.7 barra-lateral-pelo-teclado

**File:** `e2e/02-canais-publicos/barra-lateral-pelo-teclado.spec.ts`

Steps:
1. Com Sessão, abrir a Conversa não encontrada (`/canais/<UUID inexistente>`).
2. Apertar Tab até o foco chegar ao link "geral" da barra lateral.
3. Apertar Enter.

Expected: no passo 2, o link "geral" tem o foco e o contorno de foco visível; no passo 3, a
página vai ao `#geral`.

### 1.8 acessibilidade-geral-e-nao-encontrado

**File:** `e2e/02-canais-publicos/acessibilidade-geral-e-nao-encontrado.spec.ts`

Steps:
1. Com Sessão, no `#geral`, rodar o axe-core.
2. Abrir a Conversa não encontrada e rodar o axe-core.

Expected: nenhuma violação nos dois.

## 2. Ler e enviar Mensagens (F02-T03)

Os cenários que conferem horário e dia fixam o fuso do navegador em `America/Sao_Paulo`.

### 2.1 historico-com-autor-horario-e-dias

**File:** `e2e/02-canais-publicos/historico-com-autor-horario-e-dias.spec.ts`

Steps:
1. Gravar uma Mensagem de `otherPerson` de 24 h atrás e uma de `person` de 1 min atrás no
   `testChannel`.
2. Abrir o Canal.

Expected: os separadores são "Ontem" e "Hoje", nessa ordem; cada Mensagem tem o nome do autor e o
horário `HH:mm` no fuso fixado; a Mensagem mais recente está visível, com a lista rolada até o fim.

### 2.2 texto-com-html-aparece-como-texto

**File:** `e2e/02-canais-publicos/texto-com-html-aparece-como-texto.spec.ts`

Steps:
1. Gravar a Mensagem `<b>oi</b> <img src=x>` e abrir o Canal.

Expected: o texto aparece como está, e a lista não tem `<b>` nem `<img>`.

### 2.3 link-e-varias-linhas

**File:** `e2e/02-canais-publicos/link-e-varias-linhas.spec.ts`

Steps:
1. Gravar a Mensagem "primeira linha\nveja https://exemplo.com e exemplo.com" e abrir o Canal.

Expected: `https://exemplo.com` é o único link, com `target="_blank"`; o texto mantém a quebra de
linha.

### 2.4 envia-uma-mensagem

**File:** `e2e/02-canais-publicos/envia-uma-mensagem.spec.ts`

Steps:
1. Abrir o Canal e segurar o envio da Server Action no navegador.
2. Digitar "olá, canal" e apertar Enter.
3. Liberar o envio.

Expected: no passo 2, a Mensagem aparece no fim, com `aria-busy` e a opacidade 0,6, e o campo fica
vazio; no passo 3, ela deixa de estar ocupada e mostra o nome da Pessoa e o horário.

### 2.5 envia-pelo-teclado-com-varias-linhas

**File:** `e2e/02-canais-publicos/envia-pelo-teclado-com-varias-linhas.spec.ts`

Steps:
1. No composer, digitar "linha um", Shift+Enter, "linha dois" e Enter.

Expected: antes do Enter, o campo tem as duas linhas; depois, a Mensagem enviada tem as duas.

### 2.6 contador-perto-e-acima-do-limite

**File:** `e2e/02-canais-publicos/contador-perto-e-acima-do-limite.spec.ts`

Steps:
1. Preencher o composer com 3.801 emojis compostos.
2. Preencher com 4.012 letras.

Expected: no passo 1, "Restam 199 caracteres" e o envio habilitado; no passo 2, "12 caracteres acima
do limite" e o envio desabilitado.

### 2.7 mensagem-de-outra-pessoa-ao-reabrir

**File:** `e2e/02-canais-publicos/mensagem-de-outra-pessoa-ao-reabrir.spec.ts`

Steps:
1. Abrir o Canal e gravar uma Mensagem de `otherPerson` no banco.
2. Ir ao `#geral` pela barra lateral e voltar ao Canal.

Expected: no passo 1, a Mensagem não aparece; no passo 2, aparece, com o nome de `otherPerson`.

### 2.8 envia-so-pelo-teclado

**File:** `e2e/02-canais-publicos/envia-so-pelo-teclado.spec.ts`

Steps:
1. Abrir o Canal e apertar Tab até o composer.
2. Digitar e apertar Enter.

Expected: o composer recebe o foco, e a Mensagem é enviada.

### 2.9 acessibilidade-canal-com-mensagens

**File:** `e2e/02-canais-publicos/acessibilidade-canal-com-mensagens.spec.ts`

Steps:
1. Gravar Mensagens de ontem e de hoje, com um link, abrir o Canal e rodar o axe-core.

Expected: nenhuma violação.

### 2.10 mensagem-enviada-uma-vez-ao-voltar

**File:** `e2e/02-canais-publicos/mensagem-enviada-uma-vez-ao-voltar.spec.ts`

Steps:
1. Enviar "só uma vez" no Canal e esperar a confirmação.
2. Ir ao `#geral` pela barra lateral e voltar ao Canal pela barra lateral.
3. Ir ao `#geral` de novo e voltar pelo histórico do navegador.

Expected: depois dos passos 2 e 3, a Mensagem aparece uma vez só. O Next preserva o estado da rota
ao voltar, e a página traz a Mensagem de novo do servidor.

## 3. Falha no envio e tentar de novo (F02-T04)

O atalho `routeSend` intercepta o `POST` da Server Action no endereço do Canal.

### 3.1 falha-no-envio-e-tentar-de-novo

**File:** `e2e/02-canais-publicos/falha-no-envio-e-tentar-de-novo.spec.ts`

Steps:
1. Bloquear o envio e enviar "vai falhar primeiro".
2. Liberar o envio e clicar em "Tentar de novo".

Expected: no passo 1, a Mensagem fica com o texto, "Não foi possível enviar." e "Tentar de novo";
no passo 2, ela é confirmada, sem o aviso nem o botão.

### 3.2 tentar-de-novo-nao-duplica

**File:** `e2e/02-canais-publicos/tentar-de-novo-nao-duplica.spec.ts`

Steps:
1. Entregar o envio à API (`route.fetch()`) e responder ao navegador com uma falha
   (`route.abort()`).
2. Liberar o envio, clicar em "Tentar de novo" e recarregar a página.

Expected: no passo 1, a Mensagem aparece como não enviada, embora a API a tenha gravado; depois
do passo 2, o Canal tem uma Mensagem só com esse texto.

### 3.3 tentar-de-novo-pelo-teclado

**File:** `e2e/02-canais-publicos/tentar-de-novo-pelo-teclado.spec.ts`

Steps:
1. Bloquear o envio e enviar "pelo teclado".
2. Liberar o envio, levar o foco a "Tentar de novo" com Shift+Tab e apertar Enter.

Expected: a Mensagem é confirmada, e o foco volta ao composer.

## 4. Criar Canal (F02-T05)

O atalho `openCreateChannel` abre o diálogo por "Adicionar canal" e espera o foco no Nome, e o
`failCreateChannel` bloqueia o `POST` da Server Action. No 1.3, o `#geral` também confere que não
tem a linha do criador.

### 4.1 criar-canal-mostra-a-previa-do-nome

**File:** `e2e/02-canais-publicos/criar-canal-mostra-a-previa-do-nome.spec.ts`

Steps:
1. Abrir o diálogo.
2. Digitar "Café & Vendas" no Nome.

Expected: no passo 1, a dica "Minúsculas, sem espaços. Ex.: planejamento-q4"; no passo 2, "O
canal vai se chamar #cafe-vendas.".

### 4.2 criar-canal-com-sucesso

**File:** `e2e/02-canais-publicos/criar-canal-com-sucesso.spec.ts`

Steps:
1. Abrir o diálogo, preencher o nome da fixture e a descrição "Metas do time".
2. Clicar em "Criar canal".

Expected: a página é `/canais/<id>` do Canal novo, o diálogo fechou, a linha dele na barra lateral
está selecionada, e o começo do Canal mostra "@<usuário> criou este canal em <hoje>." e a
descrição.

O mesmo arquivo tem um segundo teste: depois de criar o Canal, voltar à página anterior pelo
navegador. Expected: o `#geral`, sem o diálogo, que não reabre no endereço em que foi aberto.

### 4.3 criar-canal-nome-vazio-ou-invalido

**File:** `e2e/02-canais-publicos/criar-canal-nome-vazio-ou-invalido.spec.ts`

Steps:
1. Abrir o diálogo e clicar em "Criar canal" sem nome.
2. Preencher "!!!" e clicar em "Criar canal".

Expected: no passo 1, "Informe o nome do canal.", com o foco no Nome marcado como inválido; no
passo 2, "Use letras ou números no nome."; nenhuma chamada da Server Action.

### 4.4 criar-canal-nome-ja-usado

**File:** `e2e/02-canais-publicos/criar-canal-nome-ja-usado.spec.ts`

Steps:
1. Abrir o diálogo, preencher "GERAL" e clicar em "Criar canal".

Expected: "Já existe um canal chamado #geral." no campo, com o diálogo aberto, "GERAL" no Nome e o
foco nele.

### 4.5 criar-canal-falha-ao-criar

**File:** `e2e/02-canais-publicos/criar-canal-falha-ao-criar.spec.ts`

Steps:
1. Bloquear a Server Action, abrir o diálogo, preencher o nome e a descrição.
2. Clicar em "Criar canal".

Expected: "Não foi possível criar o canal. Tente de novo." como alerta no corpo do diálogo, com os
dois campos preenchidos.

### 4.6 criar-canal-esc-devolve-o-foco

**File:** `e2e/02-canais-publicos/criar-canal-esc-devolve-o-foco.spec.ts`

Steps:
1. Abrir o diálogo e apertar Esc.

Expected: o diálogo fecha, e o foco está em "Adicionar canal".

### 4.7 criar-canal-pelo-teclado

**File:** `e2e/02-canais-publicos/criar-canal-pelo-teclado.spec.ts`

Steps:
1. Levar o foco a "Adicionar canal" com Tab e apertar Enter.
2. Digitar o nome e apertar Enter.

Expected: no passo 1, o diálogo abre com o foco no Nome; no passo 2, a Pessoa cai no Canal novo.

### 4.8 acessibilidade-dialogo-criar-canal

**File:** `e2e/02-canais-publicos/acessibilidade-dialogo-criar-canal.spec.ts`

Steps:
1. Abrir o diálogo com a prévia de "Café & Vendas" e rodar o axe-core.
2. Abrir o diálogo, criar sem nome e rodar o axe-core com o erro no campo.

Expected: nenhuma violação nos dois casos.
