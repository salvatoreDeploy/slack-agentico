# 05: Limite de tentativas

**Status:** em andamento

**O que construir:** quem erra a senha várias vezes seguidas para o mesmo e-mail é bloqueado por um
tempo, mesmo com a senha certa, e a tela Entrar avisa. O bloqueio passa sozinho. Um e-mail
inexistente recebe o mesmo tratamento, e o bloqueio não revela quais contas existem.

Fonte: PRD da F01, H8; spec da F01, "Limite de tentativas de login" e "BFF e telas" (estado
"Tentativas demais"); LLD, "Sessão e login" (seção "Registro das falhas") e "Valores e
configuração"; ADR 0023.

**Decisões consumidas de outras tarefas:**
- Fluxo de `POST /v1/sessions`, a validação de entrada e a fixture `person`: tarefa 03.
- Corpo de erro e mapa de status: tarefa 01.

**Bloqueada por:** 03 (Entrar com e-mail e senha)

- [ ] **CA1** · A tabela `login_attempts` da spec, criada pela migração, com uma linha por e-mail
  atualizada numa operação atômica.
- [ ] **CA2** · O limite, provado por e2e, com as linhas envelhecidas por atalhos da base de
  testes:
  - a falha que completa as `tentativas de login` dentro da janela bloqueia;
  - durante o bloqueio, até a senha certa recebe 429 `too_many_attempts`, com `Retry-After`;
  - as tentativas durante o bloqueio não o estendem;
  - passado o bloqueio, a senha certa entra;
  - um login certo antes do limite zera a contagem;
  - o limite vale também para e-mail sem conta;
  - duas falhas simultâneas contam as duas;
  - a entrada inválida não conta como falha.
- [ ] **CA3** · Cada bloqueio gera um log `warn`, com o hash do e-mail e não o e-mail.
- [ ] **CA4** · A tela Entrar mostra o estado "Tentativas demais", com o texto, o lugar e os
  atributos de acessibilidade da spec. O frame "Login / Tentativas demais" é desenhado antes do
  código, se não existir.
- [ ] **CA5** · A fixture `person` também apaga as tentativas do e-mail ao fim do teste. O plano de
  testes e2e ganha, e a suíte cobre, o estado "Tentativas demais". A validação visual desse estado
  fica registrada na pasta desta tarefa.
