import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { EmptyState, ErrorState, LoadingRows } from "@/components/common/States";
import { Badge } from "@/components/ui/badge";
import { incidentsQuery } from "@/lib/data";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/incidenter")({
  component: AdminIncidents,
});

const severityLabels: Record<string, string> = {
  low: "Låg",
  medium: "Medel",
  high: "Hög",
  critical: "Kritisk",
};

const statusLabels: Record<string, string> = {
  open: "Öppen",
  investigating: "Utreds",
  resolved: "Löst",
};

function AdminIncidents() {
  const { data, isLoading, error } = useQuery(incidentsQuery);
  if (isLoading) return <LoadingRows rows={4} />;
  if (error) return <ErrorState message={(error as Error).message} />;
  const rows = data ?? [];
  if (rows.length === 0) {
    return <EmptyState title="Inga incidenter" description="Inget driftavbrott eller säkerhetsärende är registrerat." />;
  }
  return (
    <ul className="divide-y divide-border/70 rounded-xl border border-border/70 bg-card px-4">
      {rows.map((incident) => (
        <li key={incident.id} className="flex flex-wrap items-start justify-between gap-3 py-4">
          <div className="min-w-0">
            <p className="font-medium">{incident.title}</p>
            <p className="text-sm text-muted-foreground">
              {incident.sites?.name ?? "Okänd sajt"} · öppnad {formatDateTime(incident.opened_at)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={incident.status === "resolved" ? "secondary" : "destructive"}>
              {statusLabels[incident.status] ?? incident.status}
            </Badge>
            <Badge variant="outline">{severityLabels[incident.severity] ?? incident.severity}</Badge>
          </div>
        </li>
      ))}
    </ul>
  );
}
