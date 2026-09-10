import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { siteHealth } from "@/components/app/SiteHealthPanels";
import { DemoBadge, HealthBadge } from "@/components/common/HealthBadge";
import { EmptyState, ErrorState, LoadingRows } from "@/components/common/States";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sitesQuery } from "@/lib/data";
import { formatPercent, relativeAge } from "@/lib/format";
import { healthWeight } from "@/lib/health";

export const Route = createFileRoute("/_authenticated/admin/sajter/")({
  component: AdminSites,
});

function AdminSites() {
  const { data, isLoading, error } = useQuery(sitesQuery);
  const [q, setQ] = useState("");

  if (isLoading) return <LoadingRows rows={5} />;
  if (error) return <ErrorState message={(error as Error).message} />;

  const rows = (data ?? [])
    .map((site) => ({ site, status: siteHealth(site) }))
    .filter(({ site }) => {
      const needle = q.trim().toLowerCase();
      if (!needle) return true;
      return (
        site.name.toLowerCase().includes(needle) ||
        site.domain.toLowerCase().includes(needle) ||
        (site.customers?.name ?? "").toLowerCase().includes(needle)
      );
    })
    .sort((a, b) => healthWeight[a.status] - healthWeight[b.status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Sök på sajt, domän eller kund"
          className="max-w-xs"
          aria-label="Sök sajter"
        />
        <Button asChild>
          <Link to="/admin/onboarding">Lägg till sajt</Link>
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="Inga sajter matchar"
          description="Justera sökningen eller lägg till en ny sajt via onboarding."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/70 bg-card">
          <table className="w-full min-w-[48rem] text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/70 text-left">
                <th scope="col" className="p-3 font-medium">Sajt</th>
                <th scope="col" className="p-3 font-medium">Kund</th>
                <th scope="col" className="p-3 font-medium">Plan</th>
                <th scope="col" className="p-3 font-medium">Status</th>
                <th scope="col" className="p-3 font-medium">Uppetid</th>
                <th scope="col" className="p-3 font-medium">Backup</th>
                <th scope="col" className="p-3 font-medium">Uppdateringar</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ site, status }) => (
                <tr key={site.id} className="border-b border-border/60 last:border-0">
                  <td className="p-3">
                    <Link
                      to="/admin/sajter/$siteId"
                      params={{ siteId: site.id }}
                      className="font-medium hover:underline"
                    >
                      {site.name}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {site.domain}
                      {site.is_demo ? <DemoBadge /> : null}
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{site.customers?.name ?? "–"}</td>
                  <td className="p-3 text-muted-foreground">{site.plans?.name ?? "–"}</td>
                  <td className="p-3">
                    <HealthBadge status={status} />
                  </td>
                  <td className="p-3 tabular-nums text-muted-foreground">
                    {formatPercent(site.uptime_30d)}
                  </td>
                  <td className="p-3 text-muted-foreground">{relativeAge(site.last_backup_at)}</td>
                  <td className="p-3 tabular-nums text-muted-foreground">
                    {site.pending_updates ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
