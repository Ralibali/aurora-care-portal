import { useQueries } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { siteHealth } from "@/components/app/SiteHealthPanels";
import { HealthBadge } from "@/components/common/HealthBadge";
import { StatCard } from "@/components/common/StatCard";
import { ErrorState, LoadingRows } from "@/components/common/States";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { billingQuery, incidentsQuery, reportsQuery, sitesQuery } from "@/lib/data";
import { formatMonth, formatSek } from "@/lib/format";
import { healthWeight } from "@/lib/health";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const [sites, incidents, reports, billing] = useQueries({
    queries: [sitesQuery, incidentsQuery, reportsQuery, billingQuery],
  });

  if (sites.isLoading || incidents.isLoading || reports.isLoading || billing.isLoading) {
    return <LoadingRows rows={5} />;
  }
  const error = sites.error ?? incidents.error ?? reports.error ?? billing.error;
  if (error) return <ErrorState message={(error as Error).message} />;

  const siteList = sites.data ?? [];
  const withHealth = siteList.map((s) => ({ site: s, status: siteHealth(s) }));
  const healthy = withHealth.filter((s) => s.status === "healthy").length;
  const attention = withHealth.filter((s) => s.status === "attention").length;
  const critical = withHealth.filter((s) => s.status === "critical").length;

  const openIncidents = (incidents.data ?? []).filter((i) => i.status !== "resolved");
  const overdueReports = (reports.data ?? []).filter((r) => r.status === "overdue");
  const activeBilling = (billing.data ?? []).filter((b) => b.status === "active");
  const mrr = activeBilling.reduce((sum, b) => sum + Number(b.mrr_sek ?? 0), 0);

  const byPlan = new Map<string, number>();
  for (const b of billing.data ?? []) {
    if (b.status !== "active") continue;
    const name = b.plans?.name ?? "Utan plan";
    byPlan.set(name, (byPlan.get(name) ?? 0) + 1);
  }

  const needsAttention = withHealth
    .filter((s) => s.status !== "healthy")
    .sort((a, b) => healthWeight[a.status] - healthWeight[b.status]);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Månadsintäkt (MRR)" value={formatSek(mrr)} hint={`${activeBilling.length} aktiva abonnemang`} />
        <StatCard label="Sajter i drift" value={siteList.length} hint={`${healthy} friska`} />
        <StatCard
          label="Behöver åtgärd"
          value={attention + critical}
          tone={critical > 0 ? "danger" : attention > 0 ? "warning" : "success"}
          hint={`${critical} kritiska`}
        />
        <StatCard
          label="Öppna incidenter"
          value={openIncidents.length}
          tone={openIncidents.length > 0 ? "warning" : "success"}
          hint={`${overdueReports.length} försenade rapporter`}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/70 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Sajter som behöver ses över</CardTitle>
          </CardHeader>
          <CardContent>
            {needsAttention.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Alla sajter är friska just nu. Inga åtgärder krävs.
              </p>
            ) : (
              <ul className="divide-y divide-border/70">
                {needsAttention.map(({ site, status }) => (
                  <li key={site.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link
                        to="/admin/sajter/$siteId"
                        params={{ siteId: site.id }}
                        className="font-medium hover:underline"
                      >
                        {site.name}
                      </Link>
                      <p className="truncate text-sm text-muted-foreground">{site.domain}</p>
                    </div>
                    <HealthBadge status={status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base">Abonnemang per plan</CardTitle>
          </CardHeader>
          <CardContent>
            {byPlan.size === 0 ? (
              <p className="text-sm text-muted-foreground">Inga aktiva abonnemang.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {[...byPlan.entries()].map(([name, count]) => (
                  <li key={name} className="flex justify-between">
                    <span>{name}</span>
                    <span className="font-medium tabular-nums">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base">Rapportstatus</CardTitle>
          </CardHeader>
          <CardContent>
            {(reports.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Inga rapporter skapade ännu.</p>
            ) : (
              <ul className="divide-y divide-border/70">
                {(reports.data ?? []).slice(0, 6).map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <span className="min-w-0 truncate">
                      {r.sites?.name ?? "Sajt"} · {formatMonth(r.period_month)}
                    </span>
                    <span
                      className={
                        r.status === "overdue" ? "font-medium text-danger" : "text-muted-foreground"
                      }
                    >
                      {reportStatusLabels[r.status]}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export const reportStatusLabels: Record<string, string> = {
  draft: "Utkast",
  ready: "Klar",
  sent: "Skickad",
  overdue: "Försenad",
};
