export function Separator({ className }: { className?: string }) {
  return (
    <div
      className={"shrink-0 bg-border h-[1px] w-full " + (className || "")}
    />
  );
}
