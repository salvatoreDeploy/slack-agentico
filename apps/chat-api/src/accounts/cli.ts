// Ponto de entrada do comando de contas (`pnpm accounts`), que roda do build: o Nest precisa dos
// metadados de tipo que só o `nest build` emite. Liga o executor ao terminal.
import 'reflect-metadata';
import password from '@inquirer/password';
import { runAccountsCommand } from './accounts-command.js';

try {
  process.exitCode = await runAccountsCommand(process.argv.slice(2), {
    readPassword: (message) => password({ message }),
    log: (message) => console.log(message),
    error: (message) => console.error(message),
  });
} catch (error) {
  // Só o nome e a mensagem: o objeto inteiro de um erro do banco traz os valores gravados, como o
  // hash da senha, e nenhuma saída do comando mostra a senha nem o hash.
  if (error instanceof Error && error.name === 'ExitPromptError') {
    console.error('Operação cancelada. Nada foi criado.');
  } else if (error instanceof Error) {
    console.error(`Erro inesperado: ${error.name}: ${error.message}`);
  } else {
    console.error('Erro inesperado.');
  }
  process.exitCode = 1;
}
