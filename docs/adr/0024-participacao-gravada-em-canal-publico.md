---
status: aceita
---

# 0024 · Participação gravada de todas as Pessoas em cada Canal público

Todo Canal público tem uma participação gravada para cada Pessoa do Workspace: criar um Canal
público grava uma para cada Pessoa, e criar uma conta grava a da Pessoa nova em todos os Canais
públicos que existem. A participação não fica implícita no tipo do Canal. O motivo é que os
contadores de Não lidas e de Menções são gravados por Pessoa e Conversa
([ADR 0021](0021-contadores-gravados.md)) e precisam existir antes da primeira Mensagem. Além
disso, o Canal privado (F03) usa a mesma participação, e a conferência de acesso e as contagens
ficam iguais para os dois tipos de Canal.

Descartada: participação implícita, em que público quer dizer todo mundo e os registros por Pessoa
nascem sob demanda.
Custo aceito: N linhas por Canal público, irrelevante no tamanho do público-alvo; criar uma conta
ou um Canal público precisa gravar as participações na mesma transação, senão uma Pessoa fica fora
de um Canal que deveria ver. Um Bot não tem participação (GLOSSARY.md, "Bot").
