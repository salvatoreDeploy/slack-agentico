# PRD: Canais públicos (F02)

## 1. Resumo executivo

- **Problema**: Depois de entrar, a Pessoa encontra só a casca vazia do chat: não há onde trocar
  Mensagens com o time. Sem uma Conversa aberta a todo o Workspace, não há onde testar a aposta do
  produto, a de mencionar um Agente dentro da Conversa, e as funcionalidades seguintes não têm base.
- **Solução proposta**: Qualquer Pessoa cria um Canal público, que já nasce aberto a todas as
  Pessoas do Workspace, e conversa nele por Mensagens de texto. O Workspace já começa com o
  `#geral`, e a página inicial abre nele.
- **Critérios de sucesso**: Esta funcionalidade não move sozinha nenhuma métrica do product brief
  ("Objetivos e métricas de sucesso"). Ela é o lugar onde "Uso do agente" vai acontecer, porque é
  nos Canais públicos que as Pessoas vão mencionar o Agente a partir da funcionalidade 10. Ela
  também cumpre os requisitos não funcionais "Acessibilidade" e "Idioma e fuso" do brief.

## 2. Experiência do usuário e funcionamento

### Personas

- **Pessoa**: alguém do time com conta no Workspace, que conversa com os colegas no navegador do
  desktop.

### Fluxo principal

1. A Pessoa entra e cai na página inicial, que abre no `#geral`.
2. Na barra lateral, ela vê a seção Canais com todos os Canais públicos do Workspace.
3. Ela escreve uma Mensagem e envia. A Mensagem aparece na hora no fim do Canal, com o nome e o
   avatar dela e o horário.
4. Ela cria um Canal público novo, com nome e descrição opcional, e cai direto nele.
5. As outras Pessoas veem o Canal novo na barra lateral e as Mensagens novas quando abrem o Canal
   ou recarregam a página. A chegada na hora fica com a funcionalidade 05.

### Histórias de usuário e critérios de aceite

**H1.** Como Pessoa, quero que o Workspace já tenha um Canal para todo mundo para não chegar a uma
tela vazia no primeiro acesso.

- O Workspace já começa com o Canal público `#geral`, com a descrição "Canal de todo o
  Workspace", sem que ninguém precise criá-lo.
- Depois de entrar sem endereço de volta, a Pessoa cai sempre no `#geral`, e não na última
  Conversa que abriu.
- O nome `geral` já fica reservado, e ninguém consegue criar outro Canal com ele.

**H2.** Como Pessoa, quero ver todos os Canais públicos do Workspace para saber onde cada assunto
está sendo conversado.

- A barra lateral tem a seção Canais, com todos os Canais públicos do Workspace, em ordem
  alfabética pura (o `#geral` não fica fixo no topo) e no formato `#nome`.
- Todo Canal público aparece para todas as Pessoas, inclusive para as contas criadas depois dele.
  Ninguém precisa entrar no Canal, e ninguém consegue sair dele.
- O Canal aberto aparece destacado na barra lateral.
- Um Canal criado por outra Pessoa, ou pela mesma Pessoa em outra aba, aparece na barra lateral
  quando a página é recarregada.
- Os Bots não participam de Canais e não aparecem como participantes.

**H3.** Como Pessoa, quero criar um Canal público para separar um assunto do resto da conversa.

- O botão de criar Canal na seção Canais abre um formulário com o nome, obrigatório, e a descrição,
  opcional.
- A descrição tem até 250 caracteres, em texto puro e numa linha só: uma quebra de linha vira
  espaço, os espaços das pontas são cortados e os links não viram clicáveis.
- O nome é normalizado enquanto a Pessoa digita, para ela ver como ele vai ficar: os acentos caem
  (`ç` vira `c`), maiúsculas viram minúsculas e qualquer caractere que não seja letra ou número
  (espaço, `_`, `&`, `.`, `/`) vira hífen. Hífens repetidos viram um só, e os das pontas caem. Por
  exemplo, `Café & Vendas 2026!` vira `cafe-vendas-2026`. O limite é de 80 caracteres, contados
  depois da normalização.
- O nome é único entre todos os Canais do Workspace, públicos e privados. Com um nome já usado, o
  formulário avisa que já existe um Canal com esse nome, sem dizer se ele é público ou privado, e
  não cria nada.
- Com o nome vazio, ou vazio depois da normalização, o formulário avisa e não envia.
- Ao criar, a Pessoa cai no Canal novo, que já aparece na barra lateral dela.
- Qualquer Pessoa pode criar um Canal público.

**H4.** Como Pessoa, quero abrir um Canal e ler o que já foi conversado para me situar antes de
escrever.

- Ao abrir, o Canal mostra as 50 Mensagens mais recentes, em ordem cronológica, rolado até a mais
  recente. As mais antigas ficam para a paginação da funcionalidade 05.
- O cabeçalho mostra o `#nome` e a descrição do Canal, quando houver.
- Cada Mensagem mostra o nome atual e o avatar do autor e o horário, no fuso do navegador de quem
  lê. Um separador marca a mudança de dia ("Hoje", "Ontem", "20 de novembro").
