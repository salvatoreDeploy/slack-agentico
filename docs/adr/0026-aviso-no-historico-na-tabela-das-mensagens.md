---
status: aceita
---

# 0026 · Aviso no histórico na tabela das Mensagens, com tipo

O Aviso no histórico (GLOSSARY.md) fica na mesma tabela das Mensagens, com uma coluna de tipo, e
não numa tabela própria. Assim, ele entra na mesma ordem e na mesma paginação do histórico, pelo
mesmo id em UUID v7 e pelo mesmo cursor `before`, sem juntar duas tabelas a cada página. As regras
que valem só para a Mensagem (autor, `client_message_id`, corpo, edição, Não lidas e Resumo)
filtram pelo tipo, e as colunas de cada tipo são conferidas por restrição no banco.

Descartada: uma tabela de Avisos, com o histórico montado pela junção das duas e um cursor que
precisaria saber de qual delas veio o último item.
Custo aceito: colunas que valem para um tipo só, e cada leitura de Mensagens das funcionalidades
seguintes (Não lidas, Menções, Resumo, edição) precisa lembrar de filtrar pelo tipo. O Aviso guarda
quem convidou e quem foi convidado sem chave estrangeira, para continuar no histórico quando a
Pessoa é apagada.
