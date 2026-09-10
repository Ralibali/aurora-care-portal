import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { ErrorState, LoadingRows } from "@/components/common/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { integrationsQuery } from "@/lib/data";
import { formatDateTime } from "@/lib/format";
import { WPMGR_ENDPOINT_MAP } from "@/lib/wpmgr/contract";
import type { WpmgrConnectionResult } from "@/lib/wpmgr/contract";
import { runWpmgrSync, testWpmgrConnection } from "@/lib/wpmgr/wpmgr.functions";
import type { WpmgrSyncResult } from "@/lib/wpmgr/wpmgr.functions";

export const Route = createFileRoute("/_authenticated/admin/integrationer")({
  component: Integrations,
});

function Integrations() {
  const connections = useQuery(integrationsQuery);
  const test = useServerFn(testWpmgrConnection);
  const sync = useServerFn(runWpmgrSync);

  const [result, setResult] = useState<WpmgrConnectionResult | null>(null);
  const [syncResult, setSyncResult] = useState<WpmgrSyncResult | null>(null);

  const testMutation = useMutation({
    mutationFn: async () => (await test({})) as WpmgrConnectionResult,
    onSuccess: (r) => {
      setResult(r);
      toast[r.ok ? "success" : "error"](r.message);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const syncMutation = useMutation({
    mutationFn: async () => (await sync({})) as WpmgrSyncResult,
    onSuccess: (r) => {
      setSyncResult(r);
      toast[r.ok ? "success" : "error"](r.message);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">WPMgr-anslutning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            WPMgr körs som en separat självhostad tjänst. Aurora Care pratar med den enbart via
            en läsande adapter på servern. Nycklarna <code>WPMGR_BASE_URL</code> och{" "}
            <code>WPMGR_API_TOKEN</code> lagras som serverhemligheter och exponeras aldrig i
            webbläsaren.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => testMutation.mutate()} disabled={testMutation.isPending}>
              {testMutation.isPending ? "Testar…" : "Testa anslutning"}
            </Button>
            <Button
              variant="outline"
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
            >
              {syncMutation.isPending ? "Synkar…" : "Kör läsande synk"}
            </Button>
          </div>

          {result ? (
            <div
              role="status"
              className="rounded-lg border border-border/70 bg-surface/60 p-4 text-sm"
            >
              <p className="font-medium">
                Läge: {result.mode === "live" ? "Live" : "Demo"} ·{" "}
                {result.ok ? "OK" : "Ingen kontakt"}
              </p>
              <p className="mt-1 text-muted-foreground">{result.message}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Kontrollerad {formatDateTime(result.checkedAt)}
                {result.latencyMs != null ? ` · ${result.latencyMs} ms` : ""}
              </p>
            </div>
          ) : null}

          {syncResult ? (
            <div
              role="status"
              className="rounded-lg border border-border/70 bg-surface/60 p-4 text-sm"
            >
              <p className="font-medium">
                Synk ({syncResult.mode}) · {syncResult.sitesUpdated} av{" "}
                {syncResult.sitesConsidered} sajter uppdaterade
              </p>
              <p className="mt-1 text-muted-foreground">{syncResult.message}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Registrerade anslutningar</CardTitle>
        </CardHeader>
        <CardContent>
          {connections.isLoading ? (
            <LoadingRows rows={2} />
          ) : connections.error ? (
            <ErrorState message={(connections.error as Error).message} />
          ) : (connections.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Inga anslutningar registrerade.</p>
          ) : (
            <ul className="space-y-3">
              {(connections.data ?? []).map((c) => (
                <li key={c.id} className="rounded-lg border border-border/70 p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{c.label}</span>
                    <Badge variant={c.mode === "live" ? "default" : "secondary"}>
                      {c.mode === "live" ? "Live" : "Demoläge"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {c.base_url ?? "Ingen bas-URL konfigurerad"} · status {c.status}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Senaste test: {formatDateTime(c.last_test_at)}
                    {c.last_test_message ? ` – ${c.last_test_message}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Endpointkontrakt (overifierat)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Mappningen nedan är ett förslag och måste verifieras mot den självhostade
            WPMgr-instansen innan live-läge aktiveras. Endast läsande anrop finns definierade.
          </p>
          <ul className="space-y-1 font-mono text-xs">
            <li>GET {WPMGR_ENDPOINT_MAP.health}</li>
            <li>GET {WPMGR_ENDPOINT_MAP.siteHealth("{siteRef}")}</li>
            <li>GET {WPMGR_ENDPOINT_MAP.uptime("{siteRef}")}</li>
            <li>GET {WPMGR_ENDPOINT_MAP.backups("{siteRef}")}</li>
            <li>GET {WPMGR_ENDPOINT_MAP.updates("{siteRef}")}</li>
            <li>GET {WPMGR_ENDPOINT_MAP.security("{siteRef}")}</li>
            <li>GET {WPMGR_ENDPOINT_MAP.incidents("{siteRef}")}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
