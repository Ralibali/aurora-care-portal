import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import type { WpmgrConnectionResult } from "./contract";

async function assertAdmin(context: {
  supabase: { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown }> };
  userId: string;
}) {
  const { data } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (data !== true) throw new Error("Behörighet saknas.");
}

/** Testar anslutningen mot WPMgr. Endast Aurora-administratörer. */
export const testWpmgrConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<WpmgrConnectionResult> => {
    await assertAdmin(context as never);
    const { getWpmgrAdapter } = await import("./wpmgr.server");
    return getWpmgrAdapter().testConnection();
  });

export type WpmgrSyncResult = {
  mode: "demo" | "live";
  ok: boolean;
  sitesConsidered: number;
  sitesUpdated: number;
  message: string;
  ranAt: string;
};

/**
 * Läsande synk-skal. I demoläge görs inga externa anrop och inga
 * fältvärden skrivs över – bara tidsstämpeln för senaste försök.
 * I live-läge hämtas hälsodata och speglas till sites-tabellen.
 */
export const runWpmgrSync = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<WpmgrSyncResult> => {
    await assertAdmin(context as never);
    const ctx = context as unknown as {
      supabase: {
        from: (t: string) => {
          select: (c: string) => Promise<{ data: Array<Record<string, unknown>> | null }>;
        };
      };
    };
    const { getWpmgrAdapter, isLiveConfigured } = await import("./wpmgr.server");
    const adapter = getWpmgrAdapter();
    const ranAt = new Date().toISOString();

    const { data: sites } = await ctx.supabase
      .from("sites")
      .select("id, wpmgr_site_id, domain");
    const list = sites ?? [];

    if (!isLiveConfigured()) {
      return {
        mode: "demo",
        ok: true,
        sitesConsidered: list.length,
        sitesUpdated: 0,
        message:
          "Demoläge: ingen extern hämtning gjordes. Konfigurera WPMGR_BASE_URL och WPMGR_API_TOKEN för riktig synk.",
        ranAt,
      };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let updated = 0;
    for (const site of list) {
      const ref = (site["wpmgr_site_id"] as string | null) ?? null;
      if (!ref) continue;
      try {
        const health = await adapter.getSiteHealth(ref);
        if (!health) continue;
        await supabaseAdmin
          .from("sites")
          .update({
            health: health.health,
            wp_version: health.wpVersion,
            php_version: health.phpVersion,
            ssl_expires_at: health.sslExpiresAt,
            performance_score: health.performanceScore,
            last_sync_at: ranAt,
          })
          .eq("id", site["id"] as string);
        updated += 1;
      } catch (error) {
        console.error("[wpmgr] synk misslyckades för sajt", site["id"], error);
      }
    }

    return {
      mode: "live",
      ok: true,
      sitesConsidered: list.length,
      sitesUpdated: updated,
      message: `Synk klar. ${updated} av ${list.length} sajter uppdaterade.`,
      ranAt,
    };
  });
