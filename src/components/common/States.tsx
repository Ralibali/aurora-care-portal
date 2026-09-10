import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";

export function LoadingRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
      <span className="sr-only">Laddar innehåll</span>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface/60 p-8 text-center">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ message }: { message?: string }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-danger/30 bg-danger/10 p-6 text-sm text-danger"
    >
      <p className="font-semibold">Innehållet kunde inte hämtas</p>
      <p className="mt-1 text-foreground/80">
        {message ?? "Försök igen om en stund. Kvarstår felet, hör av dig till Aurora Media."}
      </p>
    </div>
  );
}
