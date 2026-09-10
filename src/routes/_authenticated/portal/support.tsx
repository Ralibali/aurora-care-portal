import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { ErrorState, LoadingRows } from "@/components/common/States";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useViewer } from "@/hooks/useViewer";
import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/analytics";
import { sitesQuery, supportRequestsQuery } from "@/lib/data";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/portal/support")({
  component: PortalSupport,
});

const priorities = [
  { value: "low", label: "Låg – kan vänta" },
  { value: "medium", label: "Medel – påverkar arbetet" },
  { value: "high", label: "Hög – viktig funktion nere" },
  { value: "critical", label: "Kritisk – sajten är otillgänglig" },
] as const;

const statusLabels: Record<string, string> = {
  new: "Ny",
  in_progress: "Pågår",
  answered: "Besvarad",
  closed: "Avslutad",
};

function PortalSupport() {
  const { viewer } = useViewer();
  const queryClient = useQueryClient();
  const sites = useQuery(sitesQuery);
  const requests = useQuery(supportRequestsQuery);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<string>("medium");
  const [siteId, setSiteId] = useState<string>("none");

  const mutation = useMutation({
    mutationFn: async () => {
      if (!viewer?.userId || !viewer.organizationId) {
        throw new Error("Ditt konto saknar koppling till en organisation. Kontakta Aurora Media.");
      }
      const { error } = await supabase.from("support_requests").insert({
        organization_id: viewer.organizationId,
        created_by: viewer.userId,
        site_id: siteId === "none" ? null : siteId,
        subject: subject.trim(),
        message: message.trim(),
        priority: priority as "low" | "medium" | "high" | "critical",
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      track("support_request_submitted", { priority });
      toast.success("Ärendet är skickat. Vi återkommer inom svarstiden i din plan.");
      setSubject("");
      setMessage("");
      setPriority("medium");
      setSiteId("none");
      void queryClient.invalidateQueries({ queryKey: ["support_requests"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const canSubmit = subject.trim().length >= 3 && message.trim().length >= 10;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Nytt supportärende</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (canSubmit) mutation.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="subject">Rubrik</Label>
              <Input
                id="subject"
                required
                minLength={3}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Kort beskrivning"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="site">Berörd sajt</Label>
              <Select value={siteId} onValueChange={setSiteId}>
                <SelectTrigger id="site">
                  <SelectValue placeholder="Välj sajt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Allmän fråga</SelectItem>
                  {(sites.data ?? []).map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioritet</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Beskrivning</Label>
              <Textarea
                id="message"
                required
                minLength={10}
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Vad har hänt, när började det och vilken sida gäller det?"
              />
            </div>

            <Button type="submit" disabled={!canSubmit || mutation.isPending}>
              {mutation.isPending ? "Skickar…" : "Skicka ärende"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dina ärenden</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.isLoading ? (
            <LoadingRows rows={3} />
          ) : requests.error ? (
            <ErrorState message={(requests.error as Error).message} />
          ) : (requests.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Du har inga ärenden ännu.</p>
          ) : (
            <ul className="space-y-3">
              {(requests.data ?? []).map((r) => (
                <li key={r.id} className="rounded-lg border border-border/70 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{r.subject}</span>
                    <span className="text-xs text-muted-foreground">
                      {statusLabels[r.status] ?? r.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{r.message}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {r.sites?.name ? `${r.sites.name} · ` : ""}
                    {formatDateTime(r.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
