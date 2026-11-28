# Plano da F03-T01: Design da F03 no Pencil

Tarefa: [tarefa.md](tarefa.md) · Spec: [spec.md](../../spec.md) · PRD: [prd.md](../../prd.md)

## Critérios

### CA1

**Marca:** revisão humana

**Cenário:** Quem revisa abre no `slack-ia.pen` os frames da decisão "Frames" e encontra:
- "Convidar pessoas", "Convidar" e "Participantes" no lugar de "Adicionar pessoas", "Adicionar" e
  "Membros", no microtexto e nos nomes dos frames;
- os estados Escolhidas, Ninguém encontrado, Enviando e Falha ao convidar;
- o aviso "Quem você convidar vê todo o histórico do canal." no frame do modo normal;
- a lista "Participantes de #diretoria", com "(você)" na própria Pessoa e o botão "Convidar
  pessoas".

### CA2

**Marca:** revisão humana

**Cenário:** Quem revisa olha os resultados da busca em cada frame do diálogo e encontra só o
avatar, o nome e o @usuário, sem cargo nem bolinha de Presença. No frame do modo normal, uma das
Pessoas aparece com a marca "Participante" e sem poder ser escolhida.

### CA3

**Marca:** revisão humana

**Cenário:** Quem revisa abre `Diálogos / Convidar pessoas / Escolhidas` e os outros três estados
e encontra o modo de criação: "Pular" no lugar de "Cancelar" e, no lugar do aviso de histórico, a
descrição "Só quem está no canal vê as mensagens dele.".

### CA4

**Marca:** revisão humana

**Cenário:** Quem revisa abre `Conversa / Lista / Aviso no histórico` e encontra um Canal privado
com Mensagens e, entre elas, a linha "@ana convidou @bruno e @carla", sem avatar nem horário de
Mensagem, no tom apagado.

### CA5

**Marca:** documento

**Cenário:** Quem revisa abre o `frames-da-f03.md` na pasta desta tarefa e encontra a tabela com
cada frame da decisão "Frames", se foi ajustado ou é novo e o que mudou, o microtexto novo e o que
ficou fora (o `Membros do canal`, do Canal público). As capturas da conferência ficam na pasta só
até o de acordo de quem revisa e são apagadas antes do commit (`AGENTS.md` da raiz,
"Planejamento").

## Contrato

O contrato não muda.

## Verificação do contrato

Nenhuma: a tarefa não cria rota, evento nem tabela.

## Decisões

- **Inventário feito no plano.** Com o `slack-ia.pen` aberto, o MCP leu os frames do Canal privado.
  Os quatro estados do diálogo de Convite já estão no modo de criação, com "Pular" e a descrição
  "Só quem está no canal vê as mensagens dele.". O frame aberto pela lista tem "Voltar". Nenhum tem
  a marca "Participante", e os resultados mostram cargo e Presença.
- **Frames:**

  | Frame hoje | Frame depois | O que a tarefa faz |
  | --- | --- | --- |
  | `Conversa / Estrutura / Canal privado` | O mesmo | Nada: tem o cadeado na barra lateral e no cabeçalho, e o botão com o ícone de pessoas e a contagem |
  | `Conversa / Sobreposições / Membros do canal privado` | `Conversa / Sobreposições / Participantes do canal privado` | Título "Participantes de #diretoria"; abaixo do nome, o @usuário no lugar do cargo; sem bolinha de Presença; botão "Convidar pessoas" |
  | `Diálogos / Adicionar pessoas / Escolhidas` | `Diálogos / Convidar pessoas / Escolhidas` | Título "Convidar pessoas para #planejamento-q4"; botão "Convidar"; resultados só com o @usuário |
  | `Diálogos / Adicionar pessoas / Ninguém encontrado` | `Diálogos / Convidar pessoas / Ninguém encontrado` | Os mesmos ajustes; o texto vira "Ninguém encontrado com esse nome ou @usuário." |
  | `Diálogos / Adicionar pessoas / Enviando` | `Diálogos / Convidar pessoas / Enviando` | Os mesmos ajustes; spinner em "Convidar" |
  | `Diálogos / Adicionar pessoas / Falha ao adicionar` | `Diálogos / Convidar pessoas / Falha ao convidar` | Os mesmos ajustes; a falha vira "Não foi possível convidar as pessoas. Tente de novo." |
  | `Diálogos / Adicionar pessoas / Pela lista de Membros` | `Diálogos / Convidar pessoas / Pela lista de Participantes` | É o modo normal: "Cancelar" no lugar de "Voltar", a descrição vira o aviso de histórico, e uma Pessoa aparece com a marca "Participante" |
  | — | `Conversa / Lista / Aviso no histórico` | Novo: cópia de `Conversa / Estrutura / Canal privado` com o Aviso entre as Mensagens |

- **Os estados valem nos dois modos.** Os estados Ninguém encontrado, Enviando e Falha ao convidar
  ficam desenhados só no modo de criação, que é como já existem. O modo normal muda só a descrição e
  o botão da esquerda, e o frame "Pela lista de Participantes" mostra isso. Desenhar os estados duas
  vezes duplicaria frames que divergem a cada ajuste.
- **Microtexto novo:**
  - "Convidar pessoas para #planejamento-q4", "Convidar" e "Participantes de #diretoria";
  - "Quem você convidar vê todo o histórico do canal.", no modo normal;
  - "Ninguém encontrado com esse nome ou @usuário.", porque a busca também acha pelo @usuário;
  - "Não foi possível convidar as pessoas. Tente de novo.";
  - "Participante", a marca no resultado de quem já participa;
  - "@ana convidou @bruno e @carla", o Aviso no histórico.
- **Fora da F03:** o `Conversa / Sobreposições / Membros do canal`, do Canal público, fica como
  está, porque o PRD não tem lista de Participantes no Canal público. O cargo e a Presença saem só
  dos frames da F03.
- **Sem variables no arquivo.** Como na F02-T01, o arquivo não tem variables, e os frames ajustados
  herdam os valores das cópias. O tema escuro é conferido na validação visual das tarefas de tela,
  contra os tokens do `globals.css`.
- **Texto do CA1.** O CA1 dizia que os estados do diálogo têm o aviso de histórico, mas eles
  estão no modo de criação, que não tem o aviso. O commit de plano corrige o CA1: o aviso fica no
  frame do modo normal.
- **Sem MCP, a tarefa para.** Com o `slack-ia.pen` fechado ou o MCP desconectado, a implementação
  para e avisa.

## Arquivos e interfaces

- `slack-ia.pen`: os ajustes e o frame novo da decisão "Frames", editados só pelo MCP `pencil`.
- `docs/funcionalidades/03-canais-privados/tarefas/01-design-no-pencil/frames-da-f03.md`: o
  registro do CA5.

## Testes existentes que mudam

Nenhum.

## Mudança de dados

Nenhuma.

## Documentos atualizados

- `docs/funcionalidades/03-canais-privados/spec.md`, seção "Design no Pencil": os nomes dos frames
  passam aos nomes novos da decisão "Frames".
- `tarefa.md` desta tarefa: o CA1 passa a pôr o aviso de histórico no frame do modo normal.
