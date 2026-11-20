# Validação visual: tela Entrar em "Tentativas demais" (F01-T05)

Comparação da tela Entrar no estado "Tentativas demais" com o frame "Login / Tentativas demais"
do Pencil (`slack-ia.pen`), pelo `get_screenshot` do cartão do frame. O frame já existia, e nada
foi desenhado nesta tarefa.

## Como o estado foi produzido

Uma Pessoa de verificação gravada no banco `chat`, com o e-mail bloqueado por uma linha em
`login_attempts` (`blocked_until` = agora + 15 min). Com o `playwright-cli` no contêiner `e2e`,
contra o `pnpm dev`, em 1440 × 900: preencher o e-mail e a senha certa e clicar em "Entrar". O tema
escuro foi ligado com `data-theme="dark"` na raiz. A Pessoa e a linha foram apagadas no fim.
As capturas, nos dois temas, foram conferidas pelo usuário e apagadas antes do commit
(`AGENTS.md` da raiz, "Planejamento").

## O que foi comparado

| Ponto | Frame | Tela | Resultado |
| --- | --- | --- | --- |
| Texto | "Muitas tentativas de entrar. Aguarde alguns minutos e tente de novo." | Igual | Igual |
| Lugar | Entre a Senha e o botão | Igual | Igual |
| Estilo da mensagem | Texto pequeno, cor de erro | `text-small`, `text-danger-fg` | Igual |
| Campos | E-mail e Senha preenchidos, sem borda de erro | Igual | Igual |
| Botão | "Entrar", primário, largura total | Igual | Igual |
| Tema escuro | Variables do tema escuro | Tokens do tema escuro | Coerente |

Os atributos de acessibilidade (`role="alert"`, foco no botão) são provados pelo teste
`tentativas-demais`.
