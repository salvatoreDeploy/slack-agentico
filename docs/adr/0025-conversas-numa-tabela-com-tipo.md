---
status: aceita
---

# 0025 · Canais e Conversas diretas numa tabela só, com tipo

Canal público, Canal privado e Conversa direta ficam numa tabela única de Conversas, com o tipo,
e não em tabelas separadas. Assim, a Mensagem, a participação e os contadores apontam sempre para
uma Conversa, sem chave estrangeira que dependa do tipo nem uma tabela de Mensagens para cada um.
O nome e a descrição só existem nos Canais, e a unicidade do nome vale só entre eles.

Descartadas: uma tabela para Canais e outra para Conversas diretas, com a Mensagem apontando para
uma das duas.
Custo aceito: colunas que valem para um tipo só (nome, descrição, criador), com as regras de cada
tipo conferidas por restrição no banco.
