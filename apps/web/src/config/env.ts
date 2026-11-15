import "server-only";
import { z } from "zod";

const envSchema = z.object({
  // Endereço interno da API do chat, usado pelo BFF (LLD, "Valores e configuração").
  CHAT_API_URL: z.url(),
  // Domain do cookie de sessão; vazio deixa o cookie só de host, como no ambiente local.
  SESSION_COOKIE_DOMAIN: z.string().default(""),
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
  const problems = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
  throw new Error(`Configuração inválida. ${problems.join("; ")}`);
}

let loaded: Env | undefined;

/** As variáveis do servidor, validadas uma vez só, no primeiro uso. Nenhum outro arquivo lê `process.env`. */
export function loadEnv(): Env {
  loaded ??= validateEnv(process.env);
  return loaded;
}
