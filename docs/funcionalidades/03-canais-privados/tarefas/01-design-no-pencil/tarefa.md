# 01: Design da F03 no Pencil

**Status:** a fazer

**O que construir:** os frames do Canal privado no `slack-ia.pen` ajustados à spec, para as tarefas
de tela terem o desenho e o microtexto de cada estado antes do código. A tarefa ajusta os frames
que já existem e desenha os que faltam, seguindo o `docs/design-system.md`, "Fluxo com a ferramenta
de design". O Pencil precisa estar aberto no aplicativo para o MCP responder.

Fonte: spec da F03, "Design no Pencil" e "BFF e telas"; PRD da F03, H1 a H5.

**Bloqueada por:** Nenhuma (pode começar imediatamente)

- [ ] **CA1** · Os frames do Convite e dos Participantes usam os termos do glossário:
  - "Adicionar pessoas", "Adicionar" e "Membros" viram "Convidar pessoas", "Convidar" e
    "Participantes", no microtexto e nos nomes dos frames;
  - o diálogo de Convite tem os estados Escolhidas, Ninguém encontrado, Enviando e Falha ao
    convidar, com o aviso de que quem for convidado vê todo o histórico do Canal;
  - a lista "Participantes de #nome" tem "(você)" na própria Pessoa e o botão "Convidar pessoas".
- [ ] **CA2** · Os resultados da busca mostram só o nome e o @usuário, sem cargo nem Presença, e
  quem já participa aparece com a marca "Participante".
- [ ] **CA3** · Existe o frame do diálogo de Convite no modo de criação, com "Pular" no lugar de
  "Cancelar" e sem o aviso de histórico.
- [ ] **CA4** · Existe o frame de um Canal privado com Mensagens e um Aviso no histórico ("@ana
  convidou @bruno e @carla") no meio delas.
- [ ] **CA5** · Um registro na pasta desta tarefa lista os frames pelo nome, diz quais foram
  ajustados e quais foram desenhados, e o que ficou fora (o `Membros do canal` do Canal público).
