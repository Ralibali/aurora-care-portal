import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, CalendarCheck, DatabaseBackup, ShieldCheck } from "lucide-react";

import { PlanCards } from "@/components/site/PlanCards";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { track } from "@/lib/analytics";

const title = "Aurora Care – WordPress-underhåll som abonnemang | Aurora Media AB";
const description =
  "Aurora Care håller din WordPress-sajt uppdaterad, säkerhetskopierad och övervakad. Fast månadspris från 499 kr och en tydlig rapport varje månad.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Aurora Care",
          serviceType: "WordPress-underhåll och drift",
          areaServed: "SE",
          provider: {
            "@type": "Organization",
            name: "Aurora Media AB",
            email: "hej@auroramedia.se",
          },
          offers: [
            { "@type": "Offer", name: "Bas", price: "499", priceCurrency: "SEK" },
            { "@type": "Offer", name: "Care", price: "899", priceCurrency: "SEK" },
            { "@type": "Offer", name: "Care+", price: "1490", priceCurrency: "SEK" },
          ],
        }),
      },
    ],
  }),
  component: Home,
});

const benefits = [
  {
    icon: ShieldCheck,
    title: "Uppdateringar utan obehagliga överraskningar",
    body: "Vi kontrollerar uppdateringar innan de rullas ut och följer upp att sajten fungerar efteråt.",
  },
  {
    icon: DatabaseBackup,
    title: "Säkerhetskopior som är testade",
    body: "Kopior tas automatiskt och kontrolleras. Du vet alltid hur färsk den senaste kopian är.",
  },
  {
    icon: Activity,
    title: "Övervakning dygnet runt",
    body: "Vi ser om sajten går ner, om certifikatet håller på att gå ut och om något ser fel ut.",
  },
  {
    icon: CalendarCheck,
    title: "En rapport varje månad",
    body: "Vad som gjorts, vad som hänt och vad vi föreslår härnäst. På svenska, utan teknikprat.",
  },
];

function Home() {
  return (
    <PublicLayout>
      <section className="relative overflow-hidden aurora-gradient">
        <div className="absolute inset-0 aurora-glow" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:py-28">
          <p className="text-sm font-medium text-accent">Aurora Media AB</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-primary-foreground sm:text-5xl">
            Din WordPress-sajt sköter sig inte själv. Det gör vi.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-primary-foreground/80">
            Aurora Care är ett löpande underhållsabonnemang för företag som vill ha en sajt som
            fungerar – utan att någon internt behöver hålla koll på uppdateringar, backuper och
            säkerhet.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" variant="hero" asChild onClick={() => track("hero_cta_primary")}>
              <Link to="/kontakt">Boka en kostnadsfri genomgång</Link>
            </Button>
            <Button size="lg" variant="onDark" asChild onClick={() => track("hero_cta_secondary")}>
              <Link to="/priser">Se planer och priser</Link>
            </Button>
          </div>
          <dl className="mt-12 grid max-w-3xl gap-6 sm:grid-cols-3">
            {[
              ["Fast månadskostnad", "Från 499 kr per sajt"],
              ["Ingen bindningstid", "Månadsvis, säg upp när du vill"],
              ["Egen kundportal", "Status och rapporter samlat"],
            ].map(([term, def]) => (
              <div key={term}>
                <dt className="text-sm text-primary-foreground/70">{term}</dt>
                <dd className="mt-1 font-medium text-primary-foreground">{def}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-20">
        <h2 className="text-3xl font-semibold">Det här ingår i vardagen</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Underhåll är inte ett projekt utan ett tillstånd. Aurora Care är byggt för att göra det
          löpande arbetet förutsägbart – för dig och för oss.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <Card key={b.title} className="card-elevated border-border/70">
              <CardContent className="p-6">
                <b.icon className="size-6 text-accent" aria-hidden="true" />
                <h3 className="mt-4 text-base font-semibold">{b.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{b.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-surface py-20">
        <div className="mx-auto w-full max-w-6xl px-4">
          <h2 className="text-3xl font-semibold">Så går det till</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              [
                "1. Genomgång",
                "Vi går igenom sajten, webbhotellet och vad som är viktigast för verksamheten.",
              ],
              [
                "2. Uppstart",
                "Vi kopplar på övervakning, säkerhetskopior och en rutin för uppdateringar.",
              ],
              [
                "3. Löpande drift",
                "Du får status i portalen och en sammanfattande rapport varje månad.",
              ],
            ].map(([step, body]) => (
              <li key={step}>
                <h3 className="text-lg font-semibold">{step}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-20">
        <h2 className="text-3xl font-semibold">Välj nivå efter hur kritisk sajten är</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Alla planer innehåller övervakning, säkerhetskopior och månadsrapport. Skillnaden ligger i
          hur ofta vi kopierar, hur snabbt vi svarar och hur mycket vi förebygger.
        </p>
        <div className="mt-10">
          <PlanCards />
        </div>
      </section>

      <section className="border-t border-border/70 bg-surface py-16">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Osäker på vilken nivå din sajt behöver?</h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Vi tittar på sajten och ger ett konkret förslag. Kostnadsfritt och utan krav på att du
              blir kund.
            </p>
          </div>
          <Button size="lg" asChild onClick={() => track("footer_cta_click")}>
            <Link to="/kontakt">Boka genomgång</Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
