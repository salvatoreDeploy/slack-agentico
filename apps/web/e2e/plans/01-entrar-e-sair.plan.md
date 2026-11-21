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

Expected: a página é a Home, que leva ao `#geral` (`/canais/<id>`) desde a F02-T02, com o botão "Menu de <nome>"; o cookie `session` tem
`httpOnly`, `secure`, `SameSite=Lax` e `Path=/`, e `document.cookie` não o mostra.

### 1.2 com-sessao-abre-entrar-e-vai-para-home

**File:** `e2e/01-entrar-e-sair/com-sessao-abre-entrar-e-vai-para-home.spec.ts`

Steps:
1. Com Sessão (`loggedInPage`), abrir `/entrar`.

Expected: a página volta para a Home, que leva ao `#geral`.

### 1.3 entra-so-pelo-teclado

**File:** `e2e/01-entrar-e-sair/entra-so-pelo-teclado.spec.ts`

Steps:
1. Abrir `/entrar` e digitar o e-mail no campo que já tem o foco.
2. Tab: o foco vai para a Senha; digitar a senha.
3. Tab: o foco vai para "Entrar"; Enter.

Expected: a página é a Home, que leva ao `#geral`.

## 2. Volta à página pedida (F01-T03)

### 2.1 volta-a-pagina-pedida

**File:** `e2e/01-entrar-e-sair/volta-a-pagina-pedida.spec.ts`

Steps:
1. Sem Sessão, abrir o endereço do `#geral` com `?aba=conversas` (`/canais/<id>?aba=conversas`;
   desde a F02-T02, `/` redireciona e descarta a consulta).
2. Entrar pelo formulário.

Expected: o passo 1 cai em `/entrar?voltar=<o endereço do passo 1, codificado>`; depois de entrar,
a página é o endereço do passo 1.

### 2.2 ignora-voltar-externo

**File:** `e2e/01-entrar-e-sair/ignora-voltar-externo.spec.ts`

Steps:
1. Abrir `/entrar?voltar=<valor>` e entrar pelo formulário, com cada valor: `//outro-site.example`,
   `/%09/outro-site.example` (o tab que o navegador remove) e `/%5Coutro-site.example`.

Expected: a página é a Home, que leva ao `#geral`, nos três casos.

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

Expected: "E-mail ou senha incorretos. Confira os dados e tente de novo." aparece abaixo da Senha e é a descrição acessível dela; a
Senha fica vazia e com o foco; o E-mail continua preenchido.

### 3.4 falha-no-envio

**File:** `e2e/01-entrar-e-sair/falha-no-envio.spec.ts`

Steps:
1. Abrir `/entrar` e fazer o envio da ação Entrar cair (a rota `POST` da página abortada).
2. Preencher e-mail e senha e clicar em "Entrar".

Expected: um `role="alert"` com "Não foi possível entrar agora. Confira sua conexão e tente de novo."; o
e-mail e a senha continuam preenchidos; a página continua em `/entrar`.

## 4. Home e menu do usuário (F01-T03)

### 4.1 home-mostra-a-casca

**File:** `e2e/01-entrar-e-sair/home-mostra-a-casca.spec.ts`

Steps:
1. Com Sessão, olhar a Home.

Expected: o Rail ("Seções") tem "FC" e o link "Início" com `aria-current="page"`; a Sidebar
("Conversas") tem o cabeçalho "Full Cycle"; a página é o `#geral` (desde a F02-T02, a Home leva a
ele).

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

Também prova a revogação (F01-T06): as Sessões apagadas no banco são o estado que o
`revoke-sessions` deixa.

**File:** `e2e/01-entrar-e-sair/sessao-invalida-volta-para-entrar.spec.ts`

Steps:
1. Com Sessão, apagar as Sessões da Pessoa no banco.
2. Abrir `/?aba=conversas`.

Expected: a página cai em `/entrar?voltar=%2F%3Faba%3Dconversas`, e o cookie `session` some.

