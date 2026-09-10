import { describe, expect, it } from "vitest";

import { calculateMrr, countByPlan, isReportOverdue, isRevenueGenerating } from "@/lib/mrr";

describe("MRR", () => {
  it("counts only running subscriptions", () => {
    expect(
      calculateMrr([
        { status: "active", mrr_sek: 899 },
        { status: "past_due", mrr_sek: 499 },
        { status: "trialing", mrr_sek: 1490 },
        { status: "canceled", mrr_sek: 1490 },
        { status: "pending", mrr_sek: 899 },
      ]),
    ).toBe(1398);
  });

  it("treats a missing amount as zero", () => {
    expect(calculateMrr([{ status: "active", mrr_sek: null }])).toBe(0);
  });

  it("is zero without subscriptions", () => {
    expect(calculateMrr([])).toBe(0);
  });

  it("classifies statuses", () => {
    expect(isRevenueGenerating("active")).toBe(true);
    expect(isRevenueGenerating("canceled")).toBe(false);
  });
});

describe("plan distribution", () => {
  it("groups sites per plan and buckets unassigned ones", () => {
    expect(
      countByPlan([{ plan_id: "a" }, { plan_id: "a" }, { plan_id: "b" }, { plan_id: null }]),
    ).toEqual({ a: 2, b: 1, unassigned: 1 });
  });
});

describe("report deadlines", () => {
  const period = "2026-01-01";

  it("is overdue when the month closed and nothing was sent", () => {
    expect(isReportOverdue({ period_month: period, status: "draft" }, new Date("2026-02-15"))).toBe(
      true,
    );
  });

  it("is not overdue within the grace period", () => {
    expect(isReportOverdue({ period_month: period, status: "draft" }, new Date("2026-02-05"))).toBe(
      false,
    );
  });

  it("is never overdue once sent", () => {
    expect(isReportOverdue({ period_month: period, status: "sent" }, new Date("2026-06-01"))).toBe(
      false,
    );
  });
});
