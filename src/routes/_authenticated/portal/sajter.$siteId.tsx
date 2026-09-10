import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { EventList, IncidentList, SiteSummary } from "@/components/app/SiteHealthPanels";
import { EmptyState, ErrorState, LoadingRows } from "@/components/common/States";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reportsQuery, siteEventsQuery, siteIncidentsQuery, siteQuery } from "@/lib/data";
import { formatMonth } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/portal/sajter/$siteId")({
  component: PortalSiteDetail,
});

function PortalSiteDetail() {
  const { siteId } = Route.useParams();
  const site = useQuery(siteQuery(siteId));
  const incidents = useQuery(siteIncidentsQuery(siteId));
  const events = useQuery(siteEventsQuery(siteId));
  const reports = useQuery(reportsQuery);

  if (site.isLoading) return <LoadingRows rows={4} />;
  if (site.error) return <ErrorState message={(site.error as Error).message} />;
  if (!site.data) {
    return (
      <EmptyState
        title="Sajten hittades inte"
        description="Sajten finns inte eller tillhör en annan organisation."
      />
    );
  }

  const siteReports = (reports.data ?? []).filter((r) => r.site_id === siteId);

  return (
    <div className="space-y-8">
      <SiteSummary site={site.data} />

      <div className="grid gap-6 lg:grid-cols-2">
        <IncidentList incidents={incidents.data ?? []} />
        <EventList events={events.data ?? []} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Månadsrapporter</CardTitle>
        </CardHeader>
        <CardContent>
          {siteReports.length === 0 ? (
            <p className="text-sm text-muted-foreground">Inga rapporter publicerade ännu.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {siteReports.map((r) => (
                <li key={r.id}>
                  <Link
                    to="/rapport/$reportId"
                    params={{ reportId: r.id }}
                    className="font-medium hover:underline"
                  >
                    {formatMonth(r.period_month)}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
