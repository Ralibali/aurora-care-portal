export type HealthStatus = "healthy" | "attention" | "critical" | "unknown";

export const healthLabels: Record<HealthStatus, string> = {
  healthy: "Frisk",
  attention: "Behöver ses över",
  critical: "Kritisk",
  unknown: "Okänd",
};

export type SiteHealthInput = {
  last_backup_at: string | null;
  ssl_expires_at: string | null;
  pending_updates: number;
  security_findings: number;
  uptime_30d: number | string | null;
  /** Timmar mellan säkerhetskopior enligt planen. */
  backupIntervalHours?: number;
};

/**
 * Härleder hälsostatus från operativa mätvärden.
 * Ren funktion – används både i UI och i tester.
 */
export function deriveHealth(input: SiteHealthInput): HealthStatus {
  const interval = input.backupIntervalHours ?? 24 * 8;
  const uptime =
    input.uptime_30d == null
      ? null
      : typeof input.uptime_30d === "string"
        ? Number(input.uptime_30d)
        : input.uptime_30d;

  const backupAgeH = input.last_backup_at
    ? (Date.now() - new Date(input.last_backup_at).getTime()) / 36e5
    : Infinity;
  const sslDays = input.ssl_expires_at
    ? (new Date(input.ssl_expires_at).getTime() - Date.now()) / 864e5
    : null;

  // Ingen mätdata alls (t.ex. sajt under onboarding) – status är okänd, inte kritisk.
  const unmeasured =
    !input.last_backup_at &&
    uptime == null &&
    !input.ssl_expires_at &&
    input.security_findings === 0 &&
    input.pending_updates === 0;
  if (unmeasured) return "unknown";

  const critical =

    input.security_findings >= 3 ||
    backupAgeH > interval * 2 ||
    (sslDays != null && sslDays <= 5) ||
    (uptime != null && uptime < 99) ||
    input.pending_updates >= 12;
  if (critical) return "critical";

  const attention =
    input.security_findings > 0 ||
    backupAgeH > interval ||
    (sslDays != null && sslDays <= 21) ||
    (uptime != null && uptime < 99.9) ||
    input.pending_updates >= 5;
  if (attention) return "attention";

  if (uptime == null && !input.last_backup_at) return "unknown";
  return "healthy";
}

/** Sorteringsvikt: mest allvarligt först. */
export const healthWeight: Record<HealthStatus, number> = {
  critical: 0,
  attention: 1,
  unknown: 2,
  healthy: 3,
};
