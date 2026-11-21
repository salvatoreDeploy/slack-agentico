import { ConversationSkeleton } from "../../components/conversation-skeleton";

/**
 * Enquanto a página da casca busca a Conversa, só a área principal espera, com o esqueleto do
 * frame "Conversa / Estrutura / Histórico carregando", e a barra lateral continua visível. O
 * `<Suspense>` deste arquivo também é o que deixa a troca de Canal instantânea com o
 * `cacheComponents` (spec da F02, "BFF e telas", "Carregamento").
 */
export default function ShellLoading() {
  return <ConversationSkeleton />;
}
