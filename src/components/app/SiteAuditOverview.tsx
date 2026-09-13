import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  Cookie,
  ExternalLink,
  ScanLine,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ErrorState, LoadingRows } from "@/components/common/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  consentAssetsQuery,
  runSiteAudit,
  siteFindingsQuery,
  siteScansQuery,
} from "@/lib/site-audit/data";
import type { AuditKind, FindingSeverity, SiteFinding } from "@/lib/site-audit/types";

const labels: Record<FindingSeverity, string> = {
  info: "Information",
  minor: "Mindre",
  moderate: "Medel",
  serious: "Allvarlig",
  critical: "Kritisk",
};

const severityClass: Record<FindingSeverity, string> = {
  info: "border-border bg-surface text-muted-foreground",
  minor: "border-warning/30 bg-warning/10 text-foreground",
  moderate: "border-warning/50 bg-warning/15 text-foreground",
  serious: "border-danger/35 bg-danger/10 text-danger",
  critical: "border-danger/50 bg-danger/15 text-danger",
};

function FindingRow({ finding }: { finding: SiteFinding }) {
  return (
    <li className={`rounded-xl border p-4 ${severityClass[finding.severity]}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold text-foreground">{finding.title}</h4>
            <Badge variant="outline">{labels[finding.severity]}</Badge>
            {finding.manual_review_required ? (
              <Badge variant="secondary">Manuell kontroll</Badge>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-foreground/75">{finding.description}</p>
        </div>
        {finding.help_url ? (
          <a
            href={finding.help_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Läs kriteriet <ExternalLink className="size-3" />
          </a>
        ) : null}
      </div>
      {finding.fix_hint ? (
        <div className="mt-3 rounded-lg bg-background/70 p-3 text-sm text-foreground">
          <span className="font-semibold">Rekommenderad åtgärd: </span>
          {finding.fix_hint}
        </div>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>Regel: {finding.rule_id}</span>
        {finding.selector ? <code>{finding.selector}</code> : null}
      </div>
    </li>
  );
}

export function SiteAuditOverview({
  siteId,
  canRun = false,
}: {
  siteId: string;
  canRun?: boolean;
}) {
  const [tab, setTab] = useState<AuditKind>("accessibility");
  const queryClient = useQueryClient();
  const scans = useQuery(siteScansQuery(siteId));
  const findings = useQuery(siteFindingsQuery(siteId));
  const assets = useQuery(consentAssetsQuery(siteId));
  const run = useMutation({
    mutationFn: (kind: AuditKind) => runSiteAudit(siteId, kind),
    onSuccess: async (_, kind) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["site-scans", siteId] }),
        queryClient.invalidateQueries({ queryKey: ["site-findings", siteId] }),
        queryClient.invalidateQueries({ queryKey: ["consent-assets", siteId] }),
      ]);
      toast.success(
        kind === "accessibility"
          ? "Tillgänglighetsgranskningen är klar."
          : "Consent-granskningen är klar.",
      );
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const latest = new Map<AuditKind, NonNullable<typeof scans.data>[number]>();
  for (const scan of scans.data ?? []) if (!latest.has(scan.kind)) latest.set(scan.kind, scan);
  const activeScan = latest.get(tab);
  const activeFindings = (findings.data ?? []).filter(
    (finding) => finding.kind === tab && (!activeScan || finding.scan_id === activeScan.id),
  );
  const activeAssets = (assets.data ?? []).filter(
    (asset) => !activeScan || asset.scan_id === activeScan.id,
  );

  if (scans.isLoading || findings.isLoading || assets.isLoading) return <LoadingRows rows={3} />;
  const error = scans.error ?? findings.error ?? assets.error;
  if (error) return <ErrorState message={(error as Error).message} />;

  const score = typeof activeScan?.summary?.score === "number" ? activeScan.summary.score : null;

  return (
    <Card className="border-border/70">
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="size-5 text-primary" /> Webbgranskning
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Teknisk förkontroll med spårbara fynd. Manuell verifiering krävs innan full efterlevnad
            kan bedömas.
          </p>
        </div>
        {canRun ? (
          <Button onClick={() => run.mutate(tab)} disabled={run.isPending}>
            <ScanLine className="mr-2 size-4" />
            {run.isPending
              ? "Granskar…"
              : `Granska ${tab === "accessibility" ? "tillgänglighet" : "samtycke"}`}
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={(value) => setTab(value as AuditKind)}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="accessibility">Tillgänglighet</TabsTrigger>
            <TabsTrigger value="consent">Consent & cookies</TabsTrigger>
          </TabsList>

          {(["accessibility", "consent"] as const).map((kind) => {
            const scan = latest.get(kind);
            const rows = kind === tab ? activeFindings : [];
            return (
              <TabsContent key={kind} value={kind} className="mt-5 space-y-5">
                {!scan ? (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center">
                    {kind === "accessibility" ? (
                      <ShieldCheck className="mx-auto size-8 text-muted-foreground" />
                    ) : (
                      <Cookie className="mx-auto size-8 text-muted-foreground" />
                    )}
                    <p className="mt-2 font-medium">Ingen granskning genomförd ännu</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {canRun
                        ? "Starta den första tekniska förkontrollen ovan."
                        : "Aurora Media genomför och dokumenterar granskningen här."}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-border/70 bg-surface/50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Teknisk poäng
                        </p>
                        <p className="mt-1 text-3xl font-bold tabular-nums">
                          {score ?? "–"}
                          <span className="text-base font-medium text-muted-foreground">/100</span>
                        </p>
                      </div>
                      <div className="rounded-xl border border-border/70 bg-surface/50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Öppna fynd
                        </p>
                        <p className="mt-1 text-3xl font-bold tabular-nums">{rows.length}</p>
                      </div>
                      <div className="rounded-xl border border-border/70 bg-surface/50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Senast körd
                        </p>
                        <p className="mt-2 text-sm font-semibold">
                          {new Date(scan.completed_at ?? scan.created_at).toLocaleString("sv-SE")}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{scan.engine}</p>
                      </div>
                    </div>

                    {kind === "consent" && activeAssets.length > 0 ? (
                      <div>
                        <h3 className="mb-2 text-sm font-semibold">
                          Upptäckta cookies och trackers
                        </h3>
                        <div className="overflow-x-auto rounded-xl border border-border/70">
                          <table className="w-full min-w-[38rem] text-sm">
                            <thead className="bg-surface/70 text-left">
                              <tr>
                                <th className="p-3">Namn</th>
                                <th className="p-3">Leverantör</th>
                                <th className="p-3">Kategori</th>
                                <th className="p-3">Före samtycke</th>
                              </tr>
                            </thead>
                            <tbody>
                              {activeAssets.map((asset) => (
                                <tr key={asset.id} className="border-t border-border/70">
                                  <td className="p-3 font-medium">{asset.name}</td>
                                  <td className="p-3 text-muted-foreground">
                                    {asset.provider ?? "Okänd"}
                                  </td>
                                  <td className="p-3">
                                    <Badge variant="outline">{asset.category}</Badge>
                                  </td>
                                  <td className="p-3">
                                    {asset.detected_before_consent ? (
                                      <span className="inline-flex items-center gap-1 text-danger">
                                        <AlertTriangle className="size-4" /> Ja
                                      </span>
                                    ) : (
                                      "Nej"
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : null}

                    {rows.length === 0 ? (
                      <div className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 p-4">
                        <CheckCircle2 className="mt-0.5 size-5 text-success" />
                        <div>
                          <p className="font-semibold">Inga automatiska fel hittades</p>
                          <p className="text-sm text-muted-foreground">
                            Detta ersätter inte den manuella kontrollen.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <ul className="space-y-3">
                        {rows.map((finding) => (
                          <FindingRow key={finding.id} finding={finding} />
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}
