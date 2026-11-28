# 06: Convidar logo depois de criar

**Status:** a fazer

**O que construir:** depois de criar o Canal privado, a Pessoa cai nele e "Convidar pessoas" abre
em seguida, no modo de criação, com "Pular" e sem o aviso de histórico. Convidando, o Aviso fica no
começo do histórico; pulando, o Canal fica só com ela.

Fonte: PRD da F03, H1, H3 e H5; spec da F03, "BFF e telas" (Criar e Convidar pessoas).

**Decisões consumidas de outras tarefas:**
- Frame do modo de criação: tarefa 01.
- Diálogo "Convidar pessoas": tarefa 05.

**Bloqueada por:** 05 (Convidar pela lista de Participantes)

- [ ] **CA1** · No sucesso de um Canal privado, a ação de criar leva a `/canais/<id>?convidar=1`, e a
  página abre "Convidar pessoas" no modo de criação, com "Pular" no lugar de "Cancelar" e sem o
  aviso de histórico. O parâmetro sai do endereço quando o diálogo fecha. O Canal público continua
  sem o diálogo.
- [ ] **CA2** · A suíte do Playwright cobre: criar e convidar, com o Aviso no começo do histórico;
  criar e pular, sem Aviso; e o fluxo só pelo teclado, do Switch ao "Pular".
- [ ] **CA3** · Registro na pasta desta tarefa: a validação visual do modo de criação, nos dois
  temas.
