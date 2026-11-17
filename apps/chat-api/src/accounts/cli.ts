// Ponto de entrada do comando de contas (`pnpm accounts`), que roda do build: o Nest precisa dos
// metadados de tipo que só o `nest build` emite. Liga o executor ao terminal.
import 'reflect-metadata';
import password from '@inquirer/password';
import { runAccountsCommand } from './accounts-command.js';

process.exitCode = await runAccountsCommand(process.argv.slice(2), {
  readPassword: (message) => password({ message }),
  log: (message) => console.log(message),
  error: (message) => console.error(message),
});