### 5.4 sessao-valida-nao-sai-por-link

**File:** `e2e/01-entrar-e-sair/sessao-valida-nao-sai-por-link.spec.ts`

Steps:
1. Com Sessão, abrir `/api/sessao/expirada?voltar=<o endereço do #geral com ?aba=conversas>`,
   como faria um link de outro site.

Expected: a página volta para o endereço do `voltar`, com a casca, e o cookie `session` continua.

### 5.5 sessao-vencida-volta-para-entrar (F01-T06)

**File:** `e2e/01-entrar-e-sair/sessao-vencida-volta-para-entrar.spec.ts`

Steps:
1. Com Sessão, envelhecer as Sessões da Pessoa no banco 30 dias e 1 minuto (o `last_used_at` e o
   `expires_at` recuam juntos).
2. Abrir `/?aba=conversas`.

Expected: a página cai em `/entrar?voltar=%2F%3Faba%3Dconversas`, e o cookie `session` some.

## 6. Acessibilidade (F01-T03)

### 6.1 acessibilidade-entrar-e-home

**File:** `e2e/01-entrar-e-sair/acessibilidade-entrar-e-home.spec.ts`

Steps:
1. Rodar o axe-core na tela Entrar.
2. Com Sessão, rodar o axe-core na Home.

Expected: nenhuma violação nas duas.

## 7. Sair (F01-T04)

### 7.1 sair-leva-a-entrar

**File:** `e2e/01-entrar-e-sair/sair-leva-a-entrar.spec.ts`

Steps:
1. Com Sessão, clicar em "Menu de <nome>".
2. Clicar no item "Sair do Full Cycle".

Expected: a página é `/entrar`; o cookie `session` some do navegador; a Sessão some do banco.

### 7.2 voltar-pelo-historico-nao-mostra-o-chat

**File:** `e2e/01-entrar-e-sair/voltar-pelo-historico-nao-mostra-o-chat.spec.ts`

Steps:
1. Com Sessão, abrir a Home e guardar a resposta do documento.
2. Sair pelo menu do usuário.
3. Voltar pelo histórico do navegador.

Expected: a resposta do passo 1 tem `Cache-Control` com `no-store`; depois do passo 3, a página é
`/entrar`, com o `voltar` do `#geral` desde a F02-T02 (a Home leva a ele), sem o botão "Menu de <nome>" nem a navegação "Seções".

### 7.3 outra-aba-vai-para-entrar

**File:** `e2e/01-entrar-e-sair/outra-aba-vai-para-entrar.spec.ts`

Steps:
1. Com Sessão, abrir uma segunda aba no mesmo contexto, na Home.
2. Sair pela primeira aba.
3. Recarregar a segunda aba.

Expected: a segunda aba cai em `/entrar`.

### 7.4 sai-pelo-teclado

**File:** `e2e/01-entrar-e-sair/sai-pelo-teclado.spec.ts`

Steps:
1. Com Sessão, pôr o foco em "Menu de <nome>" e apertar Enter.
2. Descer com a seta até "Sair do Full Cycle" e apertar Enter.

Expected: a página é `/entrar`.

### 7.5 acessibilidade-menu-do-usuario

**File:** `e2e/01-entrar-e-sair/acessibilidade-menu-do-usuario.spec.ts`

Steps:
1. Com Sessão, abrir o menu do usuário.
2. Rodar o axe-core.

Expected: nenhuma violação.

## 8. Limite de tentativas (F01-T05)

### 8.1 tentativas-demais

**File:** `e2e/01-entrar-e-sair/tentativas-demais.spec.ts`

Steps:
1. Gravar no banco o e-mail da Pessoa da fixture como bloqueado.
2. Abrir `/entrar`, preencher o e-mail e a senha certa e clicar em "Entrar".

