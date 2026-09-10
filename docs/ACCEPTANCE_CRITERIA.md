# Aurora Care v0.1 – Acceptance Criteria

Each item is machine-verifiable. A task is done only when its check passes in a clean run.

## A. Build and static quality

- A1 `npm run build` exits 0 with no TypeScript or route-generation errors.
- A2 `npx tsgo` (or `tsc --noEmit`) reports 0 errors.
- A3 `npm run lint` exits 0.
- A4 `npx vitest run` exits 0 with all tests passing.

## B. Schema and access control

- B1 Every table listed in `docs/KIMI_HANDOFF.md` Task 4 exists with `rowsecurity = true`
      (`select relname, relrowsecurity from pg_class where relnamespace = 'public'::regnamespace`).
- B2 Every public table has explicit `GRANT`s for the roles its policies allow.
- B3 As a client user, `select count(*) from sites` returns only rows where
      `organization_id = current_org_id()`.
- B4 As `anon`, `select * from sites`, `reports`, `customers`, `billing_state`, `support_requests`
      and `audit_log` return 0 rows / permission denied. `select * from plans` returns active plans.
- B5 A client user's `insert` into any table other than `support_requests` fails.
- B6 The database linter reports no ERROR-level finding; every WARN is either fixed or recorded
      with a written justification.

## C. Demo data

- C1 At least 1 demo customer and 3 demo sites exist with `is_demo = true`.
- C2 The 3 demo sites cover health `healthy`, `attention` and `critical`.
- C3 Every demo row renders a visible "DEMO" marker in the UI.
- C4 No demo domain resolves to a real customer site (`.example` TLD only).

## D. Pricing

- D1 `plans` contains `bas` 499, `care` 899, `care-plus` 1490 (SEK/month, `is_active = true`).
- D2 `/priser` and the homepage render prices read from the database, not hard-coded literals
      (changing `price_sek_monthly` changes the rendered price without a code change).

## E. Routes and flows

- E1 Every route referenced by a `Link`/`navigate` resolves (no 404, no router type error).
- E2 `/`, `/tjanster`, `/priser`, `/vanliga-fragor`, `/kontakt` render server-side with a unique
      `<title>` and meta description, and are reachable while signed out.
- E3 `/admin/*` redirects a non-admin to `/portal`; unauthenticated users land on `/auth`.
- E4 The onboarding wizard creates a `sites` row with `status = 'onboarding'` and a stored
      checklist, then navigates to that site's detail page.
- E5 The support form inserts a `support_requests` row with `created_by = auth.uid()` and the
      submitter's `organization_id`; the row appears in the client's own list and in admin support.
- E6 `/rapport/$reportId` renders uptime, updates, backups, incidents and the four note sections,
      and prints to one clean document with navigation hidden.
- E7 Every data view has a distinct loading, empty and error state.

## F. WPMgr boundary

- F1 No file in this repository contains copied WPMgr source code.
- F2 `WPMGR_BASE_URL` / `WPMGR_API_TOKEN` appear only in server-side code paths; grepping the
      client bundle for them returns nothing.
- F3 With no WPMgr configuration present, "Testa anslutning" returns `mode: "demo"` and makes no
      outbound network request.
- F4 The adapter defines only GET operations; no method name or endpoint implies mutation.
- F5 `canRunDestructiveAction()` returns `false` and all WordPress action buttons render disabled.

## G. Billing

- G1 With no Stripe secret configured, checkout returns an explicit "not configured" result and no
      success state is shown to the user.
- G2 No code path marks a subscription active without a verified Stripe webhook.

## H. Accessibility and responsiveness

- H1 Keyboard-only navigation reaches every interactive control; visible focus is present.
- H2 Layouts render without horizontal scroll at 360 px, 768 px and 1440 px.
- H3 All form fields have associated labels; error messages are announced (`role="alert"`).
