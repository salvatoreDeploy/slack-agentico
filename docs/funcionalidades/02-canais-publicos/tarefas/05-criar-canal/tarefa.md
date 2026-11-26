# 05: Criar Canal

**Status:** em andamento

**O que construir:** qualquer Pessoa cria um Canal público pelo diálogo "Criar Canal", com nome e
descrição, vê como o nome vai ficar enquanto digita e cai no Canal novo, que já está na barra
lateral dela e na de todas as outras Pessoas. O Canal vazio mostra quem o criou e quando.

Fonte: PRD da F02, H3, H4 (estado vazio com o criador) e H6 (diálogo pelo teclado); spec da F02,
"Conversas e participação", "Nome do Canal", "Rotas da API do chat" (`POST /v1/channels`), "BFF e
telas" e "Decisões de teste"; LLD, "Dados" e "Valores e configuração"; ADR 0024.

**Decisões consumidas de outras tarefas:**
- Frames e microtexto do diálogo "Criar Canal" e do Canal vazio: tarefa 01.
- Tabelas `conversations` e `participations`, o lock consultivo das participações e a forma de
  `channel` e de `conversation`: tarefa 02.
- Vitest na web e fixture `channel`: tarefa 03.

**Bloqueada por:** 02 (`#geral` na barra lateral), 03 (Ler e enviar Mensagens)

- [ ] **CA1** · A normalização do nome tem uma implementação na API e outra na web, e as duas
  passam pela tabela de casos da spec, nos testes de unidade da API e da web (Vitest nas duas).
- [ ] **CA2** · `POST /v1/channels` grava o nome normalizado e a descrição tratada e responde 201.
  Ele grava a participação de todas as Pessoas na mesma transação, com o lock da tarefa 02. Provado
  por e2e: o Canal aparece na lista de outra Pessoa.
- [ ] **CA3** · Respondem 400: o nome vazio depois da normalização, o acima do `tamanho do nome do
  Canal` e a descrição acima do `tamanho da descrição do Canal`. O nome já usado, inclusive
  `GERAL`, responde 409 `channel_name_taken`, com o `detail` genérico, e não grava nada. Duas
  criações simultâneas com o mesmo nome criam um Canal só. Tudo provado por e2e, com o código novo
  no tipo de códigos e no mapa de status do filter e o snapshot do contrato atualizado.
- [ ] **CA4** · O diálogo "Criar Canal":
  - abre pela SidebarAction, com o foco no nome, e mostra a prévia do nome normalizado;
  - avisa no campo o nome vazio ou longo demais, sem enviar;
  - avisa o `channel_name_taken` no campo do nome e continua aberto com o que foi digitado;
  - numa falha de rede ou do servidor, mostra a mensagem do frame `Diálogos / Criar canal / Falha
    ao criar` no corpo do diálogo, com os campos preenchidos;
  - fecha pelo Esc, com o foco de volta à SidebarAction;
  - no sucesso, leva a Pessoa ao Canal novo, já na barra lateral.
- [ ] **CA5** · O Canal vazio mostra o ConversationIntro com o criador e a data.
- [ ] **CA6** · A suíte do Playwright cobre:
  - a prévia do nome;
  - o sucesso, com o Canal novo na barra lateral;
  - o nome já usado e o nome vazio;
  - a falha ao criar, com o envio bloqueado no navegador;
  - o Canal vazio com o criador;
  - o diálogo só pelo teclado;
  - o axe-core sem violações no diálogo.

  Os testes apagam os Canais que criaram.
- [ ] **CA7** · Registro na pasta desta tarefa: a validação visual do diálogo nos seis estados dos frames e
  do Canal vazio com o criador, nos dois temas.
