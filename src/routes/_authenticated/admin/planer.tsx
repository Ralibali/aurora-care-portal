import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { ErrorState, LoadingRows } from "@/components/common/States";
import { Badge } from "@/components/ui/badge";
import { allPlansQuery } from "@/lib/data";
import { formatSek } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/planer")({
  component: AdminPlans,
});

function AdminPlans() {
  const { data, isLoading, error } = useQuery(allPlansQuery);
  if (isLoading) return <LoadingRows rows={3} />;
  if (error) return <ErrorState message={(error as Error).message} />;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Priserna hämtas från databasen och styr både webbplatsen och intäktsberäkningen. Redigering
        i gränssnittet är inte påslagen i version 0.1.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {(data ?? []).map((plan) => (
          <div key={plan.id} className="rounded-xl border border-border/70 bg-card p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold">{plan.name}</h2>
              {plan.is_active ? null : <Badge variant="outline">Inaktiv</Badge>}
            </div>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {formatSek(plan.price_sek_monthly)}
              <span className="text-sm font-normal text-muted-foreground"> /mån</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{plan.tagline ?? ""}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              Stripe-pris: {plan.stripe_price_id ?? "ej kopplat"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
