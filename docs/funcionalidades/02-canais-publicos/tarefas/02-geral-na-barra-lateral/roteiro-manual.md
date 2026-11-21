# Roteiro manual: migração do `#geral` (F02-T02)

Registro do CA8 da F02-T02, feito em 2026-11-21. Prova a parte da migração que o `chat_test` não
cobre, porque ele está vazio quando é migrado: as Pessoas que já existem passam a participar do
`#geral` (spec da F02, "Decisões de teste", "Roteiro manual").

## Passos

1. Com o ambiente de pé e o banco `chat` de desenvolvimento ainda sem a migração da F02, contar as
   Pessoas:

   ```bash
   docker compose -f compose.yaml exec postgres psql -U postgres -d chat -tA -c "SELECT count(*) FROM people"
   ```

2. Rodar as migrações pendentes:

   ```bash
   docker compose -f compose.yaml exec chat-api pnpm migration:run
   ```

3. Conferir o `#geral` e as participações:

   ```bash
   docker compose -f compose.yaml exec postgres psql -U postgres -d chat -c "
     SELECT c.name, c.description, c.created_by,
            (SELECT count(*) FROM people) AS pessoas,
            count(pa.person_id) AS participacoes
     FROM conversations c
     LEFT JOIN participations pa ON pa.conversation_id = c.id
     GROUP BY c.id"
   ```

## Resultado

- Passo 1: 1 Pessoa no banco.
- Passo 2: `Migration CreateConversationsAndParticipations1795280422958 has been executed
  successfully.`
- Passo 3:

  | name | description | created_by | pessoas | participacoes |
  | --- | --- | --- | --- | --- |
  | geral | Canal de todo o Workspace | (nulo) | 1 | 1 |

O `#geral` nasceu sem criador, com a descrição, e com a participação de todas as Pessoas que já
existiam. Aprovado.
