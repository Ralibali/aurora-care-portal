import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { EmptyState, ErrorState, LoadingRows } from "@/components/common/States";
import { reportsQuery } from "@/lib/data";
import { formatMonth, formatPercent } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/rapporter")({
  component: AdminReports,
});

const statusLabels: Record<string, string> = {
  draft: "Utkast",
  ready: "Klar",
  sent: "Skickad",
  overdue: "Försenad",
};

function AdminReports() {
  const { data, isLoading, error } = useQuery(reportsQuery);
  if (isLoading) return <LoadingRows rows={4} />;
  if (error) return <ErrorState message={(error as Error).message} />;
  const rows = data ?? [];
  if (rows.length === 0) {
    return <EmptyState title="Inga rapporter" description="Månadsrapporter visas här när de skapats." />;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-border/70 bg-card">
      <table className="w-full min-w-[40rem] text-sm">
        <thead>
          <tr className="border-b border-border bg-surface/70 text-left">
            <th scope="col" className="p-3 font-medium">Period</th>
            <th scope="col" className="p-3 font-medium">Sajt</th>
            <th scope="col" className="p-3 font-medium">Uppetid</th>
            <th scope="col" className="p-3 font-medium">Uppdateringar</th>
            <th scope="col" className="p-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-border/60 last:border-0">
              <td className="p-3">
                <Link to="/rapport/$reportId" params={{ reportId: r.id }} className="font-medium hover:underline">
                  {formatMonth(r.period_month)}
                </Link>
              </td>
              <td className="p-3 text-muted-foreground">{r.sites?.name ?? "–"}</td>
              <td className="p-3 tabular-nums text-muted-foreground">{formatPercent(r.uptime_pct)}</td>
              <td className="p-3 tabular-nums text-muted-foreground">{r.updates_applied}</td>
              <td className={r.status === "overdue" ? "p-3 font-medium text-danger" : "p-3 text-muted-foreground"}>
                {statusLabels[r.status] ?? r.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
