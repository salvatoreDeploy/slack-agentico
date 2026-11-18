# Plano da F01-T04: Sair

Tarefa: [tarefa.md](tarefa.md) · Spec: [spec.md](../../spec.md) · PRD: [prd.md](../../prd.md)

## Critérios

### CA1

**Marca:** teste HTTP

**Cenário:** Dado uma Pessoa com duas Sessões (entrou duas vezes), quando ela faz
`DELETE /v1/sessions/current` com o cookie da primeira, então a resposta é 204 sem corpo, a linha
da primeira some do banco, `GET /v1/me` com o cookie da primeira responde 401 `unauthenticated` e
com o da segunda responde 200. Sem o cookie, `DELETE /v1/sessions/current` responde 401
`unauthenticated`.

**Teste previsto:** e2e da API, `test/sessions-current.e2e-spec.ts`, "responde 204 e apaga só a
Sessão da requisição", "a Sessão apagada passa a responder 401 e a outra continua valendo",
"responde 401 sem o cookie".

### CA2

**Marca:** teste no Playwright e revisão humana

**Cenário:** Dado uma Pessoa com Sessão na Home, quando ela abre o UserMenu e escolhe o item de
sair, então ela cai em `/entrar`, o cookie `session` some do navegador e a linha da Sessão some do
banco.

Para a falha da API, quem revisa encontra na pasta da tarefa `verificacao-sair-com-api-fora.md`: o
agente para o processo da API do chat, escolhe o item de sair e confere que a página cai em
`/entrar` e o cookie some; depois sobe a API de novo e confere que a linha da Sessão continua no
banco (LLD, "Sessão no cliente"). O 5xx segue o mesmo caminho do código que a falha de rede.

**Teste previsto:** Playwright, `e2e/01-entrar-e-sair/sair-leva-a-entrar.spec.ts`.

### CA3

**Marca:** teste no Playwright

**Cenário:** Dado uma Pessoa com Sessão que abriu a Home, quando ela sai e volta pelo histórico do
navegador, então a página é `/entrar`, sem o Rail, a Sidebar nem o botão "Menu de <nome>". A
resposta do documento da Home, guardada no Arrange, traz `Cache-Control` com `no-store`.

**Teste previsto:** Playwright, `e2e/01-entrar-e-sair/voltar-pelo-historico-nao-mostra-o-chat.spec.ts`.

### CA4

**Marca:** teste no Playwright

**Cenário:**
- Dado duas abas do mesmo navegador com Sessão, quando a Pessoa sai numa e recarrega a outra, então
  a outra vai para `/entrar`.
- Dado a Home, quando a Pessoa põe o foco no avatar, abre o menu com Enter, desce até o item de
  sair com as setas e aperta Enter, então ela cai em `/entrar`.
- Dado a Home com o UserMenu aberto, quando o axe-core roda, então não há violações.

O plano de testes e2e da F01 ganha a seção "Sair (F01-T04)" com os quatro cenários desta tarefa
(os do CA2 ao CA4).

**Teste previsto:** Playwright, `e2e/01-entrar-e-sair/outra-aba-vai-para-entrar.spec.ts`,
`sai-pelo-teclado.spec.ts`, `acessibilidade-menu-do-usuario.spec.ts`; plano em
`e2e/plans/01-entrar-e-sair.plan.md`.

## Contrato

### DELETE /v1/sessions/current · nova

| Item | O que descreve |
| --- | --- |
| Autenticação | Cookie de sessão (`session`) |
| Resposta de sucesso | 204, sem corpo |
| Erros | 401 `unauthenticated` |

## Verificação do contrato

- `DELETE /v1/sessions/current` 204: CA1. 401: CA1.

## Decisões

- **A Sessão da requisição no guard.** O `authenticate` passa a devolver a Sessão com a Pessoa, e o
  guard põe na requisição a Pessoa e o id da Sessão. A saída apaga por esse id, e a troca de senha
  (F01-T07) reaproveita o mesmo id para a forma "exceto uma".
- **Sair na API.** `SessionsService.logout(sessionId)` apaga a linha pelo id. A rota passa pelo
  guard como qualquer outra, sem tratamento próprio para a Sessão vencida: a vencida já responde
  401 no guard.
