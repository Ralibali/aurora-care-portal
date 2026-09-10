import { useQueries } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { DemoBadge } from "@/components/common/HealthBadge";
import { EmptyState, ErrorState, LoadingRows } from "@/components/common/States";
import { billingQuery, customersQuery, sitesQuery } from "@/lib/data";
import { formatDate, formatSek } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/kunder")({
  component: AdminCustomers,
});

function AdminCustomers() {
  const [customers, sites, billing] = useQueries({
    queries: [customersQuery, sitesQuery, billingQuery],
  });

  if (customers.isLoading || sites.isLoading || billing.isLoading) return <LoadingRows rows={4} />;
  const error = customers.error ?? sites.error ?? billing.error;
  if (error) return <ErrorState message={(error as Error).message} />;

  const rows = customers.data ?? [];
  if (rows.length === 0) {
    return (
      <EmptyState
        title="Inga kunder ännu"
        description="Lägg upp den första kunden när du registrerar en sajt."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/70 bg-card">
      <table className="w-full min-w-[44rem] text-sm">
        <thead>
          <tr className="border-b border-border bg-surface/70 text-left">
            <th scope="col" className="p-3 font-medium">Kund</th>
            <th scope="col" className="p-3 font-medium">Kontakt</th>
            <th scope="col" className="p-3 font-medium">Sajter</th>
            <th scope="col" className="p-3 font-medium">MRR</th>
            <th scope="col" className="p-3 font-medium">Förnyelse</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => {
            const customerSites = (sites.data ?? []).filter((s) => s.customer_id === c.id);
            const bills = (billing.data ?? []).filter(
              (b) => b.customer_id === c.id && b.status === "active",
            );
            const mrr = bills.reduce((sum, b) => sum + Number(b.mrr_sek ?? 0), 0);
            const renewal = bills
              .map((b) => b.renewal_date)
              .filter(Boolean)
              .sort()[0];
            return (
              <tr key={c.id} className="border-b border-border/60 last:border-0">
                <td className="p-3">
                  <div className="flex items-center gap-2 font-medium">
                    {c.name}
                    {c.is_demo ? <DemoBadge /> : null}
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">
                  <div>{c.contact_name ?? "–"}</div>
                  <div className="text-xs">{c.contact_email ?? ""}</div>
                </td>
                <td className="p-3 tabular-nums text-muted-foreground">{customerSites.length}</td>
                <td className="p-3 tabular-nums text-muted-foreground">{formatSek(mrr)}</td>
                <td className="p-3 text-muted-foreground">{formatDate(renewal ?? null)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
