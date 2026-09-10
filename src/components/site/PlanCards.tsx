import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { EmptyState, ErrorState, LoadingRows } from "@/components/common/States";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { plansQuery } from "@/lib/data";
import { formatSek } from "@/lib/format";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function PlanCards() {
  const { data, isLoading, error } = useQuery(plansQuery);

  if (isLoading) return <LoadingRows rows={3} />;
  if (error) return <ErrorState message={(error as Error).message} />;
  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="Inga planer publicerade"
        description="Planerna hanteras i Aurora Cares administration och visas här så snart de är aktiva."
      />
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {data.map((plan) => {
        const features = Array.isArray(plan.features) ? (plan.features as string[]) : [];
        return (
          <Card
            key={plan.id}
            className={cn(
              "flex flex-col border-border/70",
              plan.is_featured ? "card-elevated ring-2 ring-accent" : "card-elevated",
            )}
          >
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                {plan.is_featured ? (
                  <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent-foreground">
                    Populärast
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground">{plan.tagline}</p>
              <p className="pt-2">
                <span className="text-3xl font-semibold tabular-nums">
                  {formatSek(plan.price_sek_monthly)}
                </span>
                <span className="text-sm text-muted-foreground"> /månad per sajt</span>
              </p>
              <p className="text-xs text-muted-foreground">Exklusive moms. Månadsvis, ingen bindningstid.</p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <ul className="flex-1 space-y-2.5 text-sm">
                {features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="mt-6 w-full"
                variant={plan.is_featured ? "hero" : "default"}
                asChild
                onClick={() => track("plan_cta_click", { plan: plan.slug })}
              >
                <Link to="/kontakt" search={{ plan: plan.slug }}>
                  Välj {plan.name}
                </Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
