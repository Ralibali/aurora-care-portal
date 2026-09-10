import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Plan = Tables<"plans">;
export type Site = Tables<"sites">;
export type Customer = Tables<"customers">;
export type Incident = Tables<"incidents">;
export type MaintenanceEvent = Tables<"maintenance_events">;
export type Report = Tables<"reports">;
export type SupportRequest = Tables<"support_requests">;
export type BillingState = Tables<"billing_state">;
export type IntegrationConnection = Tables<"integration_connections">;

function unwrap<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(error.message);
  return (data ?? []) as T;
}

export const plansQuery = queryOptions({
  queryKey: ["plans"],
  queryFn: async () =>
    unwrap<Plan[]>(
      await supabase.from("plans").select("*").eq("is_active", true).order("sort_order"),
    ),
  staleTime: 5 * 60 * 1000,
});

export const allPlansQuery = queryOptions({
  queryKey: ["plans", "all"],
  queryFn: async () => unwrap<Plan[]>(await supabase.from("plans").select("*").order("sort_order")),
});

export type SiteWithRelations = Site & {
  customers: Pick<Customer, "id" | "name"> | null;
  plans: Pick<Plan, "id" | "name" | "slug" | "price_sek_monthly"> | null;
};

export const sitesQuery = queryOptions({
  queryKey: ["sites"],
  queryFn: async () =>
    unwrap<SiteWithRelations[]>(
      await supabase
        .from("sites")
        .select("*, customers(id, name), plans(id, name, slug, price_sek_monthly)")
        .order("name"),
    ),
});

export function siteQuery(siteId: string) {
  return queryOptions({
    queryKey: ["site", siteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sites")
        .select("*, customers(id, name, contact_name, contact_email), plans(id, name, slug, price_sek_monthly)")
        .eq("id", siteId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as (SiteWithRelations & {
        customers: (Pick<Customer, "id" | "name" | "contact_name" | "contact_email">) | null;
      }) | null;
    },
  });
}

export const customersQuery = queryOptions({
  queryKey: ["customers"],
  queryFn: async () =>
    unwrap<Customer[]>(await supabase.from("customers").select("*").order("name")),
});

export const incidentsQuery = queryOptions({
  queryKey: ["incidents"],
  queryFn: async () =>
    unwrap<(Incident & { sites: Pick<Site, "id" | "name"> | null })[]>(
      await supabase
        .from("incidents")
        .select("*, sites(id, name)")
        .order("opened_at", { ascending: false }),
    ),
});

export function siteIncidentsQuery(siteId: string) {
  return queryOptions({
    queryKey: ["incidents", siteId],
    queryFn: async () =>
      unwrap<Incident[]>(
        await supabase
          .from("incidents")
          .select("*")
          .eq("site_id", siteId)
          .order("opened_at", { ascending: false }),
      ),
  });
}

export function siteEventsQuery(siteId: string) {
  return queryOptions({
    queryKey: ["events", siteId],
    queryFn: async () =>
      unwrap<MaintenanceEvent[]>(
        await supabase
          .from("maintenance_events")
          .select("*")
          .eq("site_id", siteId)
          .order("occurred_at", { ascending: false })
          .limit(30),
      ),
  });
}

export const reportsQuery = queryOptions({
  queryKey: ["reports"],
  queryFn: async () =>
    unwrap<(Report & { sites: Pick<Site, "id" | "name"> | null })[]>(
      await supabase
        .from("reports")
        .select("*, sites(id, name)")
        .order("period_month", { ascending: false }),
    ),
});

export function reportQuery(reportId: string) {
  return queryOptions({
    queryKey: ["report", reportId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("*, sites(id, name, domain, plans(name)), organizations(name)")
        .eq("id", reportId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as
        | (Report & {
            sites: (Pick<Site, "id" | "name" | "domain"> & { plans: { name: string } | null }) | null;
            organizations: { name: string } | null;
          })
        | null;
    },
  });
}

export const billingQuery = queryOptions({
  queryKey: ["billing"],
  queryFn: async () =>
    unwrap<(BillingState & { plans: Pick<Plan, "name" | "slug"> | null })[]>(
      await supabase.from("billing_state").select("*, plans(name, slug)"),
    ),
});

export const supportRequestsQuery = queryOptions({
  queryKey: ["support_requests"],
  queryFn: async () =>
    unwrap<(SupportRequest & { sites: Pick<Site, "id" | "name"> | null })[]>(
      await supabase
        .from("support_requests")
        .select("*, sites(id, name)")
        .order("created_at", { ascending: false }),
    ),
});

export const integrationsQuery = queryOptions({
  queryKey: ["integration_connections"],
  queryFn: async () =>
    unwrap<IntegrationConnection[]>(
      await supabase.from("integration_connections").select("*").order("created_at"),
    ),
});

export const organizationsQuery = queryOptions({
  queryKey: ["organizations"],
  queryFn: async () =>
    unwrap<Tables<"organizations">[]>(
      await supabase.from("organizations").select("*").order("name"),
    ),
});
