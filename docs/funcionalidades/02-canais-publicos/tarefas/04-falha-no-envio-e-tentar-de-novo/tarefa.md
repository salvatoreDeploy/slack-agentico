# 04: Falha no envio e tentar de novo

**Status:** concluída

**O que construir:** quando o envio de uma Mensagem falha, por rede ou servidor, a Pessoa não perde
o texto: a Mensagem fica marcada como não enviada, com "Tentar de novo". A nova tentativa nunca
duplica a Mensagem, mesmo quando a primeira chegou a ser gravada.

Fonte: PRD da F02, H5 (falha no envio) e história 8 da spec; spec da F02, "Rotas da API do chat"
(`POST` de Mensagens), "BFF e telas" (envio otimista) e "Decisões de teste"; LLD, "Concorrência e
idempotência".

**Decisões consumidas de outras tarefas:**
- Frame da Mensagem `failed` e o microtexto de "Tentar de novo": tarefa 01.
- Forma de `message`, `client_message_id` e envio otimista: tarefa 03.
- Fixture `channel`: tarefa 03.

**Bloqueada por:** 03 (Ler e enviar Mensagens)

- [x] **CA1** · O mesmo `client_message_id` do mesmo autor, enviado de novo, responde 200 com a
  Mensagem já gravada, e o banco fica com uma linha só. Provado por e2e, com o snapshot do contrato
  atualizado.
- [x] **CA2** · Na falha do envio, a Mensagem passa a `failed`, com o texto preservado e "Tentar de
  novo". "Tentar de novo" reenvia com o mesmo `client_message_id` e volta a `sending` e a `sent`.
- [x] **CA3** · A suíte do Playwright cobre a falha, com a rota do BFF bloqueada pelo `page.route`,
  e a nova tentativa com a rota liberada, que deixa uma Mensagem só depois de reabrir o Canal.
  "Tentar de novo" funciona pelo teclado.
- [x] **CA4** · Registro na pasta desta tarefa: a validação visual da Mensagem `failed`, nos dois
  temas.
