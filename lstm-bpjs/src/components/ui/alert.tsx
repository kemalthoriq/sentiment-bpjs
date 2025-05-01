import { cn } from "@/lib/utils";

export function Alert({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative w-full rounded-lg border p-4", className)}>
      {children}
    </div>
  );
}

export function AlertTitle({ children }: { children: React.ReactNode }) {
  return <h5 className="mb-1 font-medium leading-none">{children}</h5>;
}

export function AlertDescription({ children }: { children: React.ReactNode }) {
  return <div className="text-sm text-muted-foreground">{children}</div>;
}
