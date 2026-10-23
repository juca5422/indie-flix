import type * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-lg border border-border bg-bg px-3 text-sm text-text transition-colors outline-none placeholder:text-muted disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-danger",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
