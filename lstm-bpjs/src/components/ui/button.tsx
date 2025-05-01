import { cn } from "@/lib/utils";
import * as React from "react";

export function Button({
  className,
  variant = "default", // Add variant to className logic
  // size = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        `variant-${variant}`,
        className
      )}
      {...props}
    />
  );
}
