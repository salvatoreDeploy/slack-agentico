# Frames da F02

Registro do CA4 da F02-T01, feito em 2026-11-20 no `slack-ia.pen`, pelo MCP do Pencil.

## Frames

| Seção | Frame | Situação | O que mudou |
| --- | --- | --- | --- |
| Conversa | `Conversa / Estrutura / Canal público` | Existia | Nada |
| Conversa | `Conversa / Lista / Início do canal` | Existia | Nada; é o `#geral` vazio |
| Conversa | `Conversa / Lista / Início do canal com criador` | Novo | Cópia do anterior para o `#vendas`, com "@ana criou este canal em 20 de novembro." antes da descrição, a linha do `#vendas` ativa na barra lateral e o composer "Mensagem para #vendas" |
| Conversa | `Conversa / Mensagem / Enviando` | Existia | Nada |
| Conversa | `Conversa / Mensagem / Falha no envio` | Existia | Nada |
| Conversa | `Conversa / Composer / Perto do limite` | Novo | Cópia de `Conversa / Composer / Com texto`, com um texto longo e "Restam 150 caracteres" no lugar da dica do Shift+Enter, no mesmo lugar do contador de `Acima do limite` |
| Conversa | `Conversa / Composer / Acima do limite` | Existia | Nada |
| Conversa | `Conversa / Estrutura / Conversa não encontrada` | Existia | Nada |
| Diálogos da casca | `Diálogos / Criar canal / Padrão` | Ajustado | "Tópico" virou "Descrição", e o campo ganhou o contador "0/250" |
| Diálogos da casca | `Diálogos / Criar canal / Com nome` | Novo | Cópia do Padrão com "Café & Vendas" no nome e "O canal vai se chamar #cafe-vendas." no lugar da dica |
| Diálogos da casca | `Diálogos / Criar canal / Nome inválido` | Novo | Cópia de `Erro no nome` com o nome vazio e "Informe o nome do canal." |
| Diálogos da casca | `Diálogos / Criar canal / Erro no nome` | Ajustado | "Tópico" virou "Descrição", com o contador "0/250"; é o estado de nome já usado |
| Diálogos da casca | `Diálogos / Criar canal / Enviando` | Ajustado | "Tópico" virou "Descrição", com o contador "32/250" |
| Diálogos da casca | `Diálogos / Criar canal / Falha ao criar` | Ajustado | "Tópico" virou "Descrição", com o contador "32/250" |

Os frames novos ficam nas vagas livres da grade da seção: o do criador em 7680 × 1140 e o do
composer em 80 × 10360, na seção Conversa; os dois do diálogo em 7680 × 120 e 7680 × 2160, na
seção Diálogos da casca.

## Limiar do contador

O contador do composer aparece quando restam **200 caracteres ou menos**, 5% do `tamanho da
Mensagem`. O frame `Conversa / Composer / Perto do limite` mostra o estado com 150 restantes.

## Fora da F02 nos frames que já existem

Os frames mostram o produto inteiro. As tarefas de tela da F02 implementam só o que é da F02:

| Elemento | Onde aparece | Dona |
| --- | --- | --- |
| Seção Mensagens diretas e "Nova conversa" | Barra lateral | F04 |
| Seção Agentes e "Conectar agentes" | Barra lateral | F10 |
| Contagens de Não lidas e de Menções | Barra lateral e Rail | F06 |
| Atividade | Rail | F08 |
| Contagem de participantes | Cabeçalho do Canal | Nenhuma; fora de escopo no PRD |
| "Tornar privado" | Diálogo "Criar canal" | F03 |
| "Descartar" | `Conversa / Mensagem / Falha no envio` | Nenhuma; fora da F02 pela decisão do plano |
| Mensagens de Agente, com Citação ou com dados restritos | Histórico | F07, F10, F11 e F13 |

## Divergência do CA1: o arquivo não tem variables

O `get_variables` devolve o arquivo sem nenhuma variable, e os frames que já existem usam hex
solto, como a F01-T07 já tinha registrado. Por isso, os frames novos e os trechos ajustados não
usam variables: eles herdam os valores das cópias, e o contador novo usa o mesmo cinza
(`#ababad`) da dica que já existia no campo. Também não dá para conferir o escuro trocando o tema
do frame, porque não há tema no arquivo. O tema escuro fica para a validação visual das tarefas de
tela, contra os tokens do `globals.css`. O usuário decidiu seguir assim durante a implementação.

Fica proposta, fora da F02, uma tarefa para registrar no `slack-ia.pen` os tokens do
`docs/design-system.md` como variables, nos temas claro e escuro, e ligar os frames a elas.

## Problemas que já existiam no arquivo

Vistos durante a tarefa e não corrigidos, por não serem da F02:

- O `Conversa / Lista / Início da conversa consigo mesma` fica fora da área da seção Conversa,
  que tem 9.200 de largura.
- Nos frames de Conversa, o selo do Rail e o rótulo "Atividade" aparecem parcialmente cortados.
- Os frames do diálogo "Criar canal" têm o campo da descrição com fundo escuro (`#1a1d21`) num
  diálogo claro, e o texto em tons do tema escuro. As cópias novas herdaram isso.
- Quatro frames da seção Atividade aparecem parcialmente cortados.
