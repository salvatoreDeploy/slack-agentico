# Canais públicos (F02): plano de testes e2e

Plano de testes e2e da F02 (`apps/web/AGENTS.md`, "Testes de ponta a ponta"). A spec da F02
(`docs/funcionalidades/02-canais-publicos/spec.md`, "Decisões de teste") é dona do que é coberto;
este plano é dono dos passos de cada cenário. Cada tarefa de tela acrescenta os cenários dela.

**Seed:** `e2e/seed.spec.ts`

**Fixtures:** `person` (uma Pessoa gravada no banco `chat`, com a participação em todos os Canais
públicos, apagada ao fim) e `loggedInPage` (uma página que já entrou pelo formulário e está no
`#geral`), em `e2e/fixtures.ts`. O atalho `expectGeral` confere que a página está no `#geral`.

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
