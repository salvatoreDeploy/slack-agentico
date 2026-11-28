# Frames da F03

Registro do CA5 da F03-T01, feito em 2026-11-28 no `slack-ia.pen`, pelo MCP do Pencil.

## Frames

| Seção | Frame | Situação | O que mudou |
| --- | --- | --- | --- |
| Conversa | `Conversa / Estrutura / Canal privado` | Existia | Nada: tem o cadeado na barra lateral e no cabeçalho, e o botão com o ícone de pessoas e a contagem |
| Conversa | `Conversa / Sobreposições / Participantes do canal privado` | Ajustado (era `Membros do canal privado`) | Título "Participantes de #diretoria"; o @usuário no lugar do cargo; sem a bolinha de Presença; botão "Convidar pessoas"; a primeira Pessoa, com "(você)", passou de "Admin", uma conta de demonstração, a "Ana Souza" |
| Conversa | `Conversa / Lista / Aviso no histórico` | Novo, em 7680 × 2160 da seção | Cópia de `Canal privado` com o Aviso "@ana convidou @bruno e @carla" depois do separador "Hoje", alinhado ao texto das Mensagens, em Lato 13 no tom apagado, sem avatar nem horário |
| Diálogos da casca | `Diálogos / Convidar pessoas / Escolhidas` | Ajustado (era `Adicionar pessoas / Escolhidas`) | Título "Convidar pessoas para #planejamento-q4"; botão "Convidar"; resultados só com o @usuário, sem Presença |
| Diálogos da casca | `Diálogos / Convidar pessoas / Ninguém encontrado` | Ajustado | Os mesmos ajustes; o texto virou "Ninguém encontrado com esse nome ou @usuário." |
| Diálogos da casca | `Diálogos / Convidar pessoas / Enviando` | Ajustado | Os mesmos ajustes, com o spinner em "Convidar" |
| Diálogos da casca | `Diálogos / Convidar pessoas / Falha ao convidar` | Ajustado (era `Falha ao adicionar`) | Os mesmos ajustes; a falha virou "Não foi possível convidar as pessoas. Tente de novo." |
| Diálogos da casca | `Diálogos / Convidar pessoas / Pela lista de Participantes` | Ajustado (era `Pela lista de Membros`) | É o modo normal: "Cancelar" no lugar de "Voltar", a descrição virou "Quem você convidar vê todo o histórico do canal.", e Euller Cristian aparece com "Participante", esmaecido para mostrar que não pode ser escolhido |

Os quatro primeiros estados do diálogo estão no modo de criação, com "Pular" e a descrição "Só
quem está no canal vê as mensagens dele.". O modo normal muda só a descrição e o botão da
esquerda, como mostra o frame "Pela lista de Participantes".

## Microtexto

- "Convidar pessoas para #planejamento-q4", "Convidar" e "Participantes de #diretoria";
- "Quem você convidar vê todo o histórico do canal.", no modo normal;
- "Só quem está no canal vê as mensagens dele.", no modo de criação, que já existia;
- "Ninguém encontrado com esse nome ou @usuário.";
- "Não foi possível convidar as pessoas. Tente de novo.";
- "Participante", a marca no resultado de quem já participa;
- "@ana convidou @bruno e @carla", o Aviso no histórico.

## Fora da F03

- `Conversa / Sobreposições / Membros do canal`, do Canal público, ficou como estava: o PRD não tem
  lista de Participantes no Canal público.
- O cargo e a Presença saíram só dos frames da F03. Eles voltam com as F04 e F09.

## Problemas que já existiam no arquivo

- O arquivo não tem variables, como a F02-T01 registrou. Os trechos ajustados herdam os valores
  das cópias, e o tema escuro fica para a validação visual das tarefas de tela.
- Os títulos dos diálogos e os nomes das Pessoas usam tons do tema escuro (`#d1d2d3`) num diálogo
  claro, como nos frames da F02. O código segue os tokens.
- A cópia de `Canal privado` herdou os avisos de `fill_container` fora de layout que o frame de
  origem já tinha.

As capturas da conferência ficam na pasta da tarefa até o de acordo do usuário e são apagadas
antes do commit (`AGENTS.md` da raiz, "Planejamento").
