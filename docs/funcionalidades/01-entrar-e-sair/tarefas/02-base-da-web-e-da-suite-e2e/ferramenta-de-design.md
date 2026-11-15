# Ferramenta de design da F01

Registro do CA7 da F01-T02, feito em 2026-11-15.

- **Ferramenta:** Pencil, pelo MCP dele, com o arquivo aberto no aplicativo. O MCP só responde
  enquanto o Pencil roda.
- **Arquivo:** `slack-ia.pen`.
- **Limite:** o plano gratuito do Pencil limita os dias de uso do MCP por período. Uma chamada
  recusada com "Free plan limit reached" bloqueia as tarefas de tela até o limite ser liberado.

## Frames da F01 lidos pelo MCP

| Seção | Frame | Estado |
| --- | --- | --- |
| Login | Login / Padrão | Existe |
| Login | Login / Erro de validação | Existe |
| Login | Login / Enviando | Existe |
| Login | Login / Credenciais incorretas | Existe |
| Login | Login / Falha no envio | Existe |
| Login | Login / Tentativas demais | Existe |
| Home | Home / Carregando | Existe |
| Home | Home / Vazio | Existe |
| Home | Home / Erro | Existe |
| Casca | Casca / Menu do usuário / Disponível (e os estados de Presença e notificações) | Existe; os itens de Presença e notificações ficam fora da F01 |
| Portas e toasts | Portas / Carregando o app | Existe |
| Portas e toasts | Portas / Erro de sessão | Existe |
| Portas e toasts | Portas / Toast de sucesso | Existe; usado no sucesso de "Trocar senha" |
| — | Diálogo "Trocar senha" | Falta; desenhado na tarefa F01-T07 |

## Observações

- O arquivo tem as Foundations (cores, tipografia, espaçamento, raios, elevação, layout e foco)
  e as seções de componentes ("Primitivos", "Entities", "Features e widgets"), mas nenhum nó
  marcado como componente reutilizável. As telas são lidas pelos frames, e um componente novo
  segue a seção correspondente.
- Os dois estados da tela Entrar que a spec pedia como frames novos, "Tentativas demais" e
  "Falha no envio", já existem no arquivo.
