import { cn } from "@/lib/utils";

export function Logo({ className, tone = "default" }: { className?: string; tone?: "default" | "onDark" }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        aria-hidden="true"
        className="grid size-8 place-items-center rounded-lg aurora-gradient"
      >
        <span className="block size-3 rounded-full bg-accent" />
      </span>
      <span
        className={cn(
          "text-base font-semibold tracking-tight",
          tone === "onDark" ? "text-primary-foreground" : "text-foreground",
        )}
      >
        Aurora Care
      </span>
    </span>
  );
}
