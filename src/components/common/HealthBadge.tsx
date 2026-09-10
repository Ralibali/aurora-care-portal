import { cn } from "@/lib/utils";
import { healthLabels, type HealthStatus } from "@/lib/health";

const styles: Record<HealthStatus, string> = {
  healthy: "bg-success/15 text-success-foreground ring-success/30",
  attention: "bg-warning/20 text-warning-foreground ring-warning/40",
  critical: "bg-danger/15 text-danger ring-danger/30",
  unknown: "bg-muted text-muted-foreground ring-border",
};

export function HealthBadge({ status, className }: { status: HealthStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        styles[status],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          status === "healthy" && "bg-success",
          status === "attention" && "bg-warning",
          status === "critical" && "bg-danger",
          status === "unknown" && "bg-muted-foreground",
        )}
      />
      {healthLabels[status]}
    </span>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent-foreground ring-1 ring-inset ring-accent/30",
        className,
      )}
      title="Demodata – inte en verklig kund"
    >
      Demo
    </span>
  );
}
