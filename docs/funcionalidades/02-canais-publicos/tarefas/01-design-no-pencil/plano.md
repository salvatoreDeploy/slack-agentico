# Plano da F02-T01: Design da F02 no Pencil

Tarefa: [tarefa.md](tarefa.md) · Spec: [spec.md](../../spec.md) · PRD: [prd.md](../../prd.md)

## Critérios

### CA1

**Marca:** revisão humana

**Cenário:** Quem revisa abre o `slack-ia.pen` e encontra cada frame da decisão "Frames": os que
já existiam, com os ajustes da decisão, e os novos, nas seções dela. Os frames novos e os trechos
ajustados usam só as variables do arquivo e os componentes das seções "Primitivos", "Entities" e
"Features e widgets", sem cor, tamanho ou raio soltos. Em cada frame novo ou ajustado, quem revisa
troca o tema para o escuro e confere que nada fica com a cor do claro.

### CA2

**Marca:** revisão humana

**Cenário:** Quem revisa lê o texto de cada frame da decisão "Frames" e encontra o da decisão
"Microtexto", com o que quiser mudar no próprio frame, em português do Brasil. O diálogo "Criar
canal" chama o segundo campo de "Descrição", e não de "Tópico". O aviso de nome já usado não diz
se o Canal que tem o nome é público ou privado.

### CA3

**Marca:** revisão humana

**Cenário:** Quem revisa abre `Conversa / Composer / Perto do limite` e encontra o contador
aparecendo no limiar da decisão "Limiar do contador". Abre também `Conversa / Composer / Acima do
limite`, que já existe, e encontra o contador no tom de erro e o envio desabilitado.

### CA4

**Marca:** documento

**Cenário:** Quem revisa abre o `frames-da-f02.md` na pasta desta tarefa e encontra:
- a tabela com cada frame da decisão "Frames", a seção, se já existia, foi ajustado ou é novo, e
  o que foi ajustado;
- o limiar do contador;
- os elementos dos frames que existem e ficam fora da F02, com a funcionalidade dona de cada um
  (decisão "Fora da F02 nos frames que já existem").

As capturas da conferência ficam na pasta só até o de acordo de quem revisa e são apagadas antes
do commit (`AGENTS.md` da raiz, "Planejamento").

## Contrato

O contrato não muda.

## Verificação do contrato

Nenhuma: a tarefa não cria rota, evento nem tabela.

## Decisões

- **Inventário feito no plano.** Com o `slack-ia.pen` aberto, o MCP leu as seções Conversa, Casca
  e Diálogos da casca. A maior parte dos estados da F02 já tem frame. A tarefa reaproveita esses
  frames, mantém os nomes e o microtexto deles e só ajusta o que diverge do PRD e da spec, para
  não duplicar desenho.
- **Frames:**

  | Frame | Situação | O que a tarefa faz |
  | --- | --- | --- |
  | `Conversa / Estrutura / Canal público` | Existe | Nada: tem a seção Canais com a linha ativa, o cabeçalho com o nome e a descrição, o separador "Hoje" e Mensagens de vários autores |
  | `Conversa / Lista / Início do canal` | Existe | Nada: é o `#geral` vazio, "Este é o começo do canal #geral" e a descrição |
  | `Conversa / Lista / Início do canal com criador` | Novo | Cópia do anterior para um Canal comum, com a linha do criador abaixo do título |
  | `Conversa / Mensagem / Enviando` | Existe | Nada |
  | `Conversa / Mensagem / Falha no envio` | Existe | Nada |
  | `Conversa / Composer / Perto do limite` | Novo | Cópia de `Conversa / Composer / Com texto` com o contador |
  | `Conversa / Composer / Acima do limite` | Existe | Nada |
  | `Conversa / Estrutura / Conversa não encontrada` | Existe | Nada: o texto não revela se o Canal existe, e "Voltar ao início" leva a `/`, que redireciona para o `#geral` |
  | `Diálogos / Criar canal / Padrão` | Existe | Troca "Tópico" por "Descrição" e acrescenta o contador "0/250" ao campo |
  | `Diálogos / Criar canal / Com nome` | Novo | Cópia do Padrão com um nome digitado e a prévia do nome normalizado no lugar da dica |
  | `Diálogos / Criar canal / Nome inválido` | Novo | Cópia do Padrão com o erro de nome vazio |
  | `Diálogos / Criar canal / Erro no nome` | Existe | Troca "Tópico" por "Descrição"; é o estado de nome já usado |
  | `Diálogos / Criar canal / Enviando` | Existe | Troca "Tópico" por "Descrição" |
  | `Diálogos / Criar canal / Falha ao criar` | Existe | Troca "Tópico" por "Descrição" |

