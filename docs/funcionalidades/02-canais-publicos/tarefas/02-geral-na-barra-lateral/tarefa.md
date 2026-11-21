# 02: `#geral` na barra lateral

**Status:** em andamento

**O que construir:** a primeira fatia completa da F02. A Pessoa entra e cai no `#geral`, vê a
seção Canais na barra lateral com o Canal aberto selecionado e o cabeçalho do Canal, e o `#geral`
vazio mostra a descrição. Um endereço de Canal inválido mostra o Canal não encontrado. Toda conta
nova já participa dos Canais públicos.

Fonte: PRD da F02, H1, H2 e H4 (endereço próprio, cabeçalho, estado vazio do `#geral` e Canal não
encontrado); spec da F02, "Conversas e participação", "Rotas da API do chat" (`GET /v1/channels`
e `GET /v1/conversations/:id`), "Módulos da API do chat", "Comando de contas e comando de canais",
"BFF e telas" e "Decisões de teste"; LLD, "Dados", "Segurança" e "Cliente"; ADRs 0024 e 0025.

**Decisões consumidas de outras tarefas:**
- Frames e microtexto da barra lateral, do cabeçalho, do `#geral` vazio e do Canal não
  encontrado: tarefa 01.

**Bloqueada por:** 01 (Design da F02 no Pencil)

- [ ] **CA1** · A migração cria as tabelas `conversations` e `participations` da spec, com a
  restrição do nome nos Canais e o índice único parcial, e cria o `#geral`, sem criador e com a
  descrição, com a participação das Pessoas que já existem.
- [ ] **CA2** · `GET /v1/channels` devolve os Canais de que a Pessoa participa, em ordem de nome.
  `GET /v1/conversations/:id` devolve a Conversa com o criador, e responde `not_found` igual para
  id malformado, Conversa inexistente e Conversa sem participação. Tudo provado por e2e, com o
  snapshot do contrato atualizado.
- [ ] **CA3** · O `create` do comando de contas grava a participação da Pessoa nova em todos os
  Canais públicos, na mesma transação, depois de tomar o lock consultivo das participações. Esta
  tarefa define o lock, que a tarefa 05 reaproveita. Provado pelo teste de integração do comando.
- [ ] **CA4** · O `apps/chat-api/AGENTS.md` perde as linhas do comando de canais, troca "Membro"
  pela participação e corrige o ponteiro para as specs, como na spec, "Comando de contas e comando
  de canais".
- [ ] **CA5** · Na web:
  - `/` redireciona para o `#geral`, achado pelo nome;
  - `/canais/<id>` mostra o ConversationHeader, com o `#nome` e a descrição, e o título da aba;
  - o `#geral` vazio mostra o ConversationIntro, com a descrição;
  - a Sidebar ganha a seção Canais, com a linha ativa selecionada;
  - um `not_found` mostra o Canal não encontrado, com o link para o `#geral`.
- [ ] **CA6** · A fixture `person` grava a participação da Pessoa em todos os Canais públicos. O
  plano de testes e2e da F02 existe, e a suíte cobre:
  - a entrada que cai no `#geral` e o redirecionamento de `/`;
  - a barra lateral com a linha ativa;
  - o Canal não encontrado, por id inexistente e por id malformado;
  - a navegação pelo teclado na barra lateral;
  - o axe-core sem violações no `#geral` vazio e no Canal não encontrado.
- [ ] **CA7** · O LLD é atualizado pela skill `lld`, no modo atualizar:
  - o módulo `conversations` entra em "Módulos da API do chat";
  - as tabelas `conversations` e `participations` passam a `existe` em "Dados".
- [ ] **CA8** · Registros na pasta desta tarefa:
  - o roteiro manual da migração no banco `chat` de desenvolvimento, com Pessoas já criadas, que
    passam a participar do `#geral`;
  - a validação visual da barra lateral, do `#geral` vazio e do Canal não encontrado, nos dois
    temas.
