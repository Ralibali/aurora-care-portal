# Aurora Care v0.1 – roadmap

- [x] Databas: schema + RLS (organizations, profiles, user_roles, customers, sites, plans, billing_state, incidents, maintenance_events, reports, support_requests, integration_connections, audit_log, leads)
- [x] Seedad DEMO-data (tydligt märkt)
- [x] Designsystem + publik marknadssajt (start, tjänster, priser, FAQ, kontakt)
- [x] Auth (/auth) + rollhantering
- [x] Adminvy: översikt/MRR, kunder, sajter, incidenter, rapporter, support, planer, integrationer
- [x] Kundportal: sajter, sajtdetalj, rapporter, support
- [x] Onboarding-wizard
- [x] Sajtdetalj/hälsa + månadsrapport (utskriftsvänlig)
- [x] WpmgrAdapter (server-side, read-only, demo-läge)
- [x] Stripe-förberedd checkout-abstraktion (ej live)
- [x] docs/KIMI_HANDOFF.md + docs/ACCEPTANCE_CRITERIA.md
- [x] Tester (hälsa, roller, MRR/rapportfrister) – 27 tester gröna
- [x] Build/verifiering (typecheck + build OK)

## Kvar (kräver externa uppgifter – Kimi/AgentSwarm)
- [ ] Verifiera WPMgr-endpoints och aktivera live-läge (kräver WPMGR_BASE_URL + WPMGR_API_TOKEN)
- [ ] Stripe live-implementation + webhook (kräver Stripe-nycklar)
- [ ] E2E-tester och SQL-baserad RLS-bevisning
- [ ] Beslut om de två SECURITY DEFINER-hjälpfunktionerna (motivering eller åtstramning)
