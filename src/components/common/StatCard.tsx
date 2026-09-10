import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
  icon?: ReactNode;
}) {
  return (
    <Card className="card-elevated border-border/70">
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p
            className={cn(
              "mt-1 text-2xl font-semibold tabular-nums tracking-tight",
              tone === "success" && "text-success",
              tone === "warning" && "text-warning-foreground",
              tone === "danger" && "text-danger",
            )}
          >
            {value}
          </p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        {icon ? <span className="shrink-0 text-muted-foreground">{icon}</span> : null}
      </CardContent>
    </Card>
  );
}
