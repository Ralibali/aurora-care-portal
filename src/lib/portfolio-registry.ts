export type PortfolioKind = "aurora" | "vertical" | "venture" | "operation" | "client" | "internal";
export type PortfolioStage = "live" | "pilot" | "build" | "hold" | "support";

export interface PortfolioProject {
  id: string;
  name: string;
  kind: PortfolioKind;
  stage: PortfolioStage;
  destination: string;
  publicUrl?: string;
  note: string;
}

export const PORTFOLIO_KIND_LABEL: Record<PortfolioKind, string> = {
  aurora: "Aurora-plattform",
  vertical: "Branschprodukt",
  venture: "Egen produkt",
  operation: "Egen verksamhet",
  client: "Kundprojekt",
  internal: "Internt/stöd",
};

export const PORTFOLIO_STAGE_LABEL: Record<PortfolioStage, string> = {
  live: "Live",
  pilot: "Pilot",
  build: "Byggs",
  hold: "Pausad/privat",
  support: "Stödprojekt",
};

/** Internt register över alla projekt som inventerades i Aurora Medias Lovable-workspace 2026-09-13. */
export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: "2327e44d-6ed4-4f0f-bc14-f8f5fabd7c91",
    name: "Aurora Media",
    kind: "aurora",
    stage: "live",
    destination: "Publik huvudsajt och kommersiellt paraply",
    publicUrl: "https://auroramedia.se",
    note: "Visar erbjudanden, produkter och verifierade case.",
  },
  {
    id: "c985f148-d546-4561-b171-316711af1127",
    name: "Aurora Care",
    kind: "aurora",
    stage: "live",
    destination: "Gemensam kund- och kontrollportal",
    note: "Sajtdrift, rapporter, support, accessibility och consent.",
  },
  {
    id: "4e4f76de-f018-413b-a45d-aa9489d356fc",
    name: "Aurora Connect",
    kind: "aurora",
    stage: "pilot",
    destination: "Modul i Aurora-erbjudandet",
    note: "AI-receptionist med vertikala samtalsflöden.",
  },
  {
    id: "7d4218ea-cdf0-40cf-b8aa-13c6f75a9e24",
    name: "Aurora Local Boost",
    kind: "aurora",
    stage: "pilot",
    destination: "Modul i Aurora Care",
    note: "Lokal SEO och återkommande synlighetsarbete.",
  },
  {
    id: "6ab955f8-87dd-41a6-a730-f7f231c63933",
    name: "Aurora Sight",
    kind: "aurora",
    stage: "pilot",
    destination: "Modul i Aurora Care",
    note: "Mätning och uppföljning av synlighet i AI-sök.",
  },
  {
    id: "955c8b28-1e52-4079-a2a0-393deb7ad5a2",
    name: "Aurora Transport",
    kind: "vertical",
    stage: "live",
    destination: "Separat branschplattform",
    publicUrl: "https://auroratransport.se",
    note: "Behåller operativ logik och datagräns; säljs under Aurora Media.",
  },
  {
    id: "55e31e54-bdf8-41f2-9388-66021b64586a",
    name: "StayBoost",
    kind: "vertical",
    stage: "live",
    destination: "Separat hospitality-plattform",
    publicUrl: "https://stayboost-sverige.lovable.app",
    note: "Gästkommunikation, incheckning och merförsäljning.",
  },
  {
    id: "e8ead20d-cf85-46ad-afdc-fcac28b0dfb1",
    name: "Updro",
    kind: "venture",
    stage: "live",
    destination: "Separat marknadsplats",
    publicUrl: "https://updro.se",
    note: "Matchar företag med digitala byråer.",
  },
  {
    id: "e572a5da-5c0a-43f5-8c2c-8180db94b0ef",
    name: "Cykelhjälpen",
    kind: "venture",
    stage: "live",
    destination: "Separat marknadsplats",
    publicUrl: "https://cykelhjalpen.lovable.app",
    note: "Matchar cykelägare med lokala verkstäder.",
  },
  {
    id: "f0c63bdf-2baf-4795-b008-16d49fc7d8ae",
    name: "Hönsgården",
    kind: "venture",
    stage: "live",
    destination: "Separat konsumentprodukt",
    publicUrl: "https://honsgarden.se",
    note: "Flockhantering, abonnemang och återkommande skötsel.",
  },
  {
    id: "8e4043da-e9a3-446e-aed4-b8fb4a29fa17",
    name: "Agility Companion",
    kind: "venture",
    stage: "live",
    destination: "Separat konsumentprodukt",
    publicUrl: "https://agilitymanager.se",
    note: "Träningslogg och tävlingsresultat för agility.",
  },
  {
    id: "57180308-833a-4411-a64b-9d965797edb1",
    name: "Odlingsboken",
    kind: "venture",
    stage: "live",
    destination: "Separat konsumentprodukt",
    publicUrl: "https://garden-magic-bloom.lovable.app",
    note: "Odlingsdagbok, planering och AI-stöd.",
  },
  {
    id: "f19a8ea0-7fa0-4bbb-8761-bb6eb3700748",
    name: "Göta Kanal Glamping",
    kind: "operation",
    stage: "live",
    destination: "Egen verksamhet och StayBoost-labb",
    publicUrl: "https://goglampingsweden.se",
    note: "Operativ glampingverksamhet; ska inte blandas ihop med StayBoost-produkten.",
  },
  {
    id: "8c1f9086-3850-43e0-9823-72e7ff9b1692",
    name: "Ljungsbro Winter Planner",
    kind: "client",
    stage: "live",
    destination: "Kund-/föreningsprojekt under Arbete",
    publicUrl: "https://bk-ljungsbro-vinterplaneraren-2026-27.lovable.app",
    note: "Planering av vintertider för BK Ljungsbro.",
  },
  {
    id: "c65f5dbf-cd56-4678-96d6-5be810085b4c",
    name: "Viriditas",
    kind: "client",
    stage: "live",
    destination: "Kundcase under Arbete",
    publicUrl: "https://viriditasmassage.se",
    note: "Webbnärvaro för massageverksamhet i Uddevalla.",
  },
  {
    id: "5e6d2a79-a6a6-4659-85e3-94260afa30be",
    name: "Happy Paws",
    kind: "client",
    stage: "live",
    destination: "Kundcase under Arbete",
    publicUrl: "https://doggy-digi-dream.lovable.app",
    note: "Webb och e-handel för hundträning.",
  },
  {
    id: "50899e82-afd4-40a1-8f88-88263dc4376a",
    name: "Slottstornet",
    kind: "client",
    stage: "build",
    destination: "Kundcase när leveransen är verifierad",
    note: "Webbplatsförnyelse; inte publicerad i projektregistret.",
  },
  {
    id: "7002fcbc-99e4-42b8-b9b6-17fcdf26a250",
    name: "Daranyi Barnpsykiatri",
    kind: "client",
    stage: "build",
    destination: "Kundcase efter godkänd lansering",
    note: "Privat barnpsykiatrisk kliniksajt i Linköping.",
  },
  {
    id: "01730467-c0cd-4649-b635-69d32d51dd7e",
    name: "Strukturera Admin",
    kind: "venture",
    stage: "pilot",
    destination: "Produktinkubator",
    note: "Admin-as-a-service; valideras innan publik lansering.",
  },
  {
    id: "5a3cd62a-2a69-46a9-a11c-39c258d020ba",
    name: "Debt-Free Path",
    kind: "internal",
    stage: "hold",
    destination: "Privat verktyg",
    publicUrl: "https://debt-away.lovable.app",
    note: "Ska inte marknadsföras eller kopplas publikt utan nytt ägarbeslut.",
  },
  {
    id: "0017f8d3-043d-4fc6-a907-4a7b0068a4ed",
    name: "StayBoost språkgranskning",
    kind: "internal",
    stage: "support",
    destination: "Stödprojekt till StayBoost",
    note: "Ingen separat produkt eller publik marknadsföring.",
  },
  {
    id: "5f99b149-7752-4d03-8d06-dacae6bfa21c",
    name: "Göta Kanal patch verification",
    kind: "internal",
    stage: "support",
    destination: "Verifieringskopia",
    note: "Tekniskt stödprojekt, inte en egen produkt.",
  },
  {
    id: "cced33b5-fd3e-47ba-9dd5-0086e58cc58a",
    name: "Online Store Builder",
    kind: "internal",
    stage: "hold",
    destination: "Återanvändbar prototyp",
    note: "Behåll internt tills efterfrågan och produktgräns är verifierad.",
  },
  {
    id: "4d77b70d-c18b-4727-9aec-dac50cb0acaf",
    name: "Bigården",
    kind: "internal",
    stage: "support",
    destination: "Tidigare förbättrings-/supportprojekt",
    note: "Ingen separat publik produkt i nuvarande form.",
  },
  {
    id: "c4e840a8-6fe7-4973-9861-b26e2f1f7065",
    name: "Offer Design Magic",
    kind: "internal",
    stage: "support",
    destination: "Internt leveransverktyg",
    note: "Återanvänds i offertflöden, inte som fristående varumärke.",
  },
];

export const lovableEditorUrl = (id: string) => `https://lovable.dev/projects/${id}`;
