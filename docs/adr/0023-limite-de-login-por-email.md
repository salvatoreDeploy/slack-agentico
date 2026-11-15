---
status: aceita
---

# 0023 · Limite de tentativas de login só pelo e-mail

O limite de tentativas de login conta as falhas por e-mail normalizado, exista a conta ou não, e
não pelo IP. A origem do IP atrás do proxy depende da PaaS, que ainda não foi escolhida (HLD, seção
12), e um limite por IP com o IP errado bloquearia todo mundo atrás do mesmo proxy ou não bloquearia
ninguém. Contar também e-mail inexistente impede que o bloqueio revele quais contas existem.

Descartadas: limite por IP; limite por e-mail e por IP juntos; Redis para guardar as falhas.
Custo aceito: uma pessoa consegue bloquear a conta de outra durante a `duração do bloqueio de login` (LLD, "Valores e configuração") errando a senha de
propósito, e um ataque que espalha senhas por muitos e-mails, a partir de um IP só, não é contido.
O bloqueio passa sozinho, e a chave é revista quando a PaaS e a origem do IP estiverem definidas.
