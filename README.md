# Aurora Care Portal

Build a production-quality MVP called **Aurora Care** for Aurora Media AB. This is a Swedish WordPress maintenance/managed-care product that commercializes an existing self-hosted WPMgr instance without copying or vendoring WPMgr code. The upstream WPMgr control plane is AGPL-3.0; treat it as a separate service and interact only through a clean adapter/API boundary. Do not create a derivative fork in this app.

PRIMARY BUSINESS GOAL
Sell recurring WordPress care plans with very low owner time. The app should be good enough to demo to customers immediately and later connect to a self-hosted WPMgr server.

BRAND/UI
Swedish-first. Premium B2B feel, calm, trustworthy, modern, not flashy. Use Aurora Care name and Aurora Media AB as provider. Responsive mobile/desktop. Accessible. Use shadcn/ui/Tailwind. No lorem ipsum.

CORE FLOWS
1. Public marketing site with hero, benefits, plan comparison, FAQ, CTA.
2. Pricing plans:
   - Bas 499 kr/mån: uptime, weekly backups, safe updates, monthly report.
   - Care 899 kr/mån: daily backups, uptime/security monitoring, managed updates, recovery support, monthly report.
   - Care+ 1 490 kr/mån: everything above + priority support, staging/pre-update checks, performance/security review, quarterly improvement recommendations.
   Prices configurable in admin, not hard-coded only.
3. Admin dashboard for Aurora Media:
   - customers
   - sites
   - plan/status
   - uptime/SSL/backup/update/security summaries
   - incidents and tasks
   - monthly report status
   - renewal/MRR overview
4. Client portal:
   - their sites only
   - current health status
   - backup freshness
   - pending/applied updates
   - security findings
   - uptime history summary
   - monthly report history
   - support request form
5. Site onboarding wizard:
   - customer
   - domain
   - WordPress admin URL
   - plan
   - WPMgr site/enrollment identifiers or connection placeholder
   - onboarding checklist
6. Maintenance reports: printable/shareable monthly report with uptime, updates completed, backups, incidents, security, performance notes, actions next month.
7. Commercial dashboard: MRR, customers by plan, sites healthy/attention/critical, overdue reports, open incidents.

DATA MODEL
Use Supabase/Postgres. Tables for profiles/organizations/customers/sites/plans/subscriptions(or billing status), incidents, maintenance_events, reports, support_requests, integration_connections, audit_log. Enforce RLS so client users only see their own organization/sites. Aurora admin sees all. Seed a convincing demo customer + 3 demo sites.

WPMGR INTEGRATION ARCHITECTURE
Create a server-side adapter interface called WpmgrAdapter. Support environment variables for WPMGR_BASE_URL and WPMGR_API_TOKEN/credential placeholder. Do not expose secrets client-side. Build connector health-test UI and a read-only sync job/function shell for site health, uptime, backups, updates, security and incidents. If exact upstream API endpoints are not known, do NOT invent irreversible calls; isolate endpoint mapping in one adapter module and include a clear TODO/contract. The UI must work in DEMO MODE using seeded data until a real WPMgr endpoint is configured.

SAFETY
No update/restore/destructive WordPress action from Aurora Care v0.1. Read-only operational visibility first. Action buttons for future updates/backups must be disabled or approval-gated placeholders.

BILLING
Prepare Stripe-ready architecture and pricing CTAs, but do not require live Stripe secrets to demo. Add billing state fields and a server-side checkout abstraction. No fake successful payments.

ANALYTICS/SEO
Public pages should have excellent metadata, schema where appropriate, sitemap/robots-ready structure and conversion tracking hooks.

KIMI/AGENTSWARM HANDOFF
Create `/docs/KIMI_HANDOFF.md` containing exact tasks for Kimi/AgentSwarm to take over: upstream WPMgr API mapping, integration contract tests, security review, RLS review, billing implementation, E2E tests, Swedish copy QA. Also create `/docs/ACCEPTANCE_CRITERIA.md` with machine-verifiable done conditions. Workflow: DEFINE DONE -> IMPLEMENT -> TEST -> FIX -> RETEST -> VERIFY. No agent-finished=done.

QUALITY
Add tests for core RBAC/RLS-sensitive logic where practical, empty/loading/error states, and realistic seeded demo data. Avoid overengineering. Ship a clean v0.1 that can be sold/demoed before full WPMgr connectivity.

At the end, summarize what works, what is demo-mode, and the exact next credential/infrastructure step for a live WPMgr integration.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c985f148-d546-4561-b171-316711af1127).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
