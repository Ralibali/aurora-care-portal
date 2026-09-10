/** Kommersiella beräkningar. Rena funktioner – testbara utan databas. */

export type BillingLike = {
  status: "trialing" | "active" | "past_due" | "canceled" | "pending" | string;
  mrr_sek: number | null;
};

/** Endast intäkt som faktiskt löper räknas som MRR. */
export function isRevenueGenerating(status: string): boolean {
  return status === "active" || status === "past_due";
}

export function calculateMrr(rows: BillingLike[]): number {
  return rows.reduce(
    (sum, row) => (isRevenueGenerating(row.status) ? sum + (row.mrr_sek ?? 0) : sum),
    0,
  );
}

export function countByPlan<T extends { plan_id: string | null }>(
  rows: T[],
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const row of rows) {
    const key = row.plan_id ?? "unassigned";
    out[key] = (out[key] ?? 0) + 1;
  }
  return out;
}

/** En rapport är försenad om perioden är avslutad och den inte skickats. */
export function isReportOverdue(
  report: { period_month: string; status: string },
  now: Date = new Date(),
): boolean {
  if (report.status === "sent") return false;
  const period = new Date(report.period_month);
  const dueDate = new Date(period.getFullYear(), period.getMonth() + 1, 8);
  return now.getTime() > dueDate.getTime();
}
