# 02: Criar Canal privado

**Status:** a fazer

**O que construir:** a Pessoa liga "Tornar privado" no diálogo "Criar canal" e cai no Canal
privado, de que só ela participa. O Canal aparece com o cadeado na barra lateral e no cabeçalho.
Para as outras Pessoas, ele não existe: não aparece na barra lateral, e o endereço dele mostra a
Conversa não encontrada.

Fonte: PRD da F03, H1 e H2; spec da F03, "Conversas e participação", "Rotas da API do chat"
(`POST` e `GET /v1/channels`) e "BFF e telas" (Criar e cabeçalho); ADR 0024 e ADR 0025.

**Bloqueada por:** Nenhuma (pode começar imediatamente)

- [ ] **CA1** · A migração acrescenta `private_channel` ao enum do tipo da Conversa.
- [ ] **CA2** · `POST /v1/channels` aceita `type` (`public_channel`, o padrão, ou `private_channel`)
  e responde 201 com o `channel` com `type`. O Canal privado grava só a participação de quem
  criou, e o nome segue a mesma regra de nome único, com o mesmo 409. Provado por e2e, com o
  snapshot do contrato atualizado.
- [ ] **CA3** · `GET /v1/channels` traz os Canais privados de que a Pessoa participa, com o `type`
  em cada Canal e na ordem de nome. O Canal privado não aparece para outra Pessoa nem para uma
  conta criada depois dele. A Conversa, o histórico e o envio respondem 404 com o mesmo corpo para
  quem não participa. Provado por e2e.
- [ ] **CA4** · O diálogo "Criar canal" tem o Switch "Tornar privado", desligado por padrão, com a
  explicação do frame, e cria o Canal privado.
- [ ] **CA5** · O Canal privado tem o cadeado no lugar do `#` na barra lateral e no cabeçalho.
- [ ] **CA6** · A suíte do Playwright cobre: criar o Canal privado pelo diálogo, inclusive só pelo
  teclado; o cadeado; outra Pessoa sem o Canal na barra lateral e com a Conversa não encontrada no
  endereço dele. A fixture de Canal privado, com nome único e as participações escolhidas pelo
  teste, entra no `e2e/fixtures.ts`.
- [ ] **CA7** · Registro na pasta desta tarefa: a validação visual do Switch, do cadeado na barra
  lateral e no cabeçalho, nos dois temas.