- Um Canal sem Mensagens mostra o estado vazio, com quem o criou e quando ("@fulano criou este
  Canal em 20 de novembro") e um convite para escrever a primeira. O `#geral`, que não tem
  criador, mostra a descrição.
- Cada Canal tem um endereço próprio. Quem abre esse endereço sem Sessão vai para Entrar e, depois
  de entrar, cai no Canal.
- Um endereço de Canal que não existe mostra o aviso de Canal não encontrado e um caminho de volta
  para o `#geral`.

**H5.** Como Pessoa, quero mandar uma Mensagem num Canal público para falar com todo o Workspace.

- A Mensagem é texto puro, com até 4.000 caracteres. Enter envia e Shift+Enter quebra a linha.
- Os espaços e as linhas em branco das pontas são cortados ao enviar, e os de dentro ficam. Os
  4.000 caracteres contam depois do corte, como a Pessoa os vê: um emoji conta como 1.
- As quebras de linha aparecem na Mensagem enviada. Só os endereços que começam com `http://` ou
  `https://` viram links, que abrem numa aba nova. Nenhum outro texto vira formatação, e nenhum
  texto vira código na página.
- Uma Mensagem vazia ou só com espaços não é enviada. Perto do limite, o campo mostra quantos
  caracteres restam. Acima do limite, ele bloqueia o envio.
- A Mensagem enviada aparece na hora no fim do Canal, para quem enviou, marcada como "enviando"
  até a confirmação, e o campo fica vazio.
- Se o envio falhar, a Mensagem fica marcada como não enviada, com o texto preservado e a opção de
  tentar de novo. A nova tentativa nunca duplica a Mensagem.
- As Mensagens das outras Pessoas, e as da mesma Pessoa enviadas em outra aba, aparecem ao reabrir
  o Canal ou recarregar a página, na ordem em que foram recebidas. Por isso, uma Mensagem de outra
  Pessoa recebida antes da sua pode aparecer acima dela só depois de reabrir o Canal.

**H6.** Como Pessoa, quero usar os Canais só com o teclado para não depender do mouse.

- Tab percorre a barra lateral, o botão de criar Canal, o histórico e o campo de Mensagem, com o
  foco sempre visível.
- O formulário de criar Canal abre e fecha pelo teclado (Esc fecha), e o foco volta ao botão que o
  abriu.
- Os textos e os avisos da tela estão em português do Brasil.

### O que não é objetivo

- Mensagens das outras Pessoas chegando na hora, aviso de "digitando", histórico paginado e
  recuperação depois de uma queda de conexão: ficam com a funcionalidade 05.
- Canais privados e convites: ficam com a funcionalidade 03.
- Conversas diretas, busca de Pessoas e perfis: ficam com a funcionalidade 04.
- Menções, inclusive `@canal` e `@aqui`, e as Não lidas: ficam com a funcionalidade 06.
- Citar, copiar, editar e apagar Mensagens: ficam com a funcionalidade 07.
- Mensagens de Bot e Pedidos a Agentes: ficam com a funcionalidade 10.
- Renomear, editar a descrição, arquivar e apagar Canais, inclusive o `#geral`.
- Entrar e sair de Canais, busca de Mensagens, threads, reações e anexos: ficam para a Fase 2
  (product brief, "Fora de escopo").
- Formatação de texto (negrito, itálico, código), emojis por atalho e prévia de links.
- Lista de participantes do Canal: todo Canal público tem todas as Pessoas.
- Limite de envio de Mensagens e de criação de Canais.
- Sincronizar abas do mesmo navegador: fica com a funcionalidade 05.

## 3. Requisitos do sistema de IA

Não se aplica. Esta funcionalidade não envolve Agentes.

## 4. Riscos de produto

| Risco | Mitigação |
| --- | --- |
| Sem as Mensagens chegando na hora, a Pessoa acha que o chat não funciona ou que ninguém respondeu | A funcionalidade 05 vem logo depois. Até lá, a Mensagem da própria Pessoa aparece na hora, e recarregar mostra as dos outros |
| Os Canais se multiplicam (duplicados, de teste, abandonados) e ninguém consegue apagá-los pela tela | O nome único e normalizado impede duplicatas como `Vendas` e `vendas`. Arquivar e apagar são A definir: entram na Fase 2 ou num comando do Operador, se a bagunça aparecer no uso |
| Uma Mensagem some numa falha de rede e a Pessoa precisa reescrevê-la | O texto fica preservado, com a opção de tentar de novo, e a nova tentativa não duplica a Mensagem |
| Alguém escreve um texto que vira código na página de quem lê | A Mensagem é tratada como texto puro, e só os links ganham marcação |
| Quem volta depois de muitas Mensagens não alcança as mais antigas que as 50 mostradas | Limite aceito até a paginação da funcionalidade 05. Mais tarde, o Resumo da funcionalidade 11 cobre quem precisa de contexto |
