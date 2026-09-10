import { useQueries } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { EventList, IncidentList, SiteSummary } from "@/components/app/SiteHealthPanels";
import { EmptyState, ErrorState, LoadingRows } from "@/components/common/States";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reportsQuery, siteEventsQuery, siteIncidentsQuery, siteQuery } from "@/lib/data";
import { formatMonth } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/sajter/$siteId")({
  component: AdminSiteDetail,
});

function AdminSiteDetail() {
  const { siteId } = Route.useParams();
  const [site, incidents, events, reports] = useQueries({
    queries: [siteQuery(siteId), siteIncidentsQuery(siteId), siteEventsQuery(siteId), reportsQuery],
  });

  if (site.isLoading) return <LoadingRows rows={4} />;
  if (site.error) return <ErrorState message={(site.error as Error).message} />;
  if (!site.data) {
    return <EmptyState title="Sajten hittades inte" description="Kontrollera länken och försök igen." />;
  }

  const siteReports = (reports.data ?? []).filter((r) => r.site_id === siteId);

  return (
    <div className="space-y-8">
      <SiteSummary site={site.data} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base">Incidenter</CardTitle>
          </CardHeader>
          <CardContent>
            {incidents.isLoading ? <LoadingRows rows={2} /> : <IncidentList incidents={incidents.data ?? []} />}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base">Underhållshändelser</CardTitle>
          </CardHeader>
          <CardContent>
            {events.isLoading ? <LoadingRows rows={2} /> : <EventList events={events.data ?? []} />}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="text-base">Månadsrapporter</CardTitle>
        </CardHeader>
        <CardContent>
          {siteReports.length === 0 ? (
            <p className="text-sm text-muted-foreground">Inga rapporter för den här sajten ännu.</p>
          ) : (
            <ul className="divide-y divide-border/70">
              {siteReports.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <Link
                    to="/rapport/$reportId"
                    params={{ reportId: r.id }}
                    className="font-medium hover:underline"
                  >
                    {formatMonth(r.period_month)}
                  </Link>
                  <span className="text-muted-foreground">{r.status}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="text-base">Onboardingchecklista</CardTitle>
        </CardHeader>
        <CardContent>
          <Checklist value={site.data.onboarding_checklist} />
        </CardContent>
      </Card>
    </div>
  );
}

function Checklist({ value }: { value: unknown }) {
  const items = Array.isArray(value)
    ? (value as Array<{ label?: string; done?: boolean }>)
    : [];
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Ingen checklista registrerad.</p>;
  }
  return (
    <ul className="space-y-2 text-sm">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={item.done ? "size-2 rounded-full bg-success" : "size-2 rounded-full bg-muted-foreground/40"}
          />
          <span className={item.done ? "text-muted-foreground line-through" : ""}>
            {item.label ?? "Punkt"}
          </span>
        </li>
      ))}
    </ul>
  );
}
