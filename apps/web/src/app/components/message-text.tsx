import { linkify } from "../utils/linkify";

/**
 * O texto de uma Mensagem como nós de texto, com os endereços `http` e `https` em links que abrem
 * numa aba nova. Nenhum texto vira HTML (spec da F02, "Texto da Mensagem").
 */
export function MessageText({ text }: { text: string }) {
  return (
    <p className="text-body break-words whitespace-pre-wrap text-fg">
      {linkify(text).map((part, index) =>
        part.kind === "link" ? (
          <a
            key={index}
            href={part.value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link hover:text-link-hover hover:underline"
          >
            {part.value}
          </a>
        ) : (
          part.value
        ),
      )}
    </p>
  );
}
