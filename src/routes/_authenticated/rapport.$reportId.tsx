import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { EmptyState, ErrorState, LoadingRows } from "@/components/common/States";
import { Button } from "@/components/ui/button";
import { reportQuery } from "@/lib/data";
import { formatMonth, formatNumber, formatPercent } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/rapport/$reportId")({
  component: ReportView,
  head: () => ({
    meta: [
      { title: "Månadsrapport – Aurora Care" },
      {
        name: "description",
        content: "Månadsrapport för WordPress-underhåll från Aurora Media AB.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const statusLabels: Record<string, string> = {
  draft: "Utkast",
  ready: "Klar",
  sent: "Skickad",
  overdue: "Försenad",
};

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function Section({ title, body }: { title: string; body: string | null }) {
  return (
    <section className="space-y-1">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="whitespace-pre-line text-sm text-muted-foreground">
        {body?.trim() ? body : "Inget att rapportera för perioden."}
      </p>
    </section>
  );
}

function ReportView() {
  const { reportId } = Route.useParams();
  const { data, isLoading, error } = useQuery(reportQuery(reportId));

  if (isLoading) return <LoadingRows rows={4} />;
  if (error) return <ErrorState message={(error as Error).message} />;
  if (!data) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <EmptyState
          title="Rapporten hittades inte"
          description="Rapporten finns inte eller tillhör en annan organisation."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 p-6 print:p-0">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="text-sm text-muted-foreground">Aurora Care · Aurora Media AB</p>
          <h1 className="text-2xl font-semibold">
            Månadsrapport {formatMonth(data.period_month)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.sites?.name ?? "–"} · {data.sites?.domain ?? ""} · Plan{" "}
            {data.sites?.plans?.name ?? "–"} · {statusLabels[data.status] ?? data.status}
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" onClick={() => window.print()}>
            Skriv ut / spara som PDF
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/portal/rapporter">Tillbaka</Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Uppetid" value={formatPercent(data.uptime_pct)} />
        <Metric label="Uppdateringar" value={formatNumber(data.updates_applied)} />
        <Metric label="Säkerhetskopior" value={formatNumber(data.backups_completed)} />
        <Metric label="Incidenter" value={formatNumber(data.incidents_count)} />
      </div>

      <Section title="Sammanfattning" body={data.summary} />
      <Section title="Säkerhet" body={data.security_notes} />
      <Section title="Prestanda" body={data.performance_notes} />
      <Section title="Planerat nästa månad" body={data.next_actions} />

      <footer className="border-t border-border pt-4 text-xs text-muted-foreground">
        {data.is_demo ? "DEMO – exempeldata, inte en verklig kundrapport. " : ""}
        Aurora Media AB · Aurora Care v0.1 · Rapporten är läsande underhållsuppföljning.
      </footer>
    </div>
  );
}
