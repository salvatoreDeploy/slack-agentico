# PRD: Entrar e sair (F01)

## 1. Resumo executivo

- **Problema**: Hoje nada no produto identifica quem está conversando. Sem isso, não há como
  separar as Conversas de cada Pessoa, aplicar a Permissão de dados nem mostrar que uma ação partiu
  de um Administrador. Todas as outras funcionalidades dependem dessa base.
- **Solução proposta**: A Pessoa entra com e-mail e senha numa conta que a empresa cria por script,
  ganha uma Sessão que vale no navegador todo e pode sair quando quiser. A empresa também pode
  revogar as Sessões de uma Pessoa.
- **Critérios de sucesso**: Esta funcionalidade não move sozinha nenhuma métrica do product brief
  ("Objetivos e métricas de sucesso"). Ela é o que permite medir "Uso do agente", porque é a Sessão
  que define quem é uma Pessoa ativa na semana. Ela também cumpre os requisitos não funcionais
  "Sessão" e "Acessibilidade" do brief.

## 2. Experiência do usuário e funcionamento

### Personas

- **Pessoa**: alguém do time da empresa que recebeu uma conta e vai usar o chat no navegador do
  desktop.
- **Operador**: a pessoa técnica da empresa que cria contas e revoga Sessões pelo
  script. No MVP ela faz o papel do cadastro, que só chega na Fase 2.

### Fluxo principal

1. O Operador cria a conta da Pessoa pelo script (nome, @usuário, e-mail e senha
   inicial) e passa a senha à Pessoa.
2. A Pessoa abre o produto. Sem Sessão, cai na tela Entrar.
3. Ela informa e-mail e senha e entra. Volta para a página que tinha aberto ou, se não abriu
   nenhuma, vai para a página inicial.
4. Ela troca a senha inicial por uma senha própria.
5. Mais tarde, clica em Sair e volta à tela Entrar.

### Histórias de usuário e critérios de aceite

**H1.** Como Operador, quero criar a conta de uma Pessoa por script para que ela
consiga entrar sem que o produto tenha cadastro.

- O script recebe nome, @usuário, e-mail e senha inicial e cria a Pessoa.
- Ele recusa, com mensagem clara e sem criar nada: e-mail já usado, @usuário já usado (por Pessoa
  ou Bot) e senha com menos de 8 caracteres.
- A senha não aparece em nenhum registro nem em nenhuma saída do script.

**H2.** Como Pessoa, quero entrar com e-mail e senha para usar o chat com a minha identidade.

- Com e-mail e senha corretos, a Pessoa entra e vê a página inicial: a casca vazia do chat, com o
  nome dela, "Trocar senha" e "Sair" no menu do usuário.
- O e-mail é aceito sem distinção de maiúsculas e minúsculas e sem espaços nas pontas.
- Com e-mail inexistente ou senha errada, a mensagem é sempre "E-mail ou senha incorretos.". A tela
  não revela se o e-mail existe.
- Com algum campo vazio, a tela avisa qual é, sem enviar o formulário.
- Quem já tem Sessão e abre a tela Entrar vai direto para a página inicial.
- O fluxo inteiro funciona só com o teclado: Tab percorre os campos e o botão, e Enter envia.

**H3.** Como Pessoa, quero que a Sessão valha no navegador todo para não precisar entrar de novo a
cada aba.

- Depois de entrar, uma aba nova do mesmo navegador já abre com Sessão.
- A Sessão vence depois de 30 dias sem atividade. Cada uso renova o prazo.
- Com a Sessão vencida ou revogada, a próxima ação manda a Pessoa para Entrar.
- Nenhum script da página consegue ler a credencial da Sessão.

**H4.** Como Pessoa, quero voltar à página que eu tinha aberto depois de entrar, para não perder o
link que recebi.

- Quem abre um endereço do produto sem Sessão vai para Entrar e, depois de entrar, cai nesse
  endereço.
- Um endereço de volta que aponta para fora do produto é ignorado, e a Pessoa vai para a página
  inicial.

**H5.** Como Pessoa, quero sair para que ninguém use a minha conta neste navegador.

- Sair encerra a Sessão deste navegador e leva à tela Entrar. As outras abas do mesmo navegador
  perdem a Sessão na próxima ação.
- As Sessões da mesma Pessoa em outros navegadores continuam valendo.
- Depois de sair, voltar pelo histórico do navegador não mostra conteúdo protegido.

**H6.** Como Pessoa, quero trocar a minha senha para não continuar com a senha inicial que me
passaram.

- A troca pede a senha atual e a nova. A nova precisa ter pelo menos 8 caracteres e ser diferente
  da atual.
- Com a senha atual errada, nada muda e a tela avisa.
- Depois da troca, as outras Sessões da Pessoa são encerradas e a atual continua.

**H7.** Como Operador, quero revogar todas as Sessões de uma Pessoa para cortar o
acesso dela na hora, por exemplo quando alguém sai da empresa ou perde o notebook.

- O script recebe o e-mail e encerra todas as Sessões daquela Pessoa.
- Depois disso, a próxima ação dela em qualquer navegador manda para Entrar.

**H8.** Como Pessoa, quero que o produto me proteja de quem tenta adivinhar a minha senha.

- Depois de 5 senhas erradas para o mesmo e-mail em 15 minutos, novas tentativas para esse e-mail
  ficam bloqueadas por 15 minutos, mesmo com a senha certa.
- Durante o bloqueio, a mensagem é "Muitas tentativas. Tente de novo em alguns minutos.". Ela
  aparece também para e-mail inexistente, para não revelar quais contas existem.
- O bloqueio acaba sozinho, sem intervenção de ninguém.
- Cada bloqueio fica registrado como aviso.

### O que não é objetivo

- Cadastro de Pessoas, convite e tela de papéis e permissões na interface: ficam para a Fase 2
  (product brief, "Fora de escopo").
- "Esqueci minha senha" e qualquer envio de e-mail. Quem esquece a senha pede uma nova ao Operador.
- Dar o papel de Administrador, dar a Permissão de dados e criar Bots: entram nas funcionalidades
  10 e 13.
- Login corporativo (SSO), verificação em duas etapas e login social.
- Lista de Sessões abertas e "sair de todos os navegadores" pela tela.
- Desbloquear uma conta antes de os 15 minutos passarem.
- Celular e tablet.
- Perfil, Presença, Conversas e o resto da página inicial: nesta funcionalidade ela é só a casca
  vazia do chat, com o nome da Pessoa no menu do usuário, até as funcionalidades 02 e 09
  chegarem.

## 3. Requisitos do sistema de IA

Não se aplica. Esta funcionalidade não envolve Agentes.

## 4. Riscos de produto

| Risco | Mitigação |
| --- | --- |
| A senha inicial circula por canais inseguros (mensagem, e-mail) e continua em uso | Troca de senha disponível desde o primeiro dia, e a troca encerra as outras Sessões |
| Uma pessoa mal-intencionada bloqueia a conta de outra de propósito, errando a senha de novo e de novo | O bloqueio dura só 15 minutos e passa sozinho. Se virar problema real, a chave do bloqueio é revista na spec |
| Alguém descobre quais e-mails têm conta | Mensagem única para e-mail inexistente e senha errada, inclusive durante o bloqueio |
| Sessão esquecida aberta num computador compartilhado | Vencimento por inatividade em 30 dias, Sair visível e revogação pelo script |
| O Operador não sabe usar o script e a empresa não consegue começar | Comandos do script documentados com exemplos, e mensagens de erro que dizem o que corrigir |
