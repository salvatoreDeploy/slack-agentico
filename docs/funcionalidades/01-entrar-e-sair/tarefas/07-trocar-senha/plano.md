# Plano da F01-T07: Trocar senha

Tarefa: [tarefa.md](tarefa.md) · Spec: [spec.md](../../spec.md) · PRD: [prd.md](../../prd.md)

## Critérios

### CA1

**Marca:** teste HTTP

**Cenário:** Dado uma Pessoa com duas Sessões (entrou duas vezes), quando ela faz
`PUT /v1/me/password` com o cookie da primeira:
- com a senha atual certa e uma senha nova válida, a resposta é 204; a senha nova passa a entrar e
  a antiga responde 401 `invalid_credentials`;
- no mesmo caso, `GET /v1/me` com o cookie da segunda responde 401 `unauthenticated`, e com o da
  primeira responde 200;
- com a senha atual errada, a resposta é 422 `wrong_current_password`, e a senha antiga continua
  entrando;
- com a senha nova igual à atual, a resposta é 422 `password_unchanged`;
- com a senha nova abaixo do mínimo ou acima do teto do `tamanho da senha`, ou com a senha atual
  vazia, a resposta é 400 `validation_failed`;
- sem o cookie, a resposta é 401 `unauthenticated`.

**Teste previsto:** e2e da API, `test/me-password.e2e-spec.ts`, um caso por situação acima.

### CA2

**Marca:** teste HTTP

**Cenário:** Dado uma Pessoa com Sessão, quando ela faz `PUT /v1/me/password`:
- com a senha atual errada, a linha de `login_attempts` do e-mail dela fica com `failures` = 1;
- com 2 falhas de login no e-mail dela e a senha atual certa, a resposta é 204, e a linha do e-mail
  some;
- com 4 falhas de login no e-mail dela e a senha atual errada, a resposta é 429
  `too_many_attempts`, com `Retry-After`;
- com o e-mail bloqueado e a senha atual certa, a resposta é 429 `too_many_attempts`, com
  `Retry-After`, e a senha não muda.

**Teste previsto:** e2e da API, `test/me-password.e2e-spec.ts`, um caso por situação acima, com os
atalhos de `test/support/login-attempts.ts`.

### CA3

**Marca:** revisão humana

**Cenário:** Quem revisa abre o `slack-ia.pen`, seção "Diálogos da casca", e encontra os frames
`Diálogos / Trocar senha / <Estado>`, desenhados antes do código com o Dialog, o DialogHeader, os
campos e os botões do arquivo e as variables dele, sem cor, tamanho ou raio soltos: Padrão,
Enviando, Senha atual errada, Senha igual, Senha curta, Tentativas demais, Falha no envio e
Sucesso (a Home com o toast). O menu do usuário com o item "Trocar senha" antes de "Sair do Full Cycle" aparece no frame
`Diálogos / Trocar senha / Menu`. Os textos são os da decisão "Microtexto", com o que quem revisa
mudar no próprio frame.

### CA4

**Marca:** teste no Playwright

**Cenário:** Dado uma Pessoa com Sessão na Home, quando ela escolhe "Trocar senha" no UserMenu, o
diálogo abre com o foco na Senha atual, e:
- com a senha atual errada, aparece o erro do frame abaixo da Senha atual, que fica com
  `aria-invalid`;
- com a senha nova igual à atual, aparece o erro do frame abaixo da Senha nova;
- com a senha nova curta, o erro do frame aparece abaixo da Senha nova sem enviar;
- com o e-mail bloqueado (linha gravada no Arrange), aparece um `role="alert"` com o texto do frame
  no corpo do diálogo;
- com o envio da Server Action derrubado no navegador, aparece um `role="alert"` com o texto do
  frame "Falha no envio" no corpo do diálogo, e os dois campos continuam preenchidos;
- com sucesso, o diálogo fecha, o toast do frame aparece e o foco volta ao avatar;
- Tab e Shift+Tab não saem do diálogo, e o Esc o fecha com o foco de volta no avatar.

O estado "Enviando" (o "Salvar" em `loading` e o envio duplo bloqueado) é conferido na validação
visual do CA6, como na tela Entrar.

**Teste previsto:** Playwright, `e2e/01-entrar-e-sair/trocar-senha-senha-atual-errada.spec.ts`,
`trocar-senha-senha-igual.spec.ts`, `trocar-senha-senha-curta.spec.ts`,
`trocar-senha-tentativas-demais.spec.ts`, `trocar-senha-falha-no-envio.spec.ts`,
`trocar-senha-com-sucesso.spec.ts` e `trocar-senha-pelo-teclado.spec.ts`.

### CA5

**Marca:** teste no Playwright

