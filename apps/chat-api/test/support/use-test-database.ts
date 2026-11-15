import { testDatabaseUrl } from './test-database-url.js';

// Roda antes de cada arquivo de teste: a aplicação sobe contra o chat_test, e nunca contra o chat.
process.env.DATABASE_URL = testDatabaseUrl();
// Nos testes, só avisos e erros chegam ao log, para a saída da suíte continuar legível.
process.env.LOG_LEVEL = 'warn';
