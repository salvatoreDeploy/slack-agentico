import { z } from 'zod';

const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'] as const;

export const envSchema = z.object({
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(LOG_LEVELS).default('info'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Valida as variáveis de ambiente. Uma variável ausente ou inválida derruba o processo com o
 * nome dela na mensagem (LLD, "Configuração").
 */
export function validateEnv(env: Record<string, unknown>): Env {
  const result = envSchema.safeParse(env);
  if (result.success) {
    return result.data;
  }
  const problems = result.error.issues.map(
    (issue) => `${issue.path.join('.')}: ${issue.message}`,
  );
  throw new Error(`Configuração inválida. ${problems.join('; ')}`);
}

let loaded: Env | undefined;

/** As variáveis do processo, validadas uma vez só, no primeiro uso. */
export function loadEnv(): Env {
  loaded ??= validateEnv(process.env);
  return loaded;
}
