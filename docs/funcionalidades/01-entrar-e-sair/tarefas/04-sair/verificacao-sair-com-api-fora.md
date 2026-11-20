# Verificação: sair com a API do chat fora (F01-T04, CA2)

Feita pelo agente com o `playwright-cli`, no contêiner `e2e`, contra o `pnpm dev` da web, em
1440 × 900. Não entra na suíte porque para um serviço (`apps/web/AGENTS.md`, "Testes de ponta a
ponta").

## Passos

1. Uma Pessoa de verificação gravada no banco `chat` com o hash da senha de teste das fixtures.
2. Com a API de pé, entrar pela tela Entrar: a página vai para `/`, o navegador tem o cookie
   `session` e o banco tem 1 Sessão da Pessoa.
3. Parar os processos da API do chat no contêiner (`nest start --watch` e o `dist/main`) e
   confirmar que `http://localhost:3001` não responde.
4. Abrir o menu do usuário e escolher "Sair do Full Cycle".
5. Subir a API de novo e contar as Sessões da Pessoa no banco.
6. Apagar a Pessoa de verificação (as Sessões vão junto).

## Resultado

- Passo 4: a página foi para `http://localhost:3000/entrar`, com a tela Entrar, e o navegador
  ficou sem o cookie `session`. O snapshot e a captura foram
  conferidos pelo usuário e apagados antes do commit (`AGENTS.md` da raiz, "Planejamento").
- Passo 5: a Sessão continuou no banco (1 linha), como o LLD prevê ("Sessão no cliente": fica até
  vencer ou ser revogada).

Uma primeira rodada não valeu: o `pkill` não existe na imagem, a API continuou de pé, e a Sessão
foi apagada normalmente. Ela foi refeita com os processos parados pelo PID.

O 5xx segue o mesmo caminho do código que a falha de rede: `deleteSession` ignora a resposta, e a
ação apaga o cookie em qualquer caso.
