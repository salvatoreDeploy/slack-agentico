# Full Cycle Chat

Chat de equipe em que Agentes de IA entram como plugins para resumir Conversas, delegar trabalho e
consultar os dados de negócio da empresa. Este glossário é o vocabulário do produto; os termos do
planejamento (funcionalidade, PRD, spec, tarefa, plano) estão no `AGENTS.md`, "Planejamento".

## Pessoas e acesso

**Workspace**:
O espaço único da empresa no produto, que reúne todas as Pessoas, Conversas e Agentes.
_Evitar_: organização, time, servidor

**Pessoa**:
Quem tem conta no Workspace, criada pela empresa, e conversa no chat. Um Bot nunca é uma Pessoa.
_Evitar_: membro, usuário

**Administrador**:
Pessoa com o papel de administrar o Workspace, o que inclui conectar e desconectar Agentes.
_Evitar_: admin, gestor

**Operador**:
Quem tem acesso ao servidor da instalação e cria as contas, troca senhas e revoga Sessões pelos
comandos de fora do produto. Não é um papel dentro do Workspace.
_Evitar_: admin, sysadmin, quem opera a instalação

**@usuário**:
O identificador único de uma Pessoa ou de um Bot, usado para mencionar e para buscar.
_Evitar_: login, apelido, handle

**Sessão**:
O acesso de uma Pessoa depois de entrar com e-mail e senha, válido no navegador todo até ela sair
ou a Sessão ser revogada.
_Evitar_: login (como substantivo)

**Permissão de dados**:
A autorização dada a uma Pessoa para receber o conteúdo das Consultas ao Banco de negócio,
inclusive o Relatório.
_Evitar_: acesso a dados, permissão de BI

## Conversas

**Conversa**:
Qualquer lugar onde se trocam Mensagens: um Canal público, um Canal privado ou uma Conversa direta.
_Evitar_: chat, sala

**Canal**:
Um Canal público ou um Canal privado: uma Conversa com nome, que aparece como #nome e cujo nome é
único entre todos os Canais do Workspace.
_Evitar_: sala, grupo

**Canal público**:
Conversa aberta a todas as Pessoas do Workspace.
_Evitar_: grupo, canal aberto

**Canal privado**:
Conversa que só as Pessoas convidadas veem e de que só elas participam.
_Evitar_: grupo fechado, canal secreto

**Participante**:
Pessoa que participa de uma Conversa: num Canal público, todas as Pessoas; num Canal privado, quem
o criou e quem foi convidado.
_Evitar_: membro, integrante

**Convite**:
A inclusão de uma Pessoa num Canal privado por um Participante, que vale na hora, sem aceite.
_Evitar_: adicionar, chamar, solicitação

**Conversa direta**:
Conversa entre duas Pessoas, ou entre uma Pessoa e um Bot.
_Evitar_: DM (fora do rótulo da tela Atividade), 1:1, mensagem privada

**Mensagem**:
O que uma Pessoa ou um Bot escreve numa Conversa; só quem escreveu pode editar ou apagar.
_Evitar_: post, comentário

**Aviso no histórico**:
Uma linha no histórico da Conversa que registra um fato dela, como um Convite, e que ninguém
escreveu, edita ou apaga; não é Mensagem.
_Evitar_: mensagem de sistema, evento, log

**Menção**:
A citação de uma Pessoa ou de um Bot pelo @usuário dentro de uma Mensagem, que a avisa.
_Evitar_: marcação, tag

**Citação**:
A resposta a uma Mensagem que mostra um trecho da Mensagem respondida.
_Evitar_: quote, reply, thread

**Não lidas**:
A contagem de Mensagens de uma Conversa que a Pessoa ainda não viu.
_Evitar_: pendentes, novas

**Presença**:
Se a Pessoa está online ou ausente.
_Evitar_: status, disponibilidade

**Status**:
O texto curto que a Pessoa mostra no perfil, como "em reunião".
_Evitar_: presença, recado

## Agentes

**Agente**:
A IA plugável que atende Pedidos dentro das Conversas, como o `@assistente`.
_Evitar_: bot, assistente (como termo genérico), IA

**Bot**:
A conta pela qual um Agente aparece e escreve nas Conversas, que reserva o @usuário dele. Não
participa de Canais: escreve numa Conversa só ao atender um Pedido feito nela.
_Evitar_: agente, usuário de sistema

**Conexão de agente**:
O ato do Administrador de ligar ou desligar um Agente no Workspace; só um Agente conectado atende
Pedidos.
_Evitar_: instalação, ativação

**Pedido**:
O que uma Pessoa pede a um Agente, mencionando-o ou respondendo à pergunta dele.
_Evitar_: prompt, comando, solicitação

**Pedido demorado**:
Pedido que o Agente atende em segundo plano: avisa que começou e entrega o resultado na Conversa
quando termina.
_Evitar_: job, tarefa (neste sentido)

**Resposta pronta**:
Um botão que o Agente oferece com uma resposta possível à pergunta dele, para a Pessoa responder
com um clique.
_Evitar_: sugestão, atalho

**Resumo**:
Texto do Agente que condensa as Mensagens de uma Conversa dentro de um Recorte.
_Evitar_: síntese, digest

**Recorte**:
O trecho da Conversa que um Resumo cobre: hoje, desde ontem, a semana, tudo, o que uma Pessoa
disse ou um assunto.
_Evitar_: filtro, período

## Tarefas delegadas e avisos

**Delegação**:
O Pedido a um Agente para passar um trabalho a uma Pessoa mencionada, que cria uma Tarefa delegada.
_Evitar_: atribuição, encaminhamento

**Tarefa delegada**:
Trabalho criado por uma Delegação, com um Responsável, que fica aberta até ser concluída e pode ser
reaberta. Não confundir com a tarefa do planejamento, definida no `AGENTS.md`.
_Evitar_: tarefa (sozinha, porque é o termo do planejamento), to-do, ticket, item

**Responsável**:
A única Pessoa que recebe uma Tarefa delegada e pode concluí-la ou reabri-la.
_Evitar_: dono, assignee

**Notificação**:
Aviso a uma Pessoa de uma Menção, de uma Mensagem em Conversa direta ou de uma Tarefa delegada,
que leva direto ao que a originou.
_Evitar_: alerta (como termo), push

**Atividade**:
A tela que reúne as Notificações da Pessoa nas abas Menções, DMs e Tarefas (o rótulo da aba das
Tarefas delegadas).
_Evitar_: caixa de entrada, inbox, feed

## Dados de negócio

**Banco de negócio**:
Os dados de vendas da empresa que o Agente consulta, só para leitura.
_Evitar_: base da empresa, BI, banco de dados (sem qualificar)

**Pedido de venda**:
Uma venda registrada no Banco de negócio. Sempre por extenso, para não confundir com Pedido.
_Evitar_: pedido (sozinho), ordem, encomenda

**Consulta**:
A leitura que o Agente faz no Banco de negócio para responder a um Pedido de números.
_Evitar_: query, busca

**Lastro**:
O resultado de Consulta de que cada número de uma resposta ou de um Relatório saiu; número sem
Lastro não chega à Pessoa.
_Evitar_: fonte, evidência

**Resposta bloqueada**:
A resposta a uma Consulta que fica na Conversa sem o conteúdo para quem não tem Permissão de dados.
_Evitar_: resposta oculta, resposta censurada

**Relatório**:
O PDF com o resultado de Consultas, entregue na Conversa para baixar, só por quem tem Permissão de
dados.
_Evitar_: export, planilha, arquivo
