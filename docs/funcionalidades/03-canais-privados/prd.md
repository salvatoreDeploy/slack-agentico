# PRD: Canais privados (F03)

## 1. Resumo executivo

- **Problema**: Hoje todo Canal é público, e tudo o que se escreve nele chega a todo o Workspace.
  Um time que precisa conversar só entre algumas Pessoas, como liderança, um projeto com cliente
  ou um assunto de RH, não tem onde fazer isso.
- **Solução proposta**: A Pessoa cria um Canal privado, escolhe quem convidar na criação ou depois,
  e só quem foi convidado vê o Canal e participa dele. Para o resto do Workspace, o Canal não
  existe.
- **Critérios de sucesso**: Esta funcionalidade não move sozinha nenhuma métrica do product brief
  ("Objetivos e métricas de sucesso"). Ela completa o item 2 do escopo do MVP ("criar canais
  públicos ou privados e convidar pessoas para um canal privado") e cumpre os requisitos não
  funcionais "Acessibilidade" e "Idioma e fuso" do brief.

## 2. Experiência do usuário e funcionamento

### Personas

- **Pessoa**: alguém do time com conta no Workspace, que conversa com os colegas no navegador do
  desktop. Aqui, ela tanto cria o Canal privado quanto é convidada para um.

### Fluxo principal

1. No diálogo "Criar canal", a Pessoa liga "Tornar privado" e, se quiser, busca e escolhe as
   Pessoas que vai convidar.
2. Ela cria o Canal e cai direto nele. O Canal aparece na barra lateral dela com o cadeado no lugar
   do `#`.
3. As Pessoas convidadas passam a participar na hora e veem o Canal na barra lateral quando
   recarregam a página. As outras não o veem.
4. Qualquer Participante convida mais Pessoas pelo cabeçalho do Canal. Cada Convite fica num Aviso
   no histórico.
5. O cabeçalho mostra quantas Pessoas participam e abre a lista delas.

### Histórias de usuário e critérios de aceite

**H1.** Como Pessoa, quero criar um Canal privado para conversar sobre um assunto só com quem
precisa saber dele.

- O diálogo "Criar canal" tem a opção "Tornar privado", desligada por padrão, com a explicação "Só
  pessoas convidadas veem e participam de um canal privado.".
- Com a opção ligada, o diálogo mostra o campo "Convidar pessoas", opcional. A Pessoa pode criar o
  Canal privado só com ela mesma.
- O nome segue as regras do Canal público (PRD da F02, H3): é normalizado enquanto a Pessoa
  digita, tem até 80 caracteres e é único entre todos os Canais do Workspace, públicos e privados.
- Com um nome já usado, o diálogo avisa que já existe um Canal com esse nome, sem dizer se ele é
  público ou privado. Isso vale também quando o Canal com esse nome é privado e a Pessoa não
  participa dele.
- Quem cria participa do Canal privado. Ao criar, a Pessoa cai no Canal novo, que já aparece na
  barra lateral dela.
- O tipo é escolhido na criação e não muda depois.
- Qualquer Pessoa pode criar um Canal privado.

**H2.** Como Pessoa, quero que um Canal privado fique invisível para quem não foi convidado para
que o que se escreve nele não vaze.

- A barra lateral mostra, na seção Canais, os Canais públicos e os Canais privados de que a Pessoa
  participa, todos em ordem alfabética. O Canal privado aparece com o cadeado no lugar do `#`, ali
  e no cabeçalho.
- Quem não participa não vê o Canal privado na barra lateral, nem o nome dele em lugar nenhum.
- O endereço de um Canal privado aberto por quem não participa mostra o mesmo aviso de Conversa não
  encontrada de um endereço que não existe. Nada na resposta diz que o Canal existe.
- Uma conta criada depois do Canal privado não participa dele.
- Dentro do Canal privado, as Mensagens funcionam como no Canal público (PRD da F02, H4 e H5).

**H3.** Como Participante de um Canal privado, quero convidar outras Pessoas para trazer quem
passou a precisar da conversa.

- O cabeçalho do Canal privado tem a ação "Convidar pessoas", disponível a todos os Participantes.
- O campo de Convite busca Pessoas enquanto a Pessoa digita, a partir do primeiro caractere, pelo
  começo de qualquer palavra do nome ou do @usuário, sem diferenciar maiúsculas e acentos: "car"
  acha "Ana Carla" e "@carlos". Mostra até 10 resultados, em ordem de nome, cada um com o nome e o
  @usuário. Bots não aparecem.
- A Pessoa escolhe uma ou várias Pessoas antes de confirmar e pode tirar uma escolha antes disso.
- Quem já participa, inclusive a própria Pessoa, aparece na busca marcado como Participante e não
  pode ser escolhido.
- Não há limite de Pessoas escolhidas de uma vez nem de Participantes num Canal privado.
- O campo avisa que quem for convidado vê todo o histórico do Canal. O aviso só aparece em
  "Convidar pessoas", porque no diálogo de criar o Canal ainda não tem histórico.
- Ao confirmar, o diálogo fecha, e quem convidou vê na hora o Aviso no histórico e a contagem de
  Participantes com os novos. Os outros Participantes os veem ao reabrir o Canal ou recarregar a
  página, como as Mensagens até a funcionalidade 05.
- A Pessoa convidada passa a participar na hora, sem aceitar nem recusar, e vê o Canal na barra
  lateral quando recarrega a página, com todo o histórico anterior.
- Cada Convite fica num Aviso no histórico, como "@ana convidou @bruno e @carla", visível a todos
  os Participantes, no ponto em que aconteceu. O Aviso lista todos os convidados, sem encurtar, e
  mostra o @usuário atual de cada Pessoa. Se uma Pessoa for apagada (o que só acontece fora do
  produto), o Aviso continua no histórico, com "alguém" no lugar dela.
- O Aviso no histórico não é Mensagem: ninguém o edita nem o apaga, ele não conta como Não lida
  (funcionalidade 06) e não entra no Resumo (funcionalidade 11).
- Os Convites feitos no diálogo de criação seguem as mesmas regras e ganham um Aviso só, com
  todos os convidados, no começo do histórico. O Canal privado criado só com quem o criou não tem
  Aviso, porque o começo do Canal já mostra quem o criou.

**H4.** Como Participante de um Canal privado, quero ver quem participa dele para saber quem lê o
que escrevo ali.

- O cabeçalho do Canal privado mostra quantas Pessoas participam.
- Essa contagem abre a lista dos Participantes, com o nome e o @usuário de cada um, em ordem de
  nome.
- O Canal público não mostra contagem nem lista, porque todo Canal público tem todas as Pessoas
  (PRD da F02).

**H5.** Como Pessoa, quero criar um Canal privado e convidar Pessoas só com o teclado para não
depender do mouse.

- "Tornar privado" liga e desliga pelo teclado.
- Na busca de Pessoas, as setas percorrem os resultados, Enter escolhe, e as escolhas podem ser
  tiradas pelo teclado.
- "Convidar pessoas" e a lista de Participantes abrem e fecham pelo teclado (Esc fecha), e o foco
  volta ao botão que os abriu.
- Os textos e os avisos da tela estão em português do Brasil.

### O que não é objetivo

- Remover Participantes, sair de um Canal e entrar em Canais: ficam para a Fase 2 (product brief,
  "Fora de escopo").
- Trocar o tipo de um Canal, de público para privado ou ao contrário.
- Convite pendente, que a Pessoa aceita ou recusa: o Convite vale na hora.
- Aviso na tela ou do navegador para a Pessoa convidada: as notificações ficam com a funcionalidade
  08. O Canal aparecer na hora, sem recarregar, fica com a funcionalidade 05.
- Bots em Canais privados e Pedidos a Agentes neles: ficam com a funcionalidade 10.
- Convidar por Menção: quando a funcionalidade 06 chegar, mencionar quem não participa do Canal
  privado não o convida nem o avisa. O Convite só acontece por "Convidar pessoas".
- Papel de dono ou de administrador do Canal privado.
- Renomear, editar a descrição, arquivar e apagar Canais.
- Lista de Participantes no Canal público.
- Perfil da Pessoa a partir da lista de Participantes: fica com a funcionalidade 04.

## 3. Requisitos do sistema de IA

Não se aplica. Esta funcionalidade não envolve Agentes.

## 4. Riscos de produto

| Risco | Mitigação |
| --- | --- |
| O nome ou a existência de um Canal privado vaza para quem não participa | O endereço responde como Conversa inexistente, e a barra lateral só mostra os Canais privados da Pessoa |
| Quem tenta criar um Canal com o nome de um Canal privado descobre que existe um Canal com esse nome | Aceito: o nome é único em todo o Workspace (decidido na F02) para não haver dois `#nome` iguais. O aviso não diz se o Canal é público ou privado |
| A Pessoa convida alguém por engano e não consegue desfazer, porque remover fica para a Fase 2 | As escolhas mostram o nome e o @usuário e podem ser tiradas antes de confirmar. Um comando do Operador para remover Participante é A definir, se o problema aparecer no uso |
| O convidado lê Mensagens antigas que não eram para ele | O campo de Convite avisa que quem for convidado vê todo o histórico |
| As Pessoas não percebem que foram convidadas, porque não há aviso | O Aviso no histórico e o Canal na barra lateral cobrem até a funcionalidade 05 trazer a barra lateral na hora e a 08 as notificações |
| A Pessoa escreve num Canal privado achando que é público, ou o contrário | O cadeado no lugar do `#` na barra lateral e no cabeçalho, e a contagem de Participantes só no Canal privado |
