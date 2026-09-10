import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import type { AppRole, Viewer } from "@/lib/access";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, loading };
}

export function useViewer(): { viewer: Viewer | null; loading: boolean } {
  const { session, loading: sessionLoading } = useSession();
  const userId = session?.user?.id ?? null;

  const query = useQuery({
    queryKey: ["viewer", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Viewer> => {
      const [rolesRes, profileRes] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", userId!),
        supabase.from("profiles").select("organization_id").eq("id", userId!).maybeSingle(),
      ]);
      return {
        userId,
        roles: (rolesRes.data ?? []).map((r) => r.role as AppRole),
        organizationId: profileRes.data?.organization_id ?? null,
      };
    },
  });

  if (!userId) return { viewer: null, loading: sessionLoading };
  return { viewer: query.data ?? null, loading: sessionLoading || query.isLoading };
}
