import { createFileRoute, Navigate, Outlet, useRouterState } from "@tanstack/react-router";

import { AppShell, type NavItem } from "@/components/app/AppShell";
import { LoadingRows } from "@/components/common/States";
import { useViewer } from "@/hooks/useViewer";
import { isAdmin } from "@/lib/access";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const items: NavItem[] = [
  { to: "/admin", label: "Översikt" },
  { to: "/admin/sajter", label: "Sajter" },
  { to: "/admin/kunder", label: "Kunder" },
  { to: "/admin/incidenter", label: "Incidenter" },
  { to: "/admin/rapporter", label: "Rapporter" },
  { to: "/admin/support", label: "Supportärenden" },
  { to: "/admin/onboarding", label: "Ny sajt" },
  { to: "/admin/planer", label: "Planer och priser" },
  { to: "/admin/integrationer", label: "Integrationer" },
];

const titles: Record<string, string> = {
  "/admin": "Översikt",
  "/admin/sajter": "Sajter",
  "/admin/kunder": "Kunder",
  "/admin/incidenter": "Incidenter",
  "/admin/rapporter": "Rapporter",
  "/admin/support": "Supportärenden",
  "/admin/onboarding": "Ny sajt",
  "/admin/planer": "Planer och priser",
  "/admin/integrationer": "Integrationer",
};

function AdminLayout() {
  const { viewer, loading } = useViewer();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl p-6">
        <LoadingRows rows={5} />
      </div>
    );
  }
  if (!isAdmin(viewer)) return <Navigate to="/portal" replace />;

  const matched = Object.keys(titles)
    .filter((key) => pathname === key || pathname.startsWith(`${key}/`))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <AppShell
      items={items}
      title={matched ? (titles[matched] ?? "Administration") : "Administration"}
      subtitle="Aurora Media AB · administration"
    >
      <Outlet />
    </AppShell>
  );
}
