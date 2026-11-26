import type { ComponentProps } from "react";
import { cn } from "../utils/cn";
import { CONTROL_CLASSES } from "./input";

/** Campo de várias linhas: `min-h-20`, `py-2`, com a borda e os estados do Input (design system, "Textarea"). */
export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(CONTROL_CLASSES, "min-h-20 resize-none py-2", className)} {...props} />;
}
