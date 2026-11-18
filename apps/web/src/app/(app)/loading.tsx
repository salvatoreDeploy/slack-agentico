import { Spinner } from "../components/spinner";

/** Porta "Carregando o app": enquanto o layout com Sessão confere a Sessão na API do chat. */
export default function AppLoading() {
  return (
    <div className="flex flex-1 items-center justify-center bg-surface">
      <Spinner label="Carregando o app" />
    </div>
  );
}
