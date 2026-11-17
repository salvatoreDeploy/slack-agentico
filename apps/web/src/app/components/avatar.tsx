import { cn } from "../utils/cn";

const AVATAR_COLORS = [
  "bg-avatar-1",
  "bg-avatar-2",
  "bg-avatar-3",
  "bg-avatar-4",
  "bg-avatar-5",
  "bg-avatar-6",
] as const;

interface AvatarProps {
  /** Estável por Pessoa: escolhe a cor. */
  id: string;
  name: string;
  className?: string;
}

/** Avatar de iniciais, com a cor fixa da Pessoa entre as seis do design system. */
export function Avatar({ id, name, className }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-item text-small font-black text-fg-inverse",
        AVATAR_COLORS[colorIndex(id)],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? [words[0], words[words.length - 1]] : words;
  return letters.map((word) => word[0]?.toUpperCase() ?? "").join("");
}

function colorIndex(id: string): number {
  let sum = 0;
  for (const char of id) {
    sum = (sum + char.charCodeAt(0)) % AVATAR_COLORS.length;
  }
  return sum;
}
