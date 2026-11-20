import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { queryTestDatabase } from './test-database.js';

export const WRONG_PASSWORD = 'senha-errada-1';

export interface LoginAttemptRow {
  email: string;
  failures: number;
  window_started_at: Date;
  blocked_until: Date | null;
}

/** Erra a senha `times` vezes, uma depois da outra; falha sozinho se alguma não responder 401. */
export async function failLogins(
  app: INestApplication<App>,
  email: string,
  times: number,
): Promise<void> {
  for (let i = 0; i < times; i++) {
    await request(app.getHttpServer())
      .post('/v1/sessions')
      .send({ email, password: WRONG_PASSWORD })
      .expect(401);
  }
}

/** Grava o e-mail bloqueado até agora + `endsInMs` (negativo: um bloqueio que já passou). */
export async function blockLogin(email: string, endsInMs: number): Promise<void> {
  await queryTestDatabase(
    `INSERT INTO login_attempts (email, failures, window_started_at, blocked_until)
     VALUES ($1, 0, now(), now() + $2::bigint * interval '1 millisecond')
     ON CONFLICT (email) DO UPDATE
       SET failures = 0, window_started_at = now(), blocked_until = EXCLUDED.blocked_until`,
    [email, endsInMs],
  );
}

/** Recua o início da janela das falhas do e-mail, como se o tempo passasse. */
export async function ageLoginWindow(email: string, byMs: number): Promise<void> {
  await queryTestDatabase(
    `UPDATE login_attempts SET window_started_at = window_started_at - $2::bigint * interval '1 millisecond'
     WHERE email = $1`,
    [email, byMs],
  );
}

export async function findLoginAttempt(email: string): Promise<LoginAttemptRow | undefined> {
  const rows = await queryTestDatabase<LoginAttemptRow>(
    'SELECT email, failures, window_started_at, blocked_until FROM login_attempts WHERE email = $1',
    [email],
  );
  return rows[0];
}
