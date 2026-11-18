# 04: Sair

**Status:** em andamento

**O que construir:** a Pessoa sai pelo item "Sair" do menu do usuário e volta à tela Entrar. A
Sessão deste navegador acaba, e as outras abas vão para Entrar na próxima ação. As Sessões da
mesma Pessoa em outros navegadores continuam valendo. Voltar pelo histórico não mostra conteúdo do
chat.

Fonte: PRD da F01, H5; spec da F01, "Sessões" (rotas) e "BFF e telas" (menu do usuário); LLD,
"Sessão e login" e "Cliente".

**Decisões consumidas de outras tarefas:**
- Guard, Sessão pelo cookie e reação da web ao 401: tarefa 03.
- Estrutura do UserMenu e a ordem dos itens ("Trocar senha" antes de "Sair"): tarefa 03 e a spec.

**Bloqueada por:** 03 (Entrar com e-mail e senha)

- [ ] **CA1** · `DELETE /v1/sessions/current` apaga a Sessão da requisição e responde 204. A mesma
  Sessão passa a responder 401, e outra Sessão da mesma Pessoa continua valendo. Provado por e2e.
- [ ] **CA2** · O item "Sair" do UserMenu chama a Server Action Sair, que apaga a Sessão na API,
  apaga o cookie e leva a `/entrar`. Se a API falhar por rede ou com um 5xx, o cookie é apagado do
  mesmo jeito.
- [ ] **CA3** · As telas com Sessão não ficam no cache do navegador. Depois de sair, voltar pelo
  histórico não mostra conteúdo do chat.
- [ ] **CA4** · O plano de testes e2e ganha, e a suíte cobre: sair leva a Entrar, a outra aba vai
  para Entrar na próxima ação, e voltar pelo histórico não mostra conteúdo. O item é usável por
  teclado, e o axe-core continua sem violações na Home com o menu aberto.
