# 04: Aviso no histórico e Convite na API

**Status:** a fazer

**O que construir:** a API grava o Convite e o Aviso no histórico, e o Canal mostra o Aviso ("@ana
convidou @bruno e @carla") entre as Mensagens, na ordem em que aconteceu. Um Aviso com uma Pessoa
apagada continua no histórico, com "alguém" no lugar dela.

Fonte: PRD da F03, H3 (Convite e Aviso); spec da F03, "Aviso no histórico", "Rotas da API do chat"
(`POST …/participants` e a forma do item do histórico) e "BFF e telas" (Aviso no histórico); ADR
0026.

**Decisões consumidas de outras tarefas:**
- Frame do Aviso no histórico: tarefa 01.
- Tipo `private_channel` e a fixture de Canal privado: tarefa 02.

**Bloqueada por:** 01 (Design da F03 no Pencil), 02 (Criar Canal privado)

- [ ] **CA1** · A migração acrescenta `kind` e `notice` a `messages`, deixa `author_person_id`,
  `client_message_id` e `body` nulos no Aviso, com o `CHECK` de cada coluna por tipo, e mantém as
  Mensagens que existem como `text`.
- [ ] **CA2** · `POST /v1/conversations/:id/participants` grava as participações e o Aviso na mesma
  transação e responde 201 com o Aviso. Quem já participa é ignorado; todos já participando
  responde 200 com `message: null`, sem gravar nada; um id que não é de Pessoa responde 400; um
  Canal público responde 422 `conversation_not_private`; quem não participa recebe 404. Dois
  Convites simultâneos com a mesma Pessoa deixam um Aviso só com ela. Provado por e2e, com o
  snapshot do contrato atualizado.
- [ ] **CA3** · `GET …/messages` devolve os dois tipos com `kind`, o Aviso com `actor` e `invitees`,
  e `null` no lugar de uma Pessoa apagada. A Pessoa convidada passa a ler o histórico anterior.
  Provado por e2e.
- [ ] **CA4** · A função do texto do Aviso monta "@ana convidou @bruno", "@bruno e @carla" e
  "@bruno, @carla e @davi", com "alguém" no lugar de `null`. Provado por teste de unidade no
  Vitest.
- [ ] **CA5** · O histórico mostra o Aviso numa linha própria, fora do agrupamento de Mensagens do
  mesmo autor e dentro do separador de dia. A suíte do Playwright cobre o Aviso gravado por uma
  fixture, inclusive com uma Pessoa apagada.
- [ ] **CA6** · Registro na pasta desta tarefa: a validação visual do Aviso, nos dois temas.
