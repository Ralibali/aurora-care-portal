# KIMI / AgentSwarm Handoff – Aurora Care v0.1

Provider: Aurora Media AB. Product: Aurora Care (Swedish WordPress managed-care).
Stack: TanStack Start + React 19 + Tailwind/shadcn + Supabase/Postgres (RLS).

**Non-negotiable constraints**

- The upstream WPMgr control plane is AGPL-3.0 and is a **separate service**. Do not vendor,
  copy or fork its code into this repository. All interaction goes through
  `src/lib/wpmgr/contract.ts` (interface) and `src/lib/wpmgr/wpmgr.server.ts` (implementations).
- v0.1 is **read-only** towards WordPress/WPMgr. No update, restore, or destructive action.
  `canRunDestructiveAction()` in `src/lib/access.ts` returns `false` and must stay that way
  until an approval-gated flow with an audit trail is designed and reviewed.
- Secrets (`WPMGR_BASE_URL`, `WPMGR_API_TOKEN`, Stripe keys) are server-side only.
  They are read inside server-function handlers, never at module scope, never in client code.

## Task 1 – Upstream WPMgr API mapping

- Verify every path in `WPMGR_ENDPOINT_MAP` against the real self-hosted instance.
- Confirm auth scheme (bearer token vs. signed request) and required headers.
- Confirm the stable site identifier: is `wpmgr_site_id` or `wpmgr_enrollment_id` the join key?
- Document response shapes and map them to the typed results in `contract.ts`.
- Set `WPMGR_UNVERIFIED_CONTRACT = false` only after the mapping is proven.
- Deliverable: a mapping table (Aurora field → WPMgr field → endpoint) plus updated `contract.ts`.

## Task 2 – Integration contract tests

- Record fixtures from a real WPMgr instance (redacted) and add adapter tests asserting
  `httpAdapter` parses them into `contract.ts` types without throwing.
- Add failure-path tests: 401, 404, 500, timeout, malformed JSON. The adapter must degrade to a
  typed empty/`null` result, never crash a route.
- Assert with a static test that no adapter method issues a non-GET request.

## Task 3 – Security review

- Confirm no server-only module (`*.server.ts`, `client.server.ts`) reaches a client bundle.
- Confirm the admin assertion in `wpmgr.functions.ts` is enforced server-side on every
  privileged function (never trusting client-side role state).
- Review the two `SECURITY DEFINER` helpers (`has_role`, `current_org_id`): they are required by
  RLS policies and are intentionally executable by `authenticated`. Either document this as an
  accepted exception or narrow it, then re-run the database linter and record the result.
- Review lead/support inputs for injection and abuse; add rate limiting on the public lead endpoint.

## Task 4 – RLS review

For every table (`organizations`, `profiles`, `user_roles`, `customers`, `sites`, `billing_state`,
`incidents`, `maintenance_events`, `reports`, `support_requests`, `integration_connections`,
`audit_log`, `plans`, `leads`) prove with SQL as three roles (`anon`, client user, admin user):

- a client user sees **only** rows for their own `organization_id`;
- `anon` sees only active `plans`;
- clients cannot write anything except their own `support_requests`;
- `audit_log` is insert-only for authenticated users and readable only by admins.

Deliverable: a repeatable SQL test script and its output.

## Task 5 – Billing implementation

- `src/lib/billing.functions.ts` returns an explicit "not configured" result today. Implement real
  Stripe Checkout: price IDs from `plans.stripe_price_id`, customer creation, subscription webhook.
- Webhook must be a server route under `src/routes/api/public/` with signature verification before
  any write, updating `billing_state` (`status`, `current_period_*`, `renewal_date`, `mrr_sek`).
- No fake successful payments in any environment. Test mode must be visibly labelled.

## Task 6 – E2E tests

Playwright flows: public pricing → contact lead saved; admin login → overview MRR renders →
onboarding wizard creates a site → site detail shows it; client login → sees only own sites →
submits a support request → opens a monthly report; cross-tenant negative test (client B cannot
open client A's site or report by URL).

## Task 7 – Swedish copy QA

Native review of all public and in-app copy: consistent "du"-tilltal, correct terminology
(uppetid, säkerhetskopia, uppdatering, sårbarhet), correct SEK/number/date formatting via
`src/lib/format.ts`, and no English leakage. Verify all demo data stays clearly labelled DEMO.

## Workflow

DEFINE DONE → IMPLEMENT → TEST → FIX → RETEST → VERIFY.
"Agent finished" is not done. Every task closes with the machine-verifiable evidence named in
`docs/ACCEPTANCE_CRITERIA.md`.
