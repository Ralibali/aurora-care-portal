import { createFileRoute, Link } from "@tanstack/react-router";

import { PlanCards } from "@/components/site/PlanCards";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";

const title = "Priser för WordPress-underhåll – från 499 kr/mån | Aurora Care";
const description =
  "Tre planer för löpande WordPress-underhåll: Bas 499 kr, Care 899 kr och Care+ 1 490 kr per månad och sajt. Ingen bindningstid.";

export const Route = createFileRoute("/priser")({
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
  component: Pricing,
});

const comparison: Array<[string, string, string, string]> = [
  ["Uppetidsövervakning", "Ja", "Ja", "Ja"],
  ["Säkerhetskopior", "Varje vecka", "Varje dygn", "Varje dygn"],
  ["Uppdateringar", "Säkra uppdateringar", "Hanterade uppdateringar", "Testade före produktion"],
  ["Säkerhetsövervakning", "–", "Ja", "Ja"],
  ["Återställningsstöd", "–", "Ja", "Ja"],
  ["Prioriterad support", "–", "–", "Ja"],
  ["Prestanda- och säkerhetsgenomgång", "–", "–", "Ja"],
  ["Förbättringsförslag", "–", "–", "Varje kvartal"],
  ["Månadsrapport", "Ja", "Ja", "Ja"],
];

function Pricing() {
  return (
    <PublicLayout>
      <section className="border-b border-border/70 bg-surface">
        <div className="mx-auto w-full max-w-6xl px-4 py-16">
          <h1 className="text-4xl font-semibold">Priser</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Priset gäller per webbplats och månad, exklusive moms. Har du flera sajter räknar vi
            fram ett samlat pris.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <PlanCards />
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-20">
        <h2 className="text-2xl font-semibold">Jämför planerna</h2>
        <div className="mt-6 overflow-x-auto rounded-xl border border-border/70 bg-card">
          <table className="w-full min-w-[36rem] text-sm">
            <caption className="sr-only">Jämförelse av Aurora Cares planer</caption>
            <thead>
              <tr className="border-b border-border bg-surface/70 text-left">
                <th scope="col" className="p-4 font-medium">
                  Ingår
                </th>
                <th scope="col" className="p-4 font-medium">
                  Bas
                </th>
                <th scope="col" className="p-4 font-medium">
                  Care
                </th>
                <th scope="col" className="p-4 font-medium">
                  Care+
                </th>
              </tr>
            </thead>
            <tbody>
              {comparison.map(([label, bas, care, plus]) => (
                <tr key={label} className="border-b border-border/60 last:border-0">
                  <th scope="row" className="p-4 text-left font-normal">
                    {label}
                  </th>
                  <td className="p-4 text-muted-foreground">{bas}</td>
                  <td className="p-4 text-muted-foreground">{care}</td>
                  <td className="p-4 text-muted-foreground">{plus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-8 rounded-xl border border-border/70 bg-surface p-6">
          <h3 className="font-semibold">Betalning</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Fakturering sker månadsvis. Kortbetalning är förberedd men aktiveras först när
            avtalet är på plats – vi tar aldrig betalt innan du sagt ja.
          </p>
          <Button className="mt-4" asChild>
            <Link to="/kontakt">Begär offert</Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
