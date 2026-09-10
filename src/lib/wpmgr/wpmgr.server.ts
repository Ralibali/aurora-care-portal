import {
  WPMGR_ENDPOINT_MAP,
  type WpmgrAdapter,
  type WpmgrBackup,
  type WpmgrConnectionResult,
  type WpmgrIncident,
  type WpmgrSecurityFinding,
  type WpmgrSiteHealth,
  type WpmgrUpdate,
  type WpmgrUptimePoint,
} from "./contract";

/**
 * Serverbara implementationer av WpmgrAdapter.
 * Hemligheter läses ENDAST här, aldrig i klientkod.
 */

function readConfig() {
  const baseUrl = process.env["WPMGR_BASE_URL"]?.trim() || null;
  const token = process.env["WPMGR_API_TOKEN"]?.trim() || null;
  return { baseUrl, token };
}

export function isLiveConfigured(): boolean {
  const { baseUrl, token } = readConfig();
  return Boolean(baseUrl && token);
}

/** Demo-adapter: läser inget externt, används tills WPMgr är konfigurerat. */
export const demoAdapter: WpmgrAdapter = {
  mode: "demo",
  async testConnection(): Promise<WpmgrConnectionResult> {
    const { baseUrl, token } = readConfig();
    const missing = [
      ...(baseUrl ? [] : ["WPMGR_BASE_URL"]),
      ...(token ? [] : ["WPMGR_API_TOKEN"]),
    ];
    return {
      ok: false,
      mode: "demo",
      message: `Demoläge. Saknar ${missing.join(" och ")}. Aurora Care visar seedad demodata tills anslutningen är konfigurerad.`,
      latencyMs: null,
      checkedAt: new Date().toISOString(),
    };
  },
  async getSiteHealth(): Promise<WpmgrSiteHealth | null> {
    return null;
  },
  async getUptime(): Promise<WpmgrUptimePoint[]> {
    return [];
  },
  async getBackups(): Promise<WpmgrBackup[]> {
    return [];
  },
  async getUpdates(): Promise<WpmgrUpdate[]> {
    return [];
  },
  async getSecurityFindings(): Promise<WpmgrSecurityFinding[]> {
    return [];
  },
  async getIncidents(): Promise<WpmgrIncident[]> {
    return [];
  },
};

async function get<T>(path: string): Promise<T> {
  const { baseUrl, token } = readConfig();
  if (!baseUrl || !token) throw new Error("WPMgr är inte konfigurerat.");
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`WPMgr svarade ${res.status}`);
  }
  return (await res.json()) as T;
}

/**
 * Live-adapter mot en självhostad WPMgr-instans.
 * TODO (Kimi/AgentSwarm): svarsformaten nedan är ANTAGANDEN. Mappa om efter
 * att kontraktstesterna körts mot en riktig instans. Endast GET tillåtet.
 */
export const httpAdapter: WpmgrAdapter = {
  mode: "live",
  async testConnection(): Promise<WpmgrConnectionResult> {
    const started = Date.now();
    try {
      await get<unknown>(WPMGR_ENDPOINT_MAP.health);
      return {
        ok: true,
        mode: "live",
        message: "Anslutningen till WPMgr svarade.",
        latencyMs: Date.now() - started,
        checkedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        ok: false,
        mode: "live",
        message: error instanceof Error ? error.message : "Okänt fel mot WPMgr.",
        latencyMs: Date.now() - started,
        checkedAt: new Date().toISOString(),
      };
    }
  },
  getSiteHealth: (siteRef) =>
    get<WpmgrSiteHealth | null>(WPMGR_ENDPOINT_MAP.siteHealth(siteRef)),
  getUptime: (siteRef) => get<WpmgrUptimePoint[]>(WPMGR_ENDPOINT_MAP.uptime(siteRef)),
  getBackups: (siteRef) => get<WpmgrBackup[]>(WPMGR_ENDPOINT_MAP.backups(siteRef)),
  getUpdates: (siteRef) => get<WpmgrUpdate[]>(WPMGR_ENDPOINT_MAP.updates(siteRef)),
  getSecurityFindings: (siteRef) =>
    get<WpmgrSecurityFinding[]>(WPMGR_ENDPOINT_MAP.security(siteRef)),
  getIncidents: (siteRef) => get<WpmgrIncident[]>(WPMGR_ENDPOINT_MAP.incidents(siteRef)),
};

export function getWpmgrAdapter(): WpmgrAdapter {
  return isLiveConfigured() ? httpAdapter : demoAdapter;
}
