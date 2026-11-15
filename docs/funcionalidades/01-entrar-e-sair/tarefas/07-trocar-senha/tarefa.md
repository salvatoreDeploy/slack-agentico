# 07: Trocar senha

**Status:** a fazer

**O que construir:** a Pessoa troca a própria senha pelo diálogo "Trocar senha", aberto pelo menu
do usuário, informando a senha atual e a nova. Depois da troca, as outras Sessões dela são
encerradas, e a atual continua. Uma senha atual errada não muda nada, e as tentativas erradas
contam no mesmo limite do login.

Fonte: PRD da F01, H6 e H8; spec da F01, "Sessões" (rota `PUT /v1/me/password`) e "BFF e telas"
(diálogo "Trocar senha"); LLD, "Sessão e login" (seção "Sair, trocar a senha e revogar").

**Decisões consumidas de outras tarefas:**
- Registro de falhas compartilhado com o login: tarefa 05.
- Serviço que apaga as Sessões de uma Pessoa, exceto uma: tarefa 06.
- Estrutura do UserMenu e a ordem dos itens: tarefa 03 e a spec.
- Ferramenta de design: tarefa 02.

**Bloqueada por:** 05 (Limite de tentativas), 06 (Vencimento, renovação e revogação de Sessões)

- [ ] **CA1** · `PUT /v1/me/password`, provado por e2e:
  - responde 204, a senha nova passa a entrar e a antiga não;
  - as outras Sessões da Pessoa passam a responder 401, e a atual continua;
  - senha atual errada responde `wrong_current_password`, senha igual responde
    `password_unchanged`, e senha fora do `tamanho da senha` responde `validation_failed`.
- [ ] **CA2** · As senhas atuais erradas contam no limite do login. Com o e-mail bloqueado, a troca
  responde `too_many_attempts`, com `Retry-After`. Provado por e2e.
- [ ] **CA3** · O diálogo "Trocar senha" é desenhado na ferramenta de design antes do código, com
  os componentes e as variables locais.
- [ ] **CA4** · O item "Trocar senha" do UserMenu abre o diálogo, com os estados da spec: enviando,
  senha atual errada, senha igual, senha curta, tentativas demais e sucesso com toast. O foco fica
  preso no diálogo, começa na senha atual e volta ao avatar ao fechar pelo Esc.
- [ ] **CA5** · O plano de testes e2e ganha, e a suíte cobre: a troca com sucesso e o próximo login
  com a senha nova, a senha atual errada, e o diálogo só pelo teclado. O axe-core fica sem
  violações no diálogo.
- [ ] **CA6** · A validação visual do diálogo, nos dois temas, fica registrada na pasta desta
  tarefa.
