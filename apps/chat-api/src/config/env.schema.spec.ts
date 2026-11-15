import { validateEnv } from './env.schema.js';

describe('validateEnv', () => {
  it('falha com o nome da variável quando falta uma obrigatória', () => {
    const env = { PORT: '3000' };

    expect(() => validateEnv(env)).toThrow(/DATABASE_URL/);
  });

  it('aplica os padrões de PORT e LOG_LEVEL', () => {
    const env = { DATABASE_URL: 'postgres://chat:chat@postgres:5432/chat' };

    const config = validateEnv(env);

    expect(config).toEqual({
      DATABASE_URL: 'postgres://chat:chat@postgres:5432/chat',
      PORT: 3000,
      LOG_LEVEL: 'info',
    });
  });

  it('falha com o nome da variável quando o valor é inválido', () => {
    const env = { DATABASE_URL: 'postgres://chat:chat@postgres:5432/chat', LOG_LEVEL: 'alto' };

    expect(() => validateEnv(env)).toThrow(/LOG_LEVEL/);
  });
});
