# Validação visual: diálogo "Trocar senha" (F01-T07)

Comparação do diálogo "Trocar senha", do menu do usuário com o item novo e do toast de sucesso com
os frames `Diálogos / Trocar senha / <Estado>` do Pencil (`slack-ia.pen`, seção "Diálogos da
casca"), desenhados nesta tarefa antes do código (CA3).

## Os frames

Feitos a partir dos frames de "Editar perfil" (Dialog, DialogHeader, campos e DialogFooter), de
"Casca / Menu do usuário / Disponível" e do toast de "Portas / Toast de sucesso", para usar os
mesmos componentes do arquivo. O `slack-ia.pen` não tem variables: os frames existentes usam os
valores direto, e os novos herdam os mesmos valores das cópias. Frames: Padrão, Enviando, Senha
atual errada, Senha igual, Senha curta, Tentativas demais, Falha no envio, Menu e Sucesso. O
usuário conferiu os frames antes do código.

## Como cada estado foi produzido

Com o `playwright-cli` no contêiner `e2e`, contra o `pnpm dev`, em 1440 × 900, com uma Pessoa de
verificação gravada no banco `chat` e apagada no fim. O tema escuro foi ligado com
`data-theme="dark"` na raiz, e cada estado foi capturado nos dois temas.

| Estado | Como |
| --- | --- |
| Menu | Clique no avatar do Rail |
| Padrão | "Trocar senha" no menu |
| Senha curta | Senha atual certa e "curta" na Senha nova |
| Senha igual | A senha atual nos dois campos |
| Senha atual errada | Senha atual errada e Senha nova válida |
| Enviando | O envio da Server Action segurado por 15 s no navegador, captura durante a espera |
| Falha no envio | O mesmo envio, abortado depois da espera |
| Tentativas demais | O e-mail bloqueado por uma linha em `login_attempts` |
| Sucesso | Senha atual certa e Senha nova válida |

As capturas foram conferidas pelo usuário e apagadas antes do commit (`AGENTS.md` da raiz,
"Planejamento").

## O que foi comparado

| Ponto | Frame | Tela | Resultado |
| --- | --- | --- | --- |
| Diálogo | 512 de largura, raio do cartão, elevação 3, overlay escuro | `max-w-lg`, `rounded-card`, `shadow-3`, `bg-surface-overlay` | Igual |
| Cabeçalho | Título, descrição e o X de fechar | Igual | Igual |
| Campos | "Senha atual" e "Senha nova", com o foco na primeira | Igual | Igual |
| Erros de campo | Texto abaixo do campo, borda de erro | `text-danger-fg`, `aria-invalid` | Igual |
| Erro geral | Texto no fim do corpo, cor de erro | `role="alert"`, `text-danger-fg` | Igual |
| Rodapé | "Cancelar" com borda e "Salvar" primário | `variant="secondary"` e `primary` | Igual |
| Enviando | "Salvar" esmaecido com o ícone de carregamento | `loading` | Igual |
| Menu | Cabeçalho, separador, "Trocar senha" (chave) e "Sair do Full Cycle" | Igual | Igual |
| Toast | Ícone de sucesso, texto e o X de fechar, no canto inferior direito | Sonner, com as cores dos tokens | Igual |
| Tema escuro | — | Tokens do tema escuro | Coerente |

Os textos e a tipografia da tela seguem o design system; os frames copiados mantêm os textos de
rótulo em cinza claro, como os frames de "Editar perfil" de onde vieram.
