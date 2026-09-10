export type AppRole = "admin" | "client";

export type Viewer = {
  userId: string | null;
  roles: AppRole[];
  organizationId: string | null;
};

export function isAdmin(viewer: Viewer | null | undefined): boolean {
  return !!viewer?.roles.includes("admin");
}

export function isClient(viewer: Viewer | null | undefined): boolean {
  return !!viewer?.roles.includes("client") && !isAdmin(viewer);
}

/**
 * Klientspegling av databasens åtkomstregler.
 * Databasen är sanningen (RLS) – detta styr bara vad UI:t visar.
 */
export function canViewOrganization(
  viewer: Viewer | null | undefined,
  organizationId: string | null | undefined,
): boolean {
  if (!viewer?.userId) return false;
  if (isAdmin(viewer)) return true;
  if (!organizationId || !viewer.organizationId) return false;
  return viewer.organizationId === organizationId;
}

export function canViewSite(
  viewer: Viewer | null | undefined,
  site: { organization_id: string | null } | null | undefined,
): boolean {
  return canViewOrganization(viewer, site?.organization_id);
}

/** v0.1 tillåter inga skarpa åtgärder mot WordPress – för någon roll. */
export function canRunDestructiveAction(): false {
  return false;
}

export function homePathForViewer(viewer: Viewer | null | undefined): string {
  if (!viewer?.userId) return "/auth";
  return isAdmin(viewer) ? "/admin" : "/portal";
}
