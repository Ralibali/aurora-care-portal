import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitLead } from "@/lib/leads.functions";
import { track } from "@/lib/analytics";

const title = "Kontakta Aurora Media AB om WordPress-underhåll | Aurora Care";
const description =
  "Boka en kostnadsfri genomgång av din WordPress-sajt. Vi återkommer med ett konkret förslag på underhållsnivå och pris.";

export const Route = createFileRoute("/kontakt")({
  validateSearch: (search: Record<string, unknown>): { plan?: string } =>
    typeof search["plan"] === "string" ? { plan: search["plan"] as string } : {},

  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { plan } = Route.useSearch();
  const send = useServerFn(submitLead);
  const [errorText, setErrorText] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (formData: FormData) =>
      send({
        data: {
          company: String(formData.get("company") ?? ""),
          contactName: String(formData.get("contactName") ?? ""),
          email: String(formData.get("email") ?? ""),
          phone: String(formData.get("phone") ?? ""),
          website: String(formData.get("website") ?? ""),
          planSlug: String(formData.get("planSlug") ?? ""),
          message: String(formData.get("message") ?? ""),
        },
      }),
    onSuccess: () => {
      setErrorText(null);
      track("lead_submitted", { plan: plan ?? "" });
    },
    onError: (error: Error) => setErrorText(error.message),
  });

  return (
    <PublicLayout>
      <section className="border-b border-border/70 bg-surface">
        <div className="mx-auto w-full max-w-6xl px-4 py-16">
          <h1 className="text-4xl font-semibold">Boka en genomgång</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Berätta kort om din sajt så återkommer vi med ett förslag. Genomgången är kostnadsfri
            och innebär inget åtagande.
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="card-elevated border-border/70">
          <CardContent className="p-6 sm:p-8">
            {mutation.isSuccess ? (
              <div role="status" className="rounded-xl border border-success/40 bg-success/10 p-6">
                <h2 className="text-lg font-semibold">Tack, vi har tagit emot din förfrågan</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Vi hör av oss till angiven e-postadress inom en arbetsdag.
                </p>
              </div>
            ) : (
              <form
                className="grid gap-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  mutation.mutate(new FormData(e.currentTarget));
                }}
              >
                <input type="hidden" name="planSlug" value={plan ?? ""} />
                {plan ? (
                  <p className="rounded-lg bg-surface px-3 py-2 text-sm text-muted-foreground">
                    Din förfrågan gäller planen <strong className="text-foreground">{plan}</strong>.
                  </p>
                ) : null}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="contactName">Namn *</Label>
                    <Input id="contactName" name="contactName" required autoComplete="name" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="company">Företag</Label>
                    <Input id="company" name="company" autoComplete="organization" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">E-post *</Label>
                    <Input id="email" name="email" type="email" required autoComplete="email" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input id="phone" name="phone" autoComplete="tel" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="website">Webbadress</Label>
                  <Input id="website" name="website" placeholder="https://" inputMode="url" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Vad behöver du hjälp med? *</Label>
                  <Textarea id="message" name="message" rows={5} required />
                </div>
                {errorText ? (
                  <p role="alert" className="text-sm text-danger">
                    {errorText}
                  </p>
                ) : null}
                <div>
                  <Button type="submit" size="lg" disabled={mutation.isPending}>
                    {mutation.isPending ? "Skickar…" : "Skicka förfrågan"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Vi använder uppgifterna enbart för att svara på din förfrågan.
                </p>
              </form>
            )}
          </CardContent>
        </Card>

        <aside className="space-y-6">
          <div className="rounded-xl border border-border/70 bg-card p-6">
            <h2 className="text-base font-semibold">Aurora Media AB</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              <a className="hover:text-foreground" href="mailto:hej@auroramedia.se">
                hej@auroramedia.se
              </a>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Svar inom en arbetsdag.</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-surface p-6">
            <h2 className="text-base font-semibold">Redan kund?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Logga in i kundportalen för att se status och skicka supportärenden.
            </p>
          </div>
        </aside>
      </section>
    </PublicLayout>
  );
}
