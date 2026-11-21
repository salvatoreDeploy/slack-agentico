import { Hash } from "lucide-react";
import { cn } from "../utils/cn";

/** O `#` do Canal público, decorativo: o nome ao lado já diz o que é. */
export function ChannelIcon({ className }: { className?: string }) {
  return <Hash className={cn("size-4 shrink-0", className)} aria-hidden />;
}
