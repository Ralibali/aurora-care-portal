import { AlertTriangle, DatabaseBackup, Gauge, ShieldCheck } from "lucide-react";

import { DemoBadge, HealthBadge } from "@/components/common/HealthBadge";
import { StatCard } from "@/components/common/StatCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Incident, MaintenanceEvent, SiteWithRelations } from "@/lib/data";
import { formatDate, formatDateTime, formatPercent, relativeAge } from "@/lib/format";
import { deriveHealth, type HealthStatus } from "@/lib/health";
import { canRunDestructiveAction } from "@/lib/access";

export function siteHealth(site: {
  last_backup_at: string | null;
  ssl_expires_at: string | null;
  pending_updates: number | null;
  security_findings: number | null;
  uptime_30d: number | string | null;
}): HealthStatus {
  return deriveHealth({
    last_backup_at: site.last_backup_at,
    ssl_expires_at: site.ssl_expires_at,
    pending_updates: site.pending_updates ?? 0,
    security_findings: site.security_findings ?? 0,
    uptime_30d: site.uptime_30d,
  });
}

const eventLabels: Record<string, string> = {
  backup: "Säkerhetskopia",
  update: "Uppdatering",
  security_scan: "Säkerhetsgenomsökning",
  uptime_check: "Uppetidskontroll",
  performance_check: "Prestandakontroll",
  note: "Notering",
};

const severityLabels: Record<string, string> = {
  low: "Låg",
  medium: "Medel",
  high: "Hög",
  critical: "Kritisk",
};

export function SiteSummary({ site }: { site: SiteWithRelations }) {
  const status = siteHealth(site);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-semibold">{site.name}</h2>
        <HealthBadge status={status} />
        {site.is_demo ? <DemoBadge /> : null}
      </div>
      <p className="text-sm text-muted-foreground">
        {site.domain} · Plan {site.plans?.name ?? "–"} · Senaste synk{" "}
        {formatDateTime(site.last_sync_at)}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Uppetid 30 dagar"
          value={formatPercent(site.uptime_30d)}
          icon={<Gauge className="size-5" />}
        />
        <StatCard
          label="Senaste säkerhetskopia"
          value={relativeAge(site.last_backup_at)}
          hint={formatDateTime(site.last_backup_at)}
          icon={<DatabaseBackup className="size-5" />}
        />
        <StatCard
          label="Väntande uppdateringar"
          value={site.pending_updates ?? 0}
          tone={(site.pending_updates ?? 0) >= 5 ? "warning" : "default"}
          icon={<AlertTriangle className="size-5" />}
        />
        <StatCard
          label="Säkerhetsfynd"
          value={site.security_findings ?? 0}
          tone={(site.security_findings ?? 0) > 0 ? "danger" : "success"}
          icon={<ShieldCheck className="size-5" />}
        />
      </div>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="text-base">Teknisk status</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Detail label="WordPress" value={site.wp_version ?? "–"} />
          <Detail label="PHP" value={site.php_version ?? "–"} />
          <Detail label="SSL går ut" value={formatDate(site.ssl_expires_at)} />
          <Detail label="Prestandapoäng" value={site.performance_score ?? "–"} />
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="text-base">Åtgärder</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button variant="outline" disabled={!canRunDestructiveAction()}>
            Kör uppdateringar
          </Button>
          <Button variant="outline" disabled={!canRunDestructiveAction()}>
            Återställ säkerhetskopia
          </Button>
          <p className="text-sm text-muted-foreground">
            Åtgärder som förändrar sajten utförs inte härifrån i version 0.1. De kräver godkännande
            och sker manuellt av Aurora Media.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}

export function IncidentList({ incidents }: { incidents: Incident[] }) {
  if (incidents.length === 0) {
    return <p className="text-sm text-muted-foreground">Inga registrerade incidenter.</p>;
  }
  return (
    <ul className="divide-y divide-border/70">
      {incidents.map((incident) => (
        <li key={incident.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="font-medium">{incident.title}</p>
            <p className="text-sm text-muted-foreground">
              Öppnad {formatDateTime(incident.opened_at)}
              {incident.resolved_at ? ` · Löst ${formatDateTime(incident.resolved_at)}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={incident.status === "resolved" ? "secondary" : "destructive"}>
              {incident.status === "resolved" ? "Löst" : "Öppen"}
            </Badge>
            <Badge variant="outline">{severityLabels[incident.severity] ?? incident.severity}</Badge>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function EventList({ events }: { events: MaintenanceEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">Inga registrerade händelser ännu.</p>;
  }
  return (
    <ul className="divide-y divide-border/70">
      {events.map((event) => (
        <li key={event.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="font-medium">{eventLabels[event.event_type] ?? event.event_type}</p>
            <p className="text-sm text-muted-foreground">{event.summary}</p>
          </div>
          <p className="text-sm text-muted-foreground">{formatDateTime(event.occurred_at)}</p>
        </li>
      ))}
    </ul>
  );
}
