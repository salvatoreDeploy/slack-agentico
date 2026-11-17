# Entrar e sair (F01): plano de testes e2e

Plano de testes e2e da F01 (`apps/web/AGENTS.md`, "Testes de ponta a ponta"). A spec da F01
(`docs/funcionalidades/01-entrar-e-sair/spec.md`, "Decisões de teste") é dona do que é coberto;
este plano é dono dos passos de cada cenário. Cada tarefa de tela acrescenta os cenários dela.

**Seed:** `e2e/seed.spec.ts`

**Fixtures:** `person` (uma Pessoa gravada no banco `chat`, apagada ao fim) e `loggedInPage` (uma
página que já entrou pelo formulário), em `e2e/fixtures.ts`.

## 1. Entrar com e-mail e senha (F01-T03)

### 1.1 entra-com-email-e-senha

**File:** `e2e/01-entrar-e-sair/entra-com-email-e-senha.spec.ts`

Steps:
1. Abrir `/entrar` e preencher E-mail e Senha com a Pessoa da fixture.
2. Clicar em "Entrar".

Expected: a página é a Home (`/`), com o botão "Menu de <nome>"; o cookie `session` tem
`httpOnly`, `secure`, `SameSite=Lax` e `Path=/`, e `document.cookie` não o mostra.

### 1.2 com-sessao-abre-entrar-e-vai-para-home

**File:** `e2e/01-entrar-e-sair/com-sessao-abre-entrar-e-vai-para-home.spec.ts`

Steps:
1. Com Sessão (`loggedInPage`), abrir `/entrar`.

Expected: a página volta para a Home.

### 1.3 entra-so-pelo-teclado

**File:** `e2e/01-entrar-e-sair/entra-so-pelo-teclado.spec.ts`

Steps:
1. Abrir `/entrar` e digitar o e-mail no campo que já tem o foco.
2. Tab: o foco vai para a Senha; digitar a senha.
3. Tab: o foco vai para "Entrar"; Enter.

Expected: a página é a Home.

## 2. Volta à página pedida (F01-T03)

### 2.1 volta-a-pagina-pedida

**File:** `e2e/01-entrar-e-sair/volta-a-pagina-pedida.spec.ts`

Steps:
1. Sem Sessão, abrir `/?aba=conversas`.
2. Entrar pelo formulário.

Expected: o passo 1 cai em `/entrar?voltar=%2F%3Faba%3Dconversas`; depois de entrar, a página é
`/?aba=conversas`.

### 2.2 ignora-voltar-externo

**File:** `e2e/01-entrar-e-sair/ignora-voltar-externo.spec.ts`

Steps:
1. Abrir `/entrar?voltar=<valor>` e entrar pelo formulário, com cada valor: `//outro-site.example`,
   `/%09/outro-site.example` (o tab que o navegador remove) e `/%5Coutro-site.example`.

Expected: a página é a Home nos três casos.

## 3. Tela Entrar (F01-T03)

### 3.1 foco-inicial-no-email

**File:** `e2e/01-entrar-e-sair/foco-inicial-no-email.spec.ts`

Steps:
1. Abrir `/entrar`.

Expected: o E-mail tem o foco.

### 3.2 avisa-campo-vazio

**File:** `e2e/01-entrar-e-sair/avisa-campo-vazio.spec.ts`

Steps:
1. Abrir `/entrar`, pôr o foco na Senha e clicar em "Entrar" com os dois campos vazios.

Expected: "Informe seu e-mail." e "Informe sua senha." aparecem; o E-mail tem o foco e
`aria-invalid`; a página continua em `/entrar`.

### 3.3 credenciais-incorretas

**File:** `e2e/01-entrar-e-sair/credenciais-incorretas.spec.ts`

Steps:
1. Abrir `/entrar`, preencher o e-mail da Pessoa e uma senha errada e clicar em "Entrar".

Expected: "E-mail ou senha incorretos." aparece abaixo da Senha e é a descrição acessível dela; a
Senha fica vazia e com o foco; o E-mail continua preenchido.

### 3.4 falha-no-envio

**File:** `e2e/01-entrar-e-sair/falha-no-envio.spec.ts`

Steps:
1. Abrir `/entrar` e fazer o envio da ação Entrar cair (a rota `POST` da página abortada).
2. Preencher e-mail e senha e clicar em "Entrar".

Expected: um `role="alert"` com "Não foi possível entrar agora. Tente de novo em instantes."; o
e-mail continua preenchido; a página continua em `/entrar`.

## 4. Home e menu do usuário (F01-T03)

### 4.1 home-mostra-a-casca

**File:** `e2e/01-entrar-e-sair/home-mostra-a-casca.spec.ts`

Steps:
1. Com Sessão, olhar a Home.

Expected: o Rail ("Seções") tem "FC" e o link "Início" com `aria-current="page"`; a Sidebar
("Conversas") tem o cabeçalho "Full Cycle"; a área principal mostra "Nenhuma conversa ainda".

### 4.2 menu-do-usuario-abre-pelo-teclado

**File:** `e2e/01-entrar-e-sair/menu-do-usuario-abre-pelo-teclado.spec.ts`

Steps:
1. Com Sessão, pôr o foco em "Menu de <nome>" e apertar Enter; depois Esc.
2. Em outro teste, clicar em "Menu de <nome>".

Expected: o menu abre com o nome da Pessoa e fecha com o Esc.

## 5. Sessão no navegador todo (F01-T03)

### 5.1 segunda-aba-com-sessao

**File:** `e2e/01-entrar-e-sair/segunda-aba-com-sessao.spec.ts`

Steps:
1. Com Sessão, abrir uma segunda aba no mesmo contexto e ir à Home.

Expected: a segunda aba mostra a casca, com o menu da Pessoa.

### 5.2 navegador-reaberto-com-sessao

**File:** `e2e/01-entrar-e-sair/navegador-reaberto-com-sessao.spec.ts`

Steps:
1. Com Sessão, guardar o estado do contexto e fechá-lo.
2. Abrir um contexto novo com o estado guardado e ir à Home.

Expected: a casca aparece, com o menu da Pessoa.

### 5.3 sessao-invalida-volta-para-entrar

**File:** `e2e/01-entrar-e-sair/sessao-invalida-volta-para-entrar.spec.ts`

Steps:
1. Com Sessão, apagar as Sessões da Pessoa no banco.
2. Abrir `/?aba=conversas`.

Expected: a página cai em `/entrar?voltar=%2F%3Faba%3Dconversas`, e o cookie `session` some.

### 5.4 sessao-valida-nao-sai-por-link

**File:** `e2e/01-entrar-e-sair/sessao-valida-nao-sai-por-link.spec.ts`

Steps:
1. Com Sessão, abrir `/api/sessao/expirada?voltar=%2F%3Faba%3Dconversas`, como faria um link de
   outro site.

Expected: a página volta para `/?aba=conversas`, com a casca, e o cookie `session` continua.

## 6. Acessibilidade (F01-T03)

### 6.1 acessibilidade-entrar-e-home

**File:** `e2e/01-entrar-e-sair/acessibilidade-entrar-e-home.spec.ts`

Steps:
1. Rodar o axe-core na tela Entrar.
2. Com Sessão, rodar o axe-core na Home.

Expected: nenhuma violação nas duas.