**Cenário:** O plano de testes e2e da F01 ganha a seção "Trocar senha (F01-T07)" com os cenários
do CA4 e mais:
- depois da troca com sucesso, a Pessoa sai e entra de novo com a senha nova, e cai na Home
  (`trocar-senha-com-sucesso`);
- o diálogo inteiro só pelo teclado: abrir o menu pelo avatar, escolher "Trocar senha", preencher,
  Tab até "Salvar", Enter (`trocar-senha-pelo-teclado`);
- o axe-core sem violações com o diálogo aberto.

**Teste previsto:** Playwright, os arquivos do CA4 e
`e2e/01-entrar-e-sair/acessibilidade-dialogo-trocar-senha.spec.ts`; plano em
`e2e/plans/01-entrar-e-sair.plan.md`.

### CA6

**Marca:** revisão humana

**Cenário:** Quem revisa encontra na pasta da tarefa `validacao-visual.md`: o diálogo em cada
estado do CA3 (inclusive "Enviando"), o menu com o item novo e o toast, em 1440 × 900 e nos dois
temas, comparados com os frames, e como cada estado foi produzido. As capturas seguem a regra do
`AGENTS.md` da raiz.

## Contrato

### PUT /v1/me/password · nova

| Item | O que descreve |
| --- | --- |
| Autenticação | Cookie de sessão (`session`) |
| Corpo da requisição | `current_password` (string, obrigatório, não vazia, até o teto do `tamanho da senha`) e `new_password` (string, obrigatório, dentro do `tamanho da senha`) |
| Resposta de sucesso | 204, sem corpo |
| Cabeçalhos de resposta | `Retry-After` (inteiro, segundos até o fim do bloqueio), só no 429 |
| Erros | 400 `validation_failed`; 401 `unauthenticated`; 422 `wrong_current_password`, `password_unchanged`; 429 `too_many_attempts` |

## Verificação do contrato

- `PUT /v1/me/password` 204: CA1. 400, 401 e os dois 422: CA1. 429 com `Retry-After`: CA2.

## Decisões

- **Onde mora.** A rota fica no `SessionsController`, ao lado de `GET /v1/me`, e a regra num
  `SessionsService.changePassword(session, currentPassword, newPassword)`, porque ela junta o
  limite de tentativas, a senha da Pessoa e a revogação, que já estão no módulo `sessions` ou são
  usadas por ele.
- **Ordem** (LLD, "Sessão e login", "Sair, trocar a senha e revogar"): a entrada é validada pelo
  DTO; com o e-mail bloqueado, responde `too_many_attempts` sem conferir a senha; senha atual
  errada registra a falha e responde `wrong_current_password` (ou `too_many_attempts`, se a falha
  bloqueou); senha atual certa apaga as falhas do e-mail; senha nova igual à atual responde `password_unchanged`; senão, numa transação
  (`@Transactional`), grava o hash novo com `PeopleService.setPassword` e chama
  `SessionsService.revokeAll(personId, { except: sessionId })`.
- **Códigos novos.** `wrong_current_password` e `password_unchanged`, os dois 422, entram no
  `ErrorCode` e no mapa do filter, com os erros de domínio no módulo `sessions`.
- **DTO.** `ChangePasswordDto`, com os campos em `snake_case` (LLD, "Interfaces") e os
  `@ApiProperty` com o tipo explícito, como o `LoginDto`.
- **Diálogo.** O Dialog do Radix, num componente `Dialog` do design system (largura máxima de 512,
  `rounded-card`, `shadow-3`, `pop-in`), aberto em estado controlado pelo `UserMenu`: o item
  "Trocar senha" fecha o menu e abre o diálogo. O foco inicial vai para a Senha atual pelo
  `onOpenAutoFocus`, e ao fechar volta ao avatar pelo `onCloseAutoFocus`, porque o item que abriu
  o diálogo some com o menu.
- **Server Action Trocar senha.** `changePassword(previous, formData)` chama `changePassword` do
  service HTTP da web, com o cookie repassado, e devolve o estado do diálogo. Um 401 apaga o cookie
  e manda para `/entrar` (LLD, "Sessão no cliente"). O formulário envia pelo `onSubmit` numa
  transição, como a tela Entrar, para os campos não serem limpos depois de um erro.
- **Toast.** Entra o `sonner`, com um `Toaster` no layout da casca, no canto inferior direito e com
  botão de fechar (design system, "Comportamentos registrados"), e um `toast.success` do cliente
  quando a ação devolve sucesso.