- **Server Action Sair.** `signOut()` lê o cookie, chama `deleteSession(token)` do service HTTP da
  web, apaga o cookie com os mesmos atributos de `sessionCookieOptions()` (o `Domain` tem de ser o
  mesmo para o navegador apagar) e chama `redirect("/entrar")`. `deleteSession` nunca lança: a
  falha de rede, o 5xx e o 401 terminam do mesmo jeito, com o cookie apagado (LLD, "Sessão no
  cliente"). Sem cookie, a ação só redireciona.
- **Voltar pelo histórico.** As telas com Sessão já são dinâmicas, porque o layout lê o cookie. O
  Next invalida o cache do roteador do cliente quando uma Server Action grava ou apaga um cookie,
  então o voltar depois de Sair pede a Home de novo ao servidor, e o proxy, sem cookie, manda para
  Entrar. O CA3 prova isso. Se o teste mostrar a casca, a Server Action passa a terminar numa
  navegação completa e o proxy grava `Cache-Control: no-store` nas telas com Sessão.
- **O item no menu.** Com o ícone `LogOut`, como no frame "Casca / Menu do usuário / Disponível".
  Entre o cabeçalho e o item entra o separador do frame. O item é
  um `DropdownMenuItem` do Radix cujo `onSelect` chama a ação numa transição, o que já dá o uso por
  teclado. A F01-T07 põe "Trocar senha" antes dele.
- **Conferência visual do menu.** O menu aberto é comparado com o frame acima, nos dois temas e em
  1440 × 900, só no que a F01 mostra (cabeçalho sem Presença, separador e item de sair). O registro
  fica em `validacao-visual.md`, na pasta da tarefa, e as capturas seguem a regra do `AGENTS.md` da
  raiz.
- **O texto do item** é "Sair do Full Cycle", o do frame, dono do microtexto (LLD, "Onde mora cada
  fato"). O CA2 continua dizendo "Sair", porque só nomeia o item.

## Arquivos e interfaces

**API do chat**

- `src/sessions/sessions.service.ts`: `authenticate(token)` passa a devolver `Session` (com
  `person`); novo `logout(sessionId)`.
- `src/sessions/session.guard.ts`: `AuthenticatedRequest` ganha `sessionId`.
- `src/sessions/sessions.repository.ts`: `deleteById` passa a ser usado pela saída.
- `src/sessions/sessions.controller.ts`: `@Delete('sessions/current')`, `@HttpCode(204)`,
  `@ApiNoContentResponse` e `@ApiProblemResponse(401, ['unauthenticated'])`.
- `openapi.json`: regravado.
- `test/sessions-current.e2e-spec.ts`: novo.

**Web**

- `src/app/services/chat-api.ts`: `deleteSession(token): Promise<void>`.
- `src/app/actions/sign-out.ts`: a Server Action `signOut()`.
- `src/app/components/dropdown-menu.tsx`: `DropdownMenuItem` e `DropdownMenuSeparator`, com os
  estados de interação do design system.
- `src/app/components/user-menu.tsx`: o separador e o item de sair.
- `e2e/fixtures.ts`: `findSessions(database, person)`, para o teste conferir a linha.
- `e2e/01-entrar-e-sair/sair-leva-a-entrar.spec.ts`, `voltar-pelo-historico-nao-mostra-o-chat.spec.ts`,
  `outra-aba-vai-para-entrar.spec.ts`, `sai-pelo-teclado.spec.ts`,
  `acessibilidade-menu-do-usuario.spec.ts`: novos.
- `e2e/plans/01-entrar-e-sair.plan.md`: a seção "Sair (F01-T04)".

**Pasta da tarefa**

- `verificacao-sair-com-api-fora.md` e `validacao-visual.md`.

## Testes existentes que mudam

- `test/openapi.e2e-spec.ts`: o mesmo teste, contra o snapshot regravado com a rota nova.

## Mudança de dados

Nenhuma.

## Documentos atualizados

Nenhum. A rota e a regra de saída já estão no LLD ("Sessão e login", "Sessão no cliente" e
"Interfaces"); a situação "planejada" muda para "existe" no PR da tarefa.