- **Um frame por estado, nos dois temas pelas variables.** Os frames novos são desenhados no
  claro, só com variables, e o escuro é conferido trocando o tema do frame. Não há cópia escura de
  cada frame, que dobraria o número de frames e divergiria a cada ajuste.
- **Microtexto.** O que já está nos frames vale como está. Os textos que já existem, para
  referência:
  - "Adicionar canal" na barra lateral;
  - "Mensagem para #geral" no composer;
  - "12 caracteres acima do limite";
  - "Não foi possível enviar." e "Tentar de novo";
  - "Conversa não encontrada", "Ela não existe ou você não participa dela." e "Voltar ao início";
  - "Já existe um canal chamado #geral.";
  - "Não foi possível criar o canal. Tente de novo.";
  - a dica "Minúsculas, sem espaços. Ex.: planejamento-q4".

  Os textos novos seguem o mesmo tom, e quem revisa pode mudá-los no CA2:
  - **Linha do criador:** "@ana criou este canal em 20 de novembro.".
  - **Contador perto do limite:** "Restam 150 caracteres".
  - **Prévia do nome:** "O canal vai se chamar #cafe-vendas.".
  - **Nome vazio:** "Informe o nome do canal.".
  - **Nome que fica vazio depois da normalização:** "Use letras ou números no nome." (o frame
    mostra só o de nome vazio, e a tarefa 05 usa o mesmo lugar para este).
  - **Nome longo:** "O nome pode ter até 80 caracteres.".
  - **Contador da descrição:** "0/250".
- **Fora da F02 nos frames que já existem.** Os frames mostram o produto inteiro. As tarefas de
  tela da F02 implementam só o que é da F02, e o resto fica nos frames para as funcionalidades
  donas:
  - a seção Mensagens diretas e "Nova conversa" (F04);
  - a seção Agentes (F10);
  - as contagens de Não lidas e Menções (F06);
  - a Atividade no Rail (F08);
  - a contagem de participantes no cabeçalho do Canal (fora de escopo no PRD);
  - "Tornar privado" no diálogo (F03);
  - as Mensagens de Agente, com Citação ou com dados restritos (F07, F10, F11 e F13).
- **Limiar do contador.** O contador do composer aparece quando restam 200 caracteres ou menos,
  5% do `tamanho da Mensagem`: aparece só perto do fim e ainda dá tempo de encurtar o texto. O
  frame é o dono do número, como a spec decidiu.
- **"Descartar" fica fora da F02.** O frame `Conversa / Mensagem / Falha no envio` tem, além de
  "Tentar de novo", um botão "Descartar", que o PRD e a spec não preveem. A tarefa 04 implementa
  só a nova tentativa, e o botão entra na lista do CA4 sem funcionalidade dona.
- **Falha ao criar entra na F02.** O frame `Diálogos / Criar canal / Falha ao criar` já existe, e
  a spec e a tarefa 05 passam a prever o estado: a mensagem no corpo do diálogo, com os campos
  preenchidos, como a F01 fez em "Trocar senha".
- **Sem MCP, a tarefa para.** Com o `slack-ia.pen` fechado ou com o limite do plano gratuito
  atingido, como aconteceu durante este plano, a implementação para e avisa.

## Arquivos e interfaces

- `slack-ia.pen`: os frames novos e os ajustes da decisão "Frames", editados só pelo MCP `pencil`.
- `docs/funcionalidades/02-canais-publicos/tarefas/01-design-no-pencil/frames-da-f02.md`: o
  registro do CA4.

## Testes existentes que mudam

Nenhum.

## Mudança de dados

Nenhuma.

## Documentos atualizados

- `docs/funcionalidades/02-canais-publicos/spec.md`, seção "BFF e telas": o diálogo "Criar Canal"
  ganha o estado de falha ao criar.
- `docs/funcionalidades/02-canais-publicos/spec.md`, seção "Design no Pencil": a lista de estados
  do diálogo passa a ter a falha ao criar, e a seção diz que os frames que já existem são
  reaproveitados.
- `docs/funcionalidades/02-canais-publicos/tarefas/05-criar-canal/tarefa.md`: o CA4 e o CA6
  passam a citar a falha ao criar.
