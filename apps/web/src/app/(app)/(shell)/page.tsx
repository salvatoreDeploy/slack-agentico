import { MessagesSquare } from "lucide-react";
import { EmptyState } from "../../components/empty-state";

/** A Home na F01: o estado "Home / Vazio" na área principal da casca. */
export default function HomePage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <EmptyState
        icon={<MessagesSquare className="size-6" aria-hidden />}
        title="Nenhuma conversa ainda"
        description="Crie um canal ou comece uma conversa pela barra lateral."
      />
    </div>
  );
}
