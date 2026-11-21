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
- `loggedInPage`: uma página que já entrou pelo formulário e está no `#geral`.

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