- **Microtexto proposto** para os frames, donos dele, que quem revisa pode mudar no CA3:
  - item do menu: "Trocar senha", com o ícone `KeyRound`;
  - título: "Trocar senha"; descrição: "Depois da troca, você continua neste navegador e sai dos
    outros.";
  - campos: "Senha atual" e "Senha nova"; botões: "Cancelar" e "Salvar";
  - Senha atual vazia: "Informe sua senha atual."; errada: "Senha atual incorreta.";
  - Senha nova curta ou longa: "A senha nova tem de ter de 8 a 128 caracteres."; igual: "A senha
    nova tem de ser diferente da atual.";
  - tentativas demais: "Muitas tentativas. Aguarde alguns minutos e tente de novo.";
  - falha no envio: "Não foi possível trocar a senha agora. Tente de novo em instantes.";
  - toast de sucesso: "Senha trocada. Você saiu dos outros navegadores.".
- **Validação no cliente.** Senha atual vazia e senha nova fora do `tamanho da senha` são
  recusadas no navegador, sem enviar, com o foco no primeiro campo inválido; a Server Action
  confere de novo, como na tela Entrar.
- **Fixture.** A `person` continua apagando a Pessoa pelo id, então a senha trocada no teste não
  muda a limpeza.
- **Validação visual.** Depende do MCP do Pencil, com o `slack-ia.pen` aberto; sem ele, a tarefa
  para no CA3 e avisa.
- **A senha atual certa apaga as falhas do e-mail,** como o login certo, porque acertar a senha
  atual prova o mesmo que acertar o login. O LLD, "Sessão e login", passa a dizer isso.
- **Estado "Falha no envio".** A falha de rede ou do servidor ao salvar mostra "Não foi possível
  trocar a senha agora. Tente de novo em instantes." no corpo do diálogo, com `role="alert"` e os
  campos preenchidos, com o frame `Diálogos / Trocar senha / Falha no envio`. O teste derruba o
  envio da Server Action no navegador, como o `falha-no-envio` da tela Entrar.

## Arquivos e interfaces

**API do chat**

- `src/sessions/sessions.dto.ts`: `ChangePasswordDto`.
- `src/sessions/sessions.errors.ts`: `WrongCurrentPasswordError` e `PasswordUnchangedError`.
- `src/sessions/sessions.service.ts`: `changePassword(session, currentPassword, newPassword)`.
- `src/sessions/sessions.controller.ts`: `@Put('me/password')`, `@HttpCode(204)`, com o 400, o 401,
  os 422 e o 429 com `Retry-After` no contrato.
- `src/common/errors/error-code.ts` e `problem-details.filter.ts`: os dois códigos novos.
- `openapi.json`: regravado.
- `test/me-password.e2e-spec.ts`: novo.

**Web**

- `package.json`: `sonner`.
- `src/app/components/dialog.tsx`: `Dialog`, `DialogContent`, `DialogHeader`, `DialogBody` e
  `DialogFooter`, sobre o Radix.
- `src/app/components/toaster.tsx`: o `Toaster` do Sonner, com o tema da raiz.
- `src/app/components/change-password-dialog.tsx`: o diálogo, com os estados.
- `src/app/components/user-menu.tsx`: o item "Trocar senha" antes de "Sair do Full Cycle" e o
  estado do diálogo.
- `src/app/actions/change-password.ts`: a Server Action.
- `src/app/services/chat-api.ts`: `changePassword(token, currentPassword, newPassword)`, com um
  resultado por resposta.
- `src/app/utils/change-password-validation.ts`: a leitura e a validação dos campos, usadas pelo
  diálogo e pela ação.
- `src/app/(app)/(shell)/layout.tsx`: o `Toaster`.
- `e2e/fixtures.ts`: `openChangePassword(page, person)`.
- `e2e/01-entrar-e-sair/trocar-senha-*.spec.ts` e `acessibilidade-dialogo-trocar-senha.spec.ts`:
  novos.
- `e2e/plans/01-entrar-e-sair.plan.md`: a seção "Trocar senha (F01-T07)".

**Pasta da tarefa**

- `validacao-visual.md`.

## Testes existentes que mudam

- `test/openapi.e2e-spec.ts`: o mesmo teste, contra o snapshot regravado com a rota nova.
- `e2e/01-entrar-e-sair/sai-pelo-teclado.spec.ts`: o item de sair passa a ser o segundo do menu,
  então o teste desce duas vezes com a seta.

## Mudança de dados

Nenhuma.

## Documentos atualizados

- `docs/lld.md`, seção "Sessão e login", "Sair, trocar a senha e revogar": a troca com a senha
  atual certa apaga as falhas do e-mail, como o login certo.

A rota, as outras regras e os estados do diálogo já estão na spec e no LLD ("Sessão e login",
"Interfaces" e "Cliente"); as situações "planejada" mudam no PR da tarefa.
