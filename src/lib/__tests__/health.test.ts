import { describe, expect, it } from "vitest";

import { deriveHealth, healthWeight } from "@/lib/health";

const hoursAgo = (h: number) => new Date(Date.now() - h * 36e5).toISOString();
const daysAhead = (d: number) => new Date(Date.now() + d * 864e5).toISOString();

const healthy = {
  last_backup_at: hoursAgo(6),
  ssl_expires_at: daysAhead(120),
  pending_updates: 0,
  security_findings: 0,
  uptime_30d: 99.99,
  backupIntervalHours: 24,
};

describe("deriveHealth", () => {
  it("marks a well-kept site as healthy", () => {
    expect(deriveHealth(healthy)).toBe("healthy");
  });

  it("flags attention on a soon-expiring certificate", () => {
    expect(deriveHealth({ ...healthy, ssl_expires_at: daysAhead(14) })).toBe("attention");
  });

  it("flags attention on any open security finding", () => {
    expect(deriveHealth({ ...healthy, security_findings: 1 })).toBe("attention");
  });

  it("escalates to critical on several security findings", () => {
    expect(deriveHealth({ ...healthy, security_findings: 3 })).toBe("critical");
  });

  it("escalates to critical when backups are far overdue", () => {
    expect(deriveHealth({ ...healthy, last_backup_at: hoursAgo(72) })).toBe("critical");
  });

  it("escalates to critical on low uptime", () => {
    expect(deriveHealth({ ...healthy, uptime_30d: 98.4 })).toBe("critical");
  });

  it("accepts uptime delivered as a numeric string from Postgres", () => {
    expect(deriveHealth({ ...healthy, uptime_30d: "99.99" })).toBe("healthy");
  });

  it("returns unknown when nothing has been measured", () => {
    expect(
      deriveHealth({
        last_backup_at: null,
        ssl_expires_at: null,
        pending_updates: 0,
        security_findings: 0,
        uptime_30d: null,
      }),
    ).toBe("unknown");
  });

  it("sorts most severe first", () => {
    expect(
      (["healthy", "critical", "unknown", "attention"] as const)
        .slice()
        .sort((a, b) => healthWeight[a] - healthWeight[b]),
    ).toEqual(["critical", "attention", "unknown", "healthy"]);
  });
});
