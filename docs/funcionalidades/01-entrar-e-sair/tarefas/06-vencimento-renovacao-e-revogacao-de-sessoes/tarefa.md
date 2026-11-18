# 06: Vencimento, renovação e revogação de Sessões

**Status:** em andamento

**O que construir:** a Sessão de quem usa o chat é renovada pelo uso, e a de quem fica sem usar
vence. O Operador revoga as Sessões de uma Pessoa, redefine a senha dela e apaga as Sessões
vencidas pelo comando de contas. Em qualquer desses casos, a próxima ação da Pessoa no navegador a
leva para Entrar.

Fonte: PRD da F01, H3 (vencimento e renovação) e H7; spec da F01, histórias 9 a 11, "Comando de
contas" e "Decisões de teste"; LLD, "Sessão e login", "Processos de segundo plano" e "Valores e
configuração".

**Decisões consumidas de outras tarefas:**
- Guard, criação da Sessão com `expires_at` e reação da web ao 401: tarefa 03.
- Comando de contas, a leitura da senha atrás de interface e os atalhos de `authRoutes`: tarefa 03.

**Bloqueada por:** 03 (Entrar com e-mail e senha)

- [ ] **CA1** · Renovação e vencimento, provados por e2e com as linhas envelhecidas por atalhos da
  base de testes:
  - a validade é renovada quando passou o `intervalo de renovação da sessão`, e não antes;
  - a Sessão sem uso pela `duração da sessão` responde `unauthenticated` e é apagada.
- [ ] **CA2** · Um serviço de Sessões apaga todas as Sessões de uma Pessoa, ou todas exceto uma.
  Esta tarefa usa a forma "todas", e a tarefa 07 usa a forma "exceto uma".
- [ ] **CA3** · O comando de contas, provado por testes de integração:
  - `revoke-sessions` apaga todas as Sessões da Pessoa e diz quantas eram;
  - `reset-password` troca a senha, lida sem eco, e apaga todas as Sessões;
  - `purge-expired-sessions` apaga só as vencidas e diz quantas eram;
  - os erros dizem o que corrigir e saem com código diferente de zero.
- [ ] **CA4** · As operações novas estão no `AGENTS.md` da API, seção "Comandos", com exemplos.
- [ ] **CA5** · O plano de testes e2e ganha, e a suíte cobre: uma Sessão revogada, com as linhas
  mexidas no Arrange, leva a Entrar na próxima ação.
