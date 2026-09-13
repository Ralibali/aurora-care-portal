import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

import type { AuditKind, ConsentAsset, SiteFinding, SiteScan } from "./types";

const db = supabase as unknown as {
  from: (table: string) => ReturnType<typeof supabase.from>;
};

export function siteScansQuery(siteId: string) {
  return queryOptions({
    queryKey: ["site-scans", siteId],
    queryFn: async () => {
      const { data, error } = await db
        .from("site_scans")
        .select("*")
        .eq("site_id", siteId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as unknown as SiteScan[];
    },
  });
}

export function siteFindingsQuery(siteId: string, kind?: AuditKind) {
  return queryOptions({
    queryKey: ["site-findings", siteId, kind ?? "all"],
    queryFn: async () => {
      let query = db
        .from("site_findings")
        .select("*")
        .eq("site_id", siteId)
        .in("status", ["open", "accepted"])
        .order("created_at", { ascending: false });
      if (kind) query = query.eq("kind", kind);
      const { data, error } = await query.limit(100);
      if (error) throw error;
      return (data ?? []) as unknown as SiteFinding[];
    },
  });
}

export function consentAssetsQuery(siteId: string) {
  return queryOptions({
    queryKey: ["consent-assets", siteId],
    queryFn: async () => {
      const { data, error } = await db
        .from("consent_assets")
        .select("*")
        .eq("site_id", siteId)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as unknown as ConsentAsset[];
    },
  });
}

export async function runSiteAudit(siteId: string, kind: AuditKind) {
  const { data, error } = await supabase.functions.invoke("run-site-audit", {
    body: { siteId, kind },
  });
  if (error) throw error;
  if (!data?.ok) throw new Error(data?.error ?? "Granskningen kunde inte genomföras.");
  return data as { ok: true; scanId: string; kind: AuditKind; summary: Record<string, unknown> };
}
