# 01: Design da F02 no Pencil

**Status:** concluída

**O que construir:** os frames das telas da F02 no `slack-ia.pen`, para as tarefas de tela terem o
desenho e o microtexto de cada estado antes do código. A tarefa confere o que já existe e desenha
o que falta, seguindo o `docs/design-system.md`, "Fluxo com a ferramenta de design". O Pencil
precisa estar aberto no aplicativo para o MCP responder.

Fonte: spec da F02, "Design no Pencil" e "BFF e telas"; PRD da F02, H1 a H6.

**Bloqueada por:** Nenhuma (pode começar imediatamente)

- [x] **CA1** · Existem frames, nos temas claro e escuro, de:
  - a seção Canais da barra lateral, com a linha do Canal aberto selecionada;
  - o Canal com histórico, com o separador de dia e Mensagens de mais de um autor;
  - o Canal vazio, com o criador e a data, e o `#geral` vazio, com a descrição;
  - a Mensagem nos estados `sending` e `failed`, com "Tentar de novo";
  - o composer perto do limite e acima dele;
  - o diálogo "Criar Canal" nos estados padrão, nome inválido, nome já usado e enviando, com a
    prévia do nome normalizado e o contador da descrição;
  - o Canal não encontrado, dentro da casca, com o link para o `#geral`.
- [x] **CA2** · O microtexto de cada estado está nos frames, em português do Brasil, com os termos
  do glossário. O aviso de nome já usado não diz o tipo do Canal.
- [x] **CA3** · O frame do composer fixa o limiar a partir do qual o contador aparece.
- [x] **CA4** · Um registro na pasta desta tarefa lista os frames pelo nome, diz quais já existiam
  e quais foram desenhados, e traz o limiar do contador.
