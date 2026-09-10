/**
 * WPMgr-integrationens kontrakt (klientsäkert – bara typer och konstanter).
 *
 * Aurora Care äger INGEN WPMgr-kod. Uppströms WPMgr är en fristående
 * AGPL-3.0-tjänst som vi enbart pratar med över HTTP genom denna adapter.
 * Ingen WPMgr-källkod får kopieras in i det här projektet.
 *
 * v0.1 är LÄSANDE. Inga skrivande eller destruktiva anrop får läggas till här
 * utan att först dokumenteras i docs/KIMI_HANDOFF.md och godkännas.
 */

export type WpmgrMode = "demo" | "live";

export type WpmgrSiteHealth = {
  siteId: string;
  health: "healthy" | "attention" | "critical" | "unknown";
  wpVersion: string | null;
  phpVersion: string | null;
  sslExpiresAt: string | null;
  performanceScore: number | null;
};

export type WpmgrUptimePoint = { date: string; uptimePct: number };

export type WpmgrBackup = {
  id: string;
  siteId: string;
  completedAt: string;
  sizeMb: number | null;
  verified: boolean;
};

export type WpmgrUpdate = {
  id: string;
  siteId: string;
  component: string;
  type: "core" | "plugin" | "theme";
  fromVersion: string | null;
  toVersion: string | null;
  status: "pending" | "applied";
  appliedAt: string | null;
};

export type WpmgrSecurityFinding = {
  id: string;
  siteId: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  detectedAt: string;
};

export type WpmgrIncident = {
  id: string;
  siteId: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "investigating" | "resolved";
  openedAt: string;
  resolvedAt: string | null;
};

export type WpmgrConnectionResult = {
  ok: boolean;
  mode: WpmgrMode;
  message: string;
  latencyMs: number | null;
  checkedAt: string;
};

/**
 * Läsande adapterinterface. Endast denna fil + wpmgr.server.ts känner till
 * uppströms endpoints. Byt implementation, inte anropsställen.
 */
export interface WpmgrAdapter {
  readonly mode: WpmgrMode;
  testConnection(): Promise<WpmgrConnectionResult>;
  getSiteHealth(siteRef: string): Promise<WpmgrSiteHealth | null>;
  getUptime(siteRef: string, days: number): Promise<WpmgrUptimePoint[]>;
  getBackups(siteRef: string, limit: number): Promise<WpmgrBackup[]>;
  getUpdates(siteRef: string, limit: number): Promise<WpmgrUpdate[]>;
  getSecurityFindings(siteRef: string, limit: number): Promise<WpmgrSecurityFinding[]>;
  getIncidents(siteRef: string, limit: number): Promise<WpmgrIncident[]>;
}

/**
 * TODO (Kimi/AgentSwarm): verifiera de faktiska sökvägarna mot den
 * självhostade WPMgr-instansen innan `live`-läget aktiveras. Värdena nedan är
 * ett FÖRSLAG på mappning och får inte antas vara korrekta.
 * Ingen av dessa vägar får vara skrivande.
 */
export const WPMGR_ENDPOINT_MAP = {
  health: "/api/v1/health",
  siteHealth: (siteRef: string) => `/api/v1/sites/${encodeURIComponent(siteRef)}`,
  uptime: (siteRef: string) => `/api/v1/sites/${encodeURIComponent(siteRef)}/uptime`,
  backups: (siteRef: string) => `/api/v1/sites/${encodeURIComponent(siteRef)}/backups`,
  updates: (siteRef: string) => `/api/v1/sites/${encodeURIComponent(siteRef)}/updates`,
  security: (siteRef: string) => `/api/v1/sites/${encodeURIComponent(siteRef)}/security`,
  incidents: (siteRef: string) => `/api/v1/sites/${encodeURIComponent(siteRef)}/incidents`,
} as const;

export const WPMGR_UNVERIFIED_CONTRACT = true;
