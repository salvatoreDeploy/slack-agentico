# 05: Convidar pela lista de Participantes

**Status:** a fazer

**O que construir:** qualquer Participante abre "Convidar pessoas" pela lista de Participantes,
busca Pessoas pelo nome ou pelo @usuário, escolhe uma ou várias e convida. O diálogo fecha, e o
Aviso e a contagem aparecem na hora. A Pessoa convidada vê o Canal na barra lateral e o histórico
anterior ao recarregar.

Fonte: PRD da F03, H3 e H5; spec da F03, "Busca de Pessoas", "Rotas da API do chat"
(`GET /v1/people`) e "BFF e telas" (Convidar pessoas).

**Decisões consumidas de outras tarefas:**
- Frames e microtexto do diálogo de Convite: tarefa 01.
- Abertura da lista de Participantes e revalidação da contagem: tarefa 03.
- Contrato do `POST …/participants`, forma do Aviso e a função do texto: tarefa 04.

**Bloqueada por:** 01 (Design da F03 no Pencil), 03 (Participantes do Canal privado), 04 (Aviso no
histórico e Convite na API)

- [ ] **CA1** · A migração cria a extensão `unaccent`. `GET /v1/people?q=&conversation_id=` acha
  pelo começo de qualquer palavra do nome e pelo começo do @usuário, sem diferenciar maiúsculas e
  acentos, e devolve até o `tamanho da busca de Pessoas` em ordem de nome, com `is_participant`. O
  termo vazio responde 400, um Canal público 422, e quem não participa 404. Provado por e2e, com o
  snapshot do contrato atualizado.
- [ ] **CA2** · O diálogo "Convidar pessoas para #nome", aberto pelo botão da lista de
  Participantes:
  - busca com espera de 250 ms e descarta a resposta de uma busca que ficou para trás;
  - é um combobox com as setas, o Enter e o Esc, e as escolhas viram fichas com o botão de tirar;
  - marca quem já participa com "Participante", sem deixar escolher;
  - avisa que quem for convidado vê todo o histórico;
  - mostra Ninguém encontrado, Enviando e Falha ao convidar, como os frames.
- [ ] **CA3** · No sucesso, o diálogo fecha, e o Aviso e a contagem aparecem na hora para quem
  convidou.
- [ ] **CA4** · A suíte do Playwright cobre: o Convite pela lista, com o Aviso e a contagem; a
  Pessoa convidada vendo o Canal e o histórico anterior; Ninguém encontrado; a falha com a Server
  Action bloqueada; o fluxo só pelo teclado; e o axe-core no diálogo com resultados e com fichas.
- [ ] **CA5** · Registro na pasta desta tarefa: a validação visual do diálogo em cada estado, nos
  dois temas.
