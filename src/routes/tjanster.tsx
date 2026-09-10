import { createFileRoute, Link } from "@tanstack/react-router";

import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const title = "Så fungerar WordPress-underhållet | Aurora Care";
const description =
  "Övervakning, säkerhetskopior, kontrollerade uppdateringar, säkerhetsgenomgång och månadsrapport. Så arbetar Aurora Media AB med löpande WordPress-drift.";

export const Route = createFileRoute("/tjanster")({
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
  component: Services,
});

const areas = [
  {
    title: "Uppdateringar",
    body: "WordPress-kärna, teman och tillägg uppdateras enligt en fast rutin. På Care+ testas större uppdateringar i en kopia av sajten först, och vi kontrollerar viktiga sidor efteråt.",
  },
  {
    title: "Säkerhetskopior",
    body: "Kopior av filer och databas tas automatiskt – varje vecka på Bas, varje dygn på Care och Care+. Vi bevakar att kopiorna faktiskt blir av och hur gamla de är.",
  },
  {
    title: "Övervakning",
    body: "Sajten kontrolleras kontinuerligt. Vi ser driftstopp, långsamma svarstider och certifikat som närmar sig utgång, och agerar innan besökarna märker något.",
  },
  {
    title: "Säkerhet",
    body: "Genomsökning efter skadlig kod, koll på kända sårbarheter i tillägg och inloggningsskydd. Fynd sammanställs med tydlig allvarlighetsgrad.",
  },
  {
    title: "Rapportering",
    body: "Varje månad får du en rapport med uppetid, genomförda uppdateringar, säkerhetskopior, incidenter och våra förslag för nästa period.",
  },
  {
    title: "Support",
    body: "Frågor och mindre justeringar hanteras via kundportalen. Care+ har prioriterad kö och namngiven kontaktperson.",
  },
];

function Services() {
  return (
    <PublicLayout>
      <section className="border-b border-border/70 bg-surface">
        <div className="mx-auto w-full max-w-6xl px-4 py-16">
          <h1 className="max-w-3xl text-4xl font-semibold">
            Ett underhållsarbete som går att följa – inte bara lita på
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Aurora Care bygger på återkommande rutiner och öppen redovisning. Du ser vad vi gör, när
            vi gjorde det och vad vi rekommenderar härnäst.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {areas.map((a) => (
            <Card key={a.title} className="card-elevated border-border/70">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold">{a.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{a.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-20">
        <div className="rounded-2xl border border-border/70 bg-card p-8 card-elevated">
          <h2 className="text-2xl font-semibold">Vad vi inte gör utan att fråga</h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Vi genomför inga åtgärder som kan påverka innehåll eller design utan att stämma av
            först. Återställning av en säkerhetskopia sker alltid i dialog med dig, och större
            förändringar planeras tillsammans.
          </p>
          <Button className="mt-6" asChild>
            <Link to="/kontakt">Prata med oss om din sajt</Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
