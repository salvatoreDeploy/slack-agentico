# 03: Entrar com e-mail e senha

**Status:** a fazer

**O que construir:** a primeira fatia completa da F01. O Operador cria a conta de uma Pessoa pelo
comando de contas. A Pessoa entra em `/entrar` com e-mail e senha e cai na Home, na casca vazia do
chat, com o nome dela no menu do usuário. A Sessão vale em todas as abas do navegador. Quem abre um
endereço sem Sessão volta a ele depois de entrar.

Fonte: PRD da F01, H1, H2, H3 (aba nova e credencial fora do alcance dos scripts da página) e H4;
spec da F01, "Pessoas", "Sessões", "Comando de contas" (operação `create`), "BFF e telas" e
"Decisões de teste"; LLD, "Sessão e login", "Segurança" e "Cliente".

**Decisões consumidas de outras tarefas:**
- Corpo de erro, tipo de códigos e mapa de status: tarefa 01.
- Base de testes da API e banco `chat_test`: tarefa 01.
- Ferramenta e arquivo de design: tarefa 02.
- Configuração do Playwright, serviço `e2e` e teste-semente: tarefa 02.

**Bloqueada por:** 01 (Base da API do chat), 02 (Base da web e da suíte e2e)

- [ ] **CA1** · As tabelas `people` e `sessions` da spec, criadas pela migração.
- [ ] **CA2** · `pnpm accounts create` cria a Pessoa:
  - lê a senha duas vezes, sem eco, atrás de uma interface que o teste substitui;
  - deriva o @usuário do e-mail quando não recebe um, com as regras do LLD;
  - recusa, sem criar nada, os casos da spec.

  Os testes de integração cobrem a criação, as recusas e os casos da derivação.
- [ ] **CA3** · `POST /v1/sessions` cria a Sessão e devolve o token e a Pessoa:
  - o hash do token é guardado, e o token não;
  - o `expires_at` é calculado pela `duração da sessão`;
  - a entrada é validada com os tamanhos do LLD;
  - e-mail inexistente e senha errada respondem o mesmo `invalid_credentials`.

  Tudo provado por e2e.
- [ ] **CA4** · O guard global lê a Sessão do cookie, e só a rota de entrar é `@Public()`.
  `GET /v1/me` devolve a Pessoa. A falta de cookie, um token desconhecido e uma Sessão vencida
  respondem `unauthenticated`. Tudo provado por e2e, com os atalhos de `authRoutes` criados nesta
  tarefa.
- [ ] **CA5** · A Server Action Entrar grava o cookie com os atributos do LLD ("Segurança") e
  redireciona para o `?voltar=` validado ou para a Home. O proxy manda quem não tem cookie para
  `/entrar?voltar=…`. Quem tem Sessão e abre `/entrar` vai para a Home.
- [ ] **CA6** · A tela Entrar tem os estados da spec ("BFF e telas"): padrão, erro de validação,
  enviando, credenciais incorretas e falha no envio, com os textos, o foco e os atributos de
  acessibilidade de lá. O frame "Login / Falha no envio" é desenhado antes do código, se não
  existir.
- [ ] **CA7** · A Home mostra a casca da spec (Rail, Sidebar com o cabeçalho e "Home / Vazio"). O
  UserMenu abre pelo avatar, por mouse e teclado, com o cabeçalho e o nome da Pessoa. Os itens
  "Trocar senha" e "Sair" entram nas tarefas 07 e 04. Enquanto a Sessão é verificada aparece
  "Portas / Carregando o app", e numa falha de rede ou do servidor aparece "Portas / Erro de
  sessão", com "Tentar de novo".
- [ ] **CA8** · Um 401 vindo do BFF apaga o cookie e manda para Entrar, com o `voltar` da página
  atual (LLD, "Sessão no cliente"). As tarefas 04 e 06 usam esse comportamento.
- [ ] **CA9** · O plano de testes e2e da F01 existe, e a suíte do Playwright cobre:
  - entrar com sucesso;
  - os erros de validação e de credenciais;
  - o `?voltar=`, inclusive `//outro-site`;
  - quem tem Sessão e abre `/entrar`;
  - a segunda aba e o navegador reaberto com Sessão;
  - o fluxo só pelo teclado;
  - o axe-core sem violações em Entrar e na Home.

  As fixtures `person`, que limpa o que criou, e `loggedInPage` estão criadas.
- [ ] **CA10** · Registros na pasta desta tarefa: a verificação do agente de "Erro de sessão" com o
  `playwright-cli`, a validação visual das telas nos dois temas e o roteiro manual com a nota 100
  de Acessibilidade do Lighthouse na tela Entrar.
