# Aurora Care – v0.1

Svenskspråkig tjänst för WordPress-underhåll som Aurora Media AB kan sälja och demonstrera direkt. Allt operativt innehåll är läsbart – inga uppdaterings- eller återställningsknappar som gör något skarpt.

## Vad som byggs

### Publik webbplats (svenska)
- Startsida: hero, fördelar, hur det fungerar, planjämförelse, FAQ, kontakt-CTA
- Egna sidor för Tjänster, Priser, Vanliga frågor, Kontakt
- Priser hämtas från databasen, inte hårdkodade
- Titlar, beskrivningar, delningsbilder, strukturerad data, robots/sitemap

### Inloggning och roller
- E-post/lösenord via Lovable Cloud
- Två roller: Aurora-admin (ser allt) och kundanvändare (ser bara sin organisation)
- Roller i separat tabell, åtkomstregler i databasen

### Adminpanel (Aurora Media)
- Översikt: MRR, kunder per plan, sajter frisk/varning/kritisk, försenade rapporter, öppna ärenden
- Kunder, sajter, planer och abonnemangsstatus
- Drift: uppetid, SSL, backup, uppdateringar, säkerhet per sajt
- Incidenter, uppgifter, månadsrapporternas status
- Planredigering (namn, pris, funktioner)
- Anslutningstest mot WPMgr-servern + synkstatus

### Kundportal
- Egna sajter, hälsostatus, backup-färskhet, uppdateringar, säkerhetsfynd
- Uppetidshistorik och rapportarkiv
- Supportformulär

### Onboarding-guide
Steg för kund, domän, WP-adminadress, plan, WPMgr-identifierare (kan lämnas tom) och checklista.

### Månadsrapport
Utskrifts- och delningsvänlig rapportsida med uppetid, utförda uppdateringar, backuper, incidenter, säkerhet, prestanda och planerade åtgärder.

## Teknisk lösning

- Lovable Cloud (Postgres) med tabeller: organizations, profiles, user_roles, customers, sites, plans, subscriptions, incidents, maintenance_events, reports, support_requests, integration_connections, audit_log
- RLS: kundanvändare läser endast rader kopplade till sin organisation; admin via `has_role()`-funktion; alla nya tabeller får GRANT
- Migration innehåller seed: demokund med 3 sajter, uppetidshistorik, incidenter, rapporter
- `WpmgrAdapter` som ett enda servermodul-interface (`src/lib/wpmgr/`): `testConnection`, `getSiteHealth`, `getUptime`, `getBackups`, `getUpdates`, `getSecurity`, `getIncidents`. Läser `WPMGR_BASE_URL` / `WPMGR_API_TOKEN` inuti serverfunktioner. Utan konfiguration används DEMO-läge mot seedad data. Endpointmappning samlad på ett ställe med tydlig TODO-kontrakt; inga skrivande anrop.
- Stripe-förberedd struktur: billing-fält i subscriptions + serverfunktion `createCheckoutSession` som returnerar tydligt "ej konfigurerad" tills nyckel finns. Inga låtsasbetalningar.
- Konverteringshändelser via en liten `track()`-hook på CTA:er
- Tester (vitest) för rollogik och planprissättning

### Dokument
- `docs/KIMI_HANDOFF.md` – uppgifter: WPMgr-API-mappning, kontraktstester, säkerhetsgranskning, RLS-granskning, betalningar, E2E, språkgranskning
- `docs/ACCEPTANCE_CRITERIA.md` – maskinverifierbara klarkriterier

## Avgränsning i v0.1
Inga skarpa åtgärder mot WordPress. Knappar för uppdatering/backup är avstängda platshållare med förklaring.
