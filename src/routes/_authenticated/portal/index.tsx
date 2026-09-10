import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { siteHealth } from "@/components/app/SiteHealthPanels";
import { DemoBadge, HealthBadge } from "@/components/common/HealthBadge";
import { EmptyState, ErrorState, LoadingRows } from "@/components/common/States";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sitesQuery } from "@/lib/data";
import { formatPercent, relativeAge } from "@/lib/format";
import { healthWeight } from "@/lib/health";

export const Route = createFileRoute("/_authenticated/portal/")({
  component: PortalSites,
});

function PortalSites() {
  const { data, isLoading, error } = useQuery(sitesQuery);

  if (isLoading) return <LoadingRows rows={3} />;
  if (error) return <ErrorState message={(error as Error).message} />;

  const sites = [...(data ?? [])].sort(
    (a, b) => healthWeight[siteHealth(a)] - healthWeight[siteHealth(b)],
  );

  if (sites.length === 0) {
    return (
      <EmptyState
        title="Inga sajter kopplade ännu"
        description="Så snart Aurora Media har lagt upp din sajt visas hälsa, säkerhetskopior och rapporter här."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sites.map((site) => (
        <Card key={site.id} className="h-full">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-lg">
              <Link
                to="/portal/sajter/$siteId"
                params={{ siteId: site.id }}
                className="hover:underline"
              >
                {site.name}
              </Link>
            </CardTitle>
            <div className="flex items-center gap-2">
              <HealthBadge status={siteHealth(site)} />
              {site.is_demo ? <DemoBadge /> : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>{site.domain}</p>
            <p>Plan: {site.plans?.name ?? "–"}</p>
            <p>Senaste säkerhetskopia: {relativeAge(site.last_backup_at)}</p>
            <p>Uppetid 30 dagar: {formatPercent(site.uptime_30d)}</p>
            <p>
              Väntande uppdateringar: {site.pending_updates} · Säkerhetsfynd:{" "}
              {site.security_findings}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
