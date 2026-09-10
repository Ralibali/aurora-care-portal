import { describe, expect, it } from "vitest";

import {
  canRunDestructiveAction,
  canViewOrganization,
  canViewSite,
  homePathForViewer,
  isAdmin,
  isClient,
  type Viewer,
} from "@/lib/access";

const admin: Viewer = { userId: "u1", roles: ["admin"], organizationId: "org-aurora" };
const client: Viewer = { userId: "u2", roles: ["client"], organizationId: "org-a" };
const orphan: Viewer = { userId: "u3", roles: ["client"], organizationId: null };

describe("roles", () => {
  it("identifies an admin", () => {
    expect(isAdmin(admin)).toBe(true);
    expect(isClient(admin)).toBe(false);
  });

  it("identifies a client", () => {
    expect(isClient(client)).toBe(true);
    expect(isAdmin(client)).toBe(false);
  });

  it("treats a missing viewer as unprivileged", () => {
    expect(isAdmin(null)).toBe(false);
    expect(isClient(undefined)).toBe(false);
  });
});

describe("organisation scoping", () => {
  it("lets an admin see any organisation", () => {
    expect(canViewOrganization(admin, "org-a")).toBe(true);
    expect(canViewOrganization(admin, "org-b")).toBe(true);
  });

  it("lets a client see only their own organisation", () => {
    expect(canViewOrganization(client, "org-a")).toBe(true);
    expect(canViewOrganization(client, "org-b")).toBe(false);
  });

  it("denies a client with no organisation", () => {
    expect(canViewOrganization(orphan, "org-a")).toBe(false);
  });

  it("denies signed-out visitors", () => {
    expect(canViewOrganization(null, "org-a")).toBe(false);
  });

  it("scopes sites the same way", () => {
    expect(canViewSite(client, { organization_id: "org-a" })).toBe(true);
    expect(canViewSite(client, { organization_id: "org-b" })).toBe(false);
    expect(canViewSite(client, null)).toBe(false);
  });
});

describe("v0.1 safety", () => {
  it("never allows destructive WordPress actions", () => {
    expect(canRunDestructiveAction()).toBe(false);
  });
});

describe("landing route", () => {
  it("sends admins to admin, clients to the portal and guests to auth", () => {
    expect(homePathForViewer(admin)).toBe("/admin");
    expect(homePathForViewer(client)).toBe("/portal");
    expect(homePathForViewer(null)).toBe("/auth");
  });
});
