import { cn } from "@/lib/utils";
import * as React from "react";

export function Button({
  className,
  variant = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }) {
  return (
    <button
      className={cn(
        "font-size: 30px",
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        "bg-[#F57C00] text-white hover:bg-[#F57C00]/90", // Oranye tua dengan teks putih
        `variant-${variant}`,
        className
      )}
      {...props}
    />
  );
}