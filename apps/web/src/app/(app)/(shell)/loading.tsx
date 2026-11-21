import { Spinner } from "../../components/spinner";

/**
 * Enquanto a página da casca busca a Conversa, só a área principal espera, e a barra lateral
 * continua visível. O `<Suspense>` deste arquivo também é o que deixa a troca de Canal instantânea
 * com o `cacheComponents`. O esqueleto do frame "Conversa / Estrutura / Histórico carregando"
 * entra com a F02-T03, junto com o histórico.
 */
export default function ShellLoading() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Spinner label="Carregando" />
    </div>
  );
}
