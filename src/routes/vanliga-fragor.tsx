import { createFileRoute } from "@tanstack/react-router";

import { PublicLayout } from "@/components/site/PublicLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const title = "Vanliga frågor om WordPress-underhåll | Aurora Care";
const description =
  "Svar på vanliga frågor om Aurora Care: bindningstid, säkerhetskopior, vem som äger sajten, vad som händer vid intrång och hur uppdateringar hanteras.";

const faqs: Array<[string, string]> = [
  [
    "Måste jag byta webbhotell?",
    "Nej. Aurora Care fungerar med de flesta webbhotell. Vi säger till om vi ser att miljön begränsar sajtens säkerhet eller prestanda.",
  ],
  [
    "Vem äger sajten och innehållet?",
    "Du. Aurora Media AB sköter underhållet, men sajten, domänen och innehållet är och förblir ditt.",
  ],
  [
    "Hur lång är bindningstiden?",
    "Ingen. Abonnemanget löper månadsvis och kan sägas upp till nästa månadsskifte.",
  ],
  [
    "Vad händer om sajten blir hackad?",
    "Vi utreder, avgränsar och återställer från en verifierad säkerhetskopia i dialog med dig. På Care och Care+ ingår återställningsstöd i abonnemanget.",
  ],
  [
    "Kan en uppdatering förstöra sajten?",
    "Det är därför vi arbetar med rutin och kontroll. På Care+ testas uppdateringar i en kopia av sajten först. Skulle något ändå gå fel finns en färsk säkerhetskopia.",
  ],
  [
    "Ingår ändringar av innehåll och design?",
    "Mindre justeringar hanterar vi via supportärenden. Större arbeten offereras separat som uppdrag.",
  ],
  [
    "Får jag se vad ni faktiskt gjort?",
    "Ja. I kundportalen ser du status, säkerhetskopior, uppdateringar och incidenter, och varje månad får du en sammanställd rapport.",
  ],
];

export const Route = createFileRoute("/vanliga-fragor")({
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
          "@type": "FAQPage",
          mainEntity: faqs.map(([q, a]) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }),
      },
    ],
  }),
  component: Faq,
});

function Faq() {
  return (
    <PublicLayout>
      <section className="border-b border-border/70 bg-surface">
        <div className="mx-auto w-full max-w-4xl px-4 py-16">
          <h1 className="text-4xl font-semibold">Vanliga frågor</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Hittar du inte svaret? Hör av dig, vi svarar samma arbetsdag.
          </p>
        </div>
      </section>
      <section className="mx-auto w-full max-w-4xl px-4 py-16">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map(([q, a], i) => (
            <AccordionItem key={q} value={`fraga-${i}`}>
              <AccordionTrigger className="text-left text-base">{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </PublicLayout>
  );
}
