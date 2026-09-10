import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { EmptyState, ErrorState, LoadingRows } from "@/components/common/States";
import { Badge } from "@/components/ui/badge";
import { supportRequestsQuery } from "@/lib/data";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/support")({
  component: AdminSupport,
});

const statusLabels: Record<string, string> = {
  new: "Ny",
  in_progress: "Pågår",
  answered: "Besvarad",
  closed: "Avslutad",
};

function AdminSupport() {
  const { data, isLoading, error } = useQuery(supportRequestsQuery);
  if (isLoading) return <LoadingRows rows={4} />;
  if (error) return <ErrorState message={(error as Error).message} />;
  const rows = data ?? [];
  if (rows.length === 0) {
    return <EmptyState title="Inga supportärenden" description="Ärenden från kundportalen hamnar här." />;
  }
  return (
    <ul className="divide-y divide-border/70 rounded-xl border border-border/70 bg-card px-4">
      {rows.map((r) => (
        <li key={r.id} className="flex flex-wrap items-start justify-between gap-3 py-4">
          <div className="min-w-0">
            <p className="font-medium">{r.subject}</p>
            <p className="text-sm text-muted-foreground">
              {r.sites?.name ?? "Ingen sajt angiven"} · {formatDateTime(r.created_at)}
            </p>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{r.message}</p>
          </div>
          <Badge variant={r.status === "closed" ? "secondary" : "default"}>
            {statusLabels[r.status] ?? r.status}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
