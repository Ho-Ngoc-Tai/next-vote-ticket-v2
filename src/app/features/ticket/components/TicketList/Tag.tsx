"use client";

import { cn } from "@/lib/utils";

export function Tag({ children, className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      role="listitem"
      className={cn(
        "font-bold inline-flex items-center rounded-md border border-transparent bg-secondary/80 px-2 py-0.5 text-xs text-muted-foreground hover:bg-secondary transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