Expected: um `role="alert"` com "Muitas tentativas de entrar. Aguarde alguns minutos e tente de
novo.", entre a Senha e o botão; o E-mail e a Senha continuam preenchidos; o foco continua em
"Entrar"; a página continua em `/entrar`. Depois do teste, a fixture apagou a linha de tentativas
do e-mail.

## 9. Trocar senha (F01-T07)

Em todos: com Sessão, abrir o menu do usuário e escolher "Trocar senha" (`openChangePassword`).

### 9.1 trocar-senha-com-sucesso

**File:** `e2e/01-entrar-e-sair/trocar-senha-com-sucesso.spec.ts`

Steps:
1. Preencher a Senha atual e uma Senha nova válida e clicar em "Salvar".
2. Sair e entrar de novo com a senha nova.

Expected: no passo 1, o diálogo fecha, o toast "Senha trocada. Você saiu dos outros navegadores."
aparece e o foco volta a "Menu de <nome>"; no passo 2, a página é a Home.

### 9.2 trocar-senha-senha-atual-errada

**File:** `e2e/01-entrar-e-sair/trocar-senha-senha-atual-errada.spec.ts`

Steps:
1. Preencher uma Senha atual errada e uma Senha nova válida e clicar em "Salvar".

Expected: "Senha atual incorreta." abaixo da Senha atual, que fica com `aria-invalid` e o foco; o
diálogo continua aberto.

### 9.3 trocar-senha-senha-igual

**File:** `e2e/01-entrar-e-sair/trocar-senha-senha-igual.spec.ts`

Steps:
1. Preencher a Senha atual e a mesma senha na Senha nova e clicar em "Salvar".

Expected: "A senha nova tem de ser diferente da atual." abaixo da Senha nova, com `aria-invalid`.

### 9.4 trocar-senha-senha-curta

**File:** `e2e/01-entrar-e-sair/trocar-senha-senha-curta.spec.ts`

Steps:
1. Preencher a Senha atual e "curta" na Senha nova e clicar em "Salvar".

Expected: "A senha nova tem de ter de 8 a 128 caracteres." abaixo da Senha nova, sem enviar nada
ao BFF.

### 9.5 trocar-senha-tentativas-demais

**File:** `e2e/01-entrar-e-sair/trocar-senha-tentativas-demais.spec.ts`

Steps:
1. Gravar no banco o e-mail da Pessoa como bloqueado.
2. Preencher a Senha atual e uma Senha nova válida e clicar em "Salvar".

Expected: um `role="alert"` com "Muitas tentativas. Aguarde alguns minutos e tente de novo." no
corpo do diálogo; os campos continuam preenchidos.

### 9.6 trocar-senha-falha-no-envio

**File:** `e2e/01-entrar-e-sair/trocar-senha-falha-no-envio.spec.ts`

Steps:
1. Fazer o envio da ação cair (a rota `POST` da página abortada).
2. Preencher a Senha atual e uma Senha nova válida e clicar em "Salvar".

Expected: um `role="alert"` com "Não foi possível trocar a senha agora. Tente de novo em
instantes."; os dois campos continuam preenchidos.

### 9.7 trocar-senha-pelo-teclado

**File:** `e2e/01-entrar-e-sair/trocar-senha-pelo-teclado.spec.ts`

Steps:
1. Pôr o foco em "Menu de <nome>", Enter, Home até "Trocar senha", Enter.
2. Tab e Shift+Tab a partir do último e do primeiro controle do diálogo.
3. Esc.
4. Abrir de novo pelo teclado, digitar as senhas, Tab até "Salvar" e Enter.

Expected: o foco começa na Senha atual e não sai do diálogo; o Esc fecha com o foco em "Menu de
<nome>"; no passo 4, o toast de sucesso aparece.

### 9.8 acessibilidade-dialogo-trocar-senha

**File:** `e2e/01-entrar-e-sair/acessibilidade-dialogo-trocar-senha.spec.ts`

Steps:
1. Abrir o diálogo e rodar o axe-core no diálogo.

Expected: nenhuma violação.
