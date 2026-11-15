# 01: Base da API do chat

**Status:** em andamento

**O que construir:** a base da API do chat, que todas as tarefas seguintes usam. A API sobe com a
configuração validada e responde a uma rota inexistente com o corpo de erro do LLD. Ela registra
cada requisição no log e tem o contrato conferido pelo snapshot. A partir desta tarefa, um teste de
ponta a ponta consegue subir a aplicação contra um banco de testes próprio.

Fonte: spec da F01, "Decisões de implementação", seção "Base que a F01 monta"; LLD, "Conceitos
transversais de implementação" e "Ambiente de desenvolvimento".

**Bloqueada por:** Nenhuma (pode começar imediatamente)

- [ ] **CA1** · Configuração validada na subida, com o schema em `zod`. Faltando uma variável
  obrigatória, a API não sobe, e o nome da variável aparece na mensagem. O compose passa as
  variáveis do LLD ("Valores e configuração") ao contêiner, e o projeto tem um exemplo de `.env`.
- [ ] **CA2** · TypeORM ligado ao Banco do chat, com migrações rodando pelos comandos do
  `AGENTS.md` da API e o cls transacional registrado. Ainda não há tabela de domínio.
- [ ] **CA3** · O erro de domínio base, o tipo de códigos, o mapa de status e o exception filter
  global, que responde `application/problem+json` com `code` e `detail`. Um erro inesperado
  responde 500, sem mensagem interna. A validação de entrada responde `validation_failed`.
- [ ] **CA4** · Logs estruturados com `request_id` por requisição, sem o corpo da requisição e com
  os campos sensíveis do LLD ("Logs") mascarados.
- [ ] **CA5** · O contrato gerado pelo `@nestjs/swagger`. O `pnpm openapi` regrava o snapshot, e
  um teste e2e falha quando o documento gerado difere do gravado. O comando está no `AGENTS.md`
  da API.
- [ ] **CA6** · A base de testes: `createTestApp()`, `uniqueEmail()`, o banco `chat_test` zerado e
  migrado pelo `globalSetup`, e a suíte `pnpm test:int`, que entra na Verificação
  completa da API.
- [ ] **CA7** · Um e2e prova que uma rota inexistente responde com o corpo de erro do LLD.
