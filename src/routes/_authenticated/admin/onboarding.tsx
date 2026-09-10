import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { ErrorState } from "@/components/common/States";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { customersQuery, plansQuery } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/admin/onboarding")({
  component: Onboarding,
});

export const DEFAULT_CHECKLIST = [
  "Avtal och plan bekräftade med kund",
  "Åtkomst till WordPress-admin mottagen",
  "Sajten ansluten i WPMgr",
  "Säkerhetskopiering verifierad",
  "Uppetidsövervakning aktiv",
  "Kontaktväg för incidenter överenskommen",
] as const;

type Step = 0 | 1 | 2 | 3;

const steps = ["Kund", "Sajt", "Plan och koppling", "Checklista"] as const;

function Onboarding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const customers = useQuery(customersQuery);
  const plans = useQuery(plansQuery);

  const [step, setStep] = useState<Step>(0);
  const [customerId, setCustomerId] = useState("");
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [wpAdminUrl, setWpAdminUrl] = useState("");
  const [planId, setPlanId] = useState("");
  const [wpmgrSiteId, setWpmgrSiteId] = useState("");
  const [wpmgrEnrollmentId, setWpmgrEnrollmentId] = useState("");
  const [checked, setChecked] = useState<string[]>([]);

  const customer = (customers.data ?? []).find((c) => c.id === customerId);

  const stepValid: Record<Step, boolean> = {
    0: !!customerId,
    1: name.trim().length >= 2 && /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain.trim()),
    2: !!planId,
    3: true,
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!customer) throw new Error("Välj en kund.");
      const { data, error } = await supabase
        .from("sites")
        .insert({
          organization_id: customer.organization_id,
          customer_id: customer.id,
          plan_id: planId,
          name: name.trim(),
          domain: domain.trim().toLowerCase(),
          wp_admin_url: wpAdminUrl.trim() || null,
          wpmgr_site_id: wpmgrSiteId.trim() || null,
          wpmgr_enrollment_id: wpmgrEnrollmentId.trim() || null,
          status: "onboarding",
          health: "unknown",
          onboarding_checklist: DEFAULT_CHECKLIST.map((label) => ({
            label,
            done: checked.includes(label),
          })),
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return data.id as string;
    },
    onSuccess: (siteId) => {
      toast.success("Sajten är upplagd och står som pågående onboarding.");
      void queryClient.invalidateQueries({ queryKey: ["sites"] });
      void navigate({ to: "/admin/sajter/$siteId", params: { siteId } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <ol className="flex flex-wrap gap-2 text-sm" aria-label="Steg">
        {steps.map((label, i) => (
          <li
            key={label}
            aria-current={i === step ? "step" : undefined}
            className={
              i === step
                ? "rounded-full bg-primary px-3 py-1 font-medium text-primary-foreground"
                : "rounded-full border border-border px-3 py-1 text-muted-foreground"
            }
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      {customers.error ? <ErrorState message={(customers.error as Error).message} /> : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{steps[step]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 ? (
            <div className="space-y-2">
              <Label htmlFor="customer">Kund</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger id="customer">
                  <SelectValue placeholder="Välj kund" />
                </SelectTrigger>
                <SelectContent>
                  {(customers.data ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Nya kunder läggs upp av Aurora Media innan onboarding av sajt.
              </p>
            </div>
          ) : null}

          {step === 1 ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Sajtnamn</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Domän</Label>
                <Input
                  id="domain"
                  value={domain}
                  placeholder="exempel.se"
                  onChange={(e) => setDomain(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wpadmin">WordPress-admin (URL)</Label>
                <Input
                  id="wpadmin"
                  value={wpAdminUrl}
                  placeholder="https://exempel.se/wp-admin"
                  onChange={(e) => setWpAdminUrl(e.target.value)}
                />
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="plan">Plan</Label>
                <Select value={planId} onValueChange={setPlanId}>
                  <SelectTrigger id="plan">
                    <SelectValue placeholder="Välj plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {(plans.data ?? []).map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} – {p.price_sek_monthly} kr/mån
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="wpmgr-site">WPMgr site-ID (valfritt)</Label>
                <Input
                  id="wpmgr-site"
                  value={wpmgrSiteId}
                  onChange={(e) => setWpmgrSiteId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wpmgr-enroll">WPMgr enrollment-ID (valfritt)</Label>
                <Input
                  id="wpmgr-enroll"
                  value={wpmgrEnrollmentId}
                  onChange={(e) => setWpmgrEnrollmentId(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Identifierarna används endast för läsande synk. Aurora Care v0.1 utför inga
                skarpa åtgärder mot WordPress.
              </p>
            </>
          ) : null}

          {step === 3 ? (
            <ul className="space-y-3">
              {DEFAULT_CHECKLIST.map((label) => (
                <li key={label} className="flex items-center gap-3">
                  <Checkbox
                    id={label}
                    checked={checked.includes(label)}
                    onCheckedChange={(v) =>
                      setChecked((prev) =>
                        v === true ? [...prev, label] : prev.filter((l) => l !== label),
                      )
                    }
                  />
                  <Label htmlFor={label} className="text-sm font-normal">
                    {label}
                  </Label>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="flex justify-between pt-2">
            <Button
              type="button"
              variant="ghost"
              disabled={step === 0}
              onClick={() => setStep((s) => (s - 1) as Step)}
            >
              Tillbaka
            </Button>
            {step < 3 ? (
              <Button
                type="button"
                disabled={!stepValid[step]}
                onClick={() => setStep((s) => (s + 1) as Step)}
              >
                Nästa
              </Button>
            ) : (
              <Button
                type="button"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate()}
              >
                {mutation.isPending ? "Sparar…" : "Skapa sajt"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
