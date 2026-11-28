# 03: Participantes do Canal privado

**Status:** a fazer

**O que construir:** no Canal privado, o cabeçalho mostra quantas Pessoas participam, e essa
contagem abre "Participantes de #nome", com o nome e o @usuário de cada uma, em ordem de nome, e
"(você)" na própria Pessoa.

Fonte: PRD da F03, H4 e H5; spec da F03, "Rotas da API do chat" (`GET /v1/conversations/:id` e
`GET …/participants`) e "BFF e telas" (Cabeçalho e Participantes).

**Decisões consumidas de outras tarefas:**
- Frames e microtexto da lista de Participantes: tarefa 01.
- Tipo `private_channel`, `type` em `channel` e a fixture de Canal privado: tarefa 02.

**Bloqueada por:** 01 (Design da F03 no Pencil), 02 (Criar Canal privado)

- [ ] **CA1** · `GET /v1/conversations/:id` traz `participant_count`. Provado por e2e.
- [ ] **CA2** · `GET /v1/conversations/:id/participants` responde 200 com os Participantes
  (`{ id, name, username }`) em ordem de nome, e 404 para quem não participa. Provado por e2e, com
  o snapshot do contrato atualizado.
- [ ] **CA3** · Só no Canal privado, o cabeçalho tem o botão com o ícone de pessoas e a contagem,
  que abre o diálogo "Participantes de #nome". O Esc fecha, e o foco volta ao botão.
- [ ] **CA4** · O diálogo deixa o lugar do botão "Convidar pessoas", que a tarefa 05 liga. Até lá,
  o botão não aparece.
- [ ] **CA5** · A suíte do Playwright cobre a contagem, a lista com "(você)", o fluxo pelo teclado
  e o axe-core no diálogo aberto. O Canal público não tem a contagem.
- [ ] **CA6** · Registro na pasta desta tarefa: a validação visual do cabeçalho e da lista, nos
  dois temas.
