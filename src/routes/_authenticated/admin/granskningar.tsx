import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Cookie, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { SiteAuditOverview } from "@/components/app/SiteAuditOverview";
import { ErrorState, LoadingRows } from "@/components/common/States";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sitesQuery } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/admin/granskningar")({
  component: AuditDashboard,
});

function AuditDashboard() {
  const sites = useQuery(sitesQuery);
  const [selectedSite, setSelectedSite] = useState("");
  const siteId = selectedSite || sites.data?.[0]?.id || "";

  if (sites.isLoading) return <LoadingRows rows={4} />;
  if (sites.error) return <ErrorState message={(sites.error as Error).message} />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex gap-3 p-5">
            <ShieldCheck className="mt-0.5 size-6 shrink-0 text-primary" />
            <div>
              <h2 className="font-semibold">Accessibility Monitor</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Prioriterade tekniska WCAG-fynd, åtgärdsinstruktion och manuell checklista.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex gap-3 p-5">
            <Cookie className="mt-0.5 size-6 shrink-0 text-primary" />
            <div>
              <h2 className="font-semibold">Consent Monitor</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Trackerinventering, förhandsblockering och underlag för Consent Mode v2.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-md space-y-2">
        <label className="text-sm font-medium" htmlFor="audit-site">
          Sajt att granska
        </label>
        <Select value={siteId} onValueChange={setSelectedSite}>
          <SelectTrigger id="audit-site">
            <SelectValue placeholder="Välj sajt" />
          </SelectTrigger>
          <SelectContent>
            {(sites.data ?? []).map((site) => (
              <SelectItem key={site.id} value={site.id}>
                {site.name} · {site.domain}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {siteId ? (
        <SiteAuditOverview siteId={siteId} canRun />
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Lägg till en sajt innan du startar en granskning.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
