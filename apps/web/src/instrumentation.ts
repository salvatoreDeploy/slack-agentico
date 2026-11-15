// Roda uma vez, na subida do servidor do Next, antes da primeira requisição: uma variável de
// ambiente ausente ou inválida derruba a subida, e não a primeira requisição (LLD, "Configuração").
export async function register(): Promise<void> {
  // NEXT_RUNTIME é do próprio Next e diz em qual runtime o register roda; a configuração da web só
  // é usada no runtime Node.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { loadEnv } = await import("./config/env");
    loadEnv();
  }
}
