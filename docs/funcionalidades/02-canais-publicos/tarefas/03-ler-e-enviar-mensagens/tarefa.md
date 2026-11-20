# 03: Ler e enviar Mensagens

**Status:** a fazer

**O que construir:** a Pessoa abre um Canal, lê as 50 Mensagens mais recentes e envia as suas. A
Mensagem dela aparece na hora no fim do Canal, como "enviando" e depois enviada, com o nome, o
avatar e o horário no fuso do navegador. As Mensagens das outras Pessoas aparecem ao reabrir o
Canal.

Fonte: PRD da F02, H4 (histórico, autor, horário e separador de dia) e H5 (menos a falha no envio);
spec da F02, "Mensagens", "Rotas da API do chat" (`GET` e `POST` de Mensagens), "BFF e telas" e
"Decisões de teste"; LLD, "Interfaces" (paginação) e "Valores e configuração".

**Decisões consumidas de outras tarefas:**
- Frames do histórico, do MessageItem e do composer, e o limiar do contador: tarefa 01.
- Forma de `conversation`, conferência de participação e o `not_found`: tarefa 02.
- Plano de testes e2e da F02 e fixture `person` com participações: tarefa 02.

**Bloqueada por:** 02 (`#geral` na barra lateral)

- [ ] **CA1** · A migração cria a tabela `messages` da spec, com a unicidade do autor com o
  `client_message_id` e o índice da página do histórico.
- [ ] **CA2** · `GET /v1/conversations/:id/messages` devolve a página mais recente em ordem
  crescente, com `has_more`, e o `before` traz a página anterior. Um `before` malformado responde
  400, e a Conversa sem acesso responde `not_found`. A resposta traz o nome atual do autor. Tudo
  provado por e2e.
- [ ] **CA3** · `POST /v1/conversations/:id/messages` grava a Mensagem com as pontas cortadas e
  responde 201. Um texto vazio depois do corte e um texto acima do `tamanho da Mensagem` em
  grafemas respondem 400, e 4.000 grafemas com emojis de vários pontos de código passam. Tudo
  provado por e2e, com o snapshot do contrato atualizado.
- [ ] **CA4** · A tela do Canal:
  - mostra o MessageItem com o DayDivider e começa rolada até o fim;
  - formata o horário e os separadores no cliente, em `pt-BR` e no fuso do navegador;
  - renderiza o texto como texto, mantém as quebras de linha e transforma em link, aberto numa
    aba nova, só os endereços `http://` e `https://`.
- [ ] **CA5** · O MessageComposer:
  - envia com Enter e quebra a linha com Shift+Enter;
  - mostra o contador a partir do limiar da tarefa 01 e bloqueia o envio acima do limite, contando
    em grafemas;
  - gera o `client_message_id` e acrescenta a Mensagem como `sending`, que passa a `sent` na
    resposta, com o campo limpo.
- [ ] **CA6** · O Vitest entra na web, com o `pnpm test` em "Comandos" e em "Verificação completa"
  do `apps/web/AGENTS.md`. A contagem de grafemas tem teste de unidade nas duas pontas.
- [ ] **CA7** · Entram as fixtures `channel`, que cria um Canal público com nome único e o apaga ao
  fim, e a que grava uma Mensagem de outra Pessoa. A suíte do Playwright cobre:
  - o envio, com o nome, o horário e o campo limpo;
  - as várias linhas e o link;
  - o texto com marcação HTML aparecendo como texto;
  - a Mensagem de outra Pessoa depois de reabrir o Canal;
  - o envio só pelo teclado;
  - o axe-core sem violações no Canal com Mensagens.

  Os testes escrevem só no Canal da fixture.
- [ ] **CA8** · O LLD é atualizado pela skill `lld`, no modo atualizar:
  - o módulo `messages` entra em "Módulos da API do chat";
  - o Vitest entra na tabela de bibliotecas;
  - a tabela `messages` passa a `existe`.
- [ ] **CA9** · Registro na pasta desta tarefa: a validação visual do Canal com histórico, da
  Mensagem `sending` e do composer perto do limite e acima dele, nos dois temas.
