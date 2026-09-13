import { createClient } from "https://esm.sh/@supabase/supabase-js@2.116.0";

import { corsHeaders } from "../_shared/cors.ts";

type ScanKind = "accessibility" | "consent";
type Severity = "info" | "minor" | "moderate" | "serious" | "critical";

type Finding = {
  rule_id: string;
  severity: Severity;
  title: string;
  description: string;
  selector?: string;
  fix_hint: string;
  help_url?: string;
  manual_review_required?: boolean;
  evidence?: Record<string, unknown>;
};

type ConsentAsset = {
  asset_type: "cookie" | "script" | "pixel" | "storage" | "request";
  name: string;
  provider?: string;
  category: "necessary" | "analytics" | "marketing" | "preferences" | "unclassified";
  source_url?: string;
  detected_before_consent: boolean;
  confidence: number;
  evidence?: Record<string, unknown>;
};

const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function normaliseTarget(domain: string) {
  const candidate = /^https?:\/\//i.test(domain) ? domain : `https://${domain}`;
  const url = new URL(candidate);
  const hostname = url.hostname.toLowerCase();
  const blocked =
    hostname === "localhost" ||
    hostname.endsWith(".local") ||
    hostname === "0.0.0.0" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^169\.254\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);
  if (blocked || !["http:", "https:"].includes(url.protocol)) {
    throw new Error("Domänen kan inte granskas från den publika scannern.");
  }
  url.pathname = "/";
  url.search = "";
  url.hash = "";
  return url;
}

function count(pattern: RegExp, value: string) {
  return [...value.matchAll(pattern)].length;
}

function accessibilityFindings(html: string): Finding[] {
  const findings: Finding[] = [];
  const htmlTag = html.match(/<html\b[^>]*>/i)?.[0] ?? "";
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  const images = html.match(/<img\b[^>]*>/gi) ?? [];
  const missingAlt = images.filter((tag) => !/\balt\s*=\s*["'][^"']*["']/i.test(tag)).length;
  const inputs = html.match(/<(input|select|textarea)\b[^>]*>/gi) ?? [];
  const unnamedInputs = inputs.filter(
    (tag) => !/\b(type\s*=\s*["']hidden["']|aria-label\s*=|aria-labelledby\s*=|id\s*=)/i.test(tag),
  ).length;
  const buttons = html.match(/<button\b[^>]*>[\s\S]*?<\/button>/gi) ?? [];
  const unnamedButtons = buttons.filter(
    (tag) => !/aria-label\s*=/i.test(tag) && !tag.replace(/<[^>]+>/g, "").trim(),
  ).length;

  if (!/\blang\s*=\s*["'][a-z]{2,}/i.test(htmlTag)) {
    findings.push({
      rule_id: "html-has-lang",
      severity: "serious",
      title: "Sidans språk saknas",
      description: "HTML-elementet saknar ett giltigt lang-attribut.",
      selector: "html",
      fix_hint: 'Lägg till korrekt språk, exempelvis lang="sv", på html-elementet.',
      help_url: "https://www.w3.org/WAI/WCAG22/Understanding/language-of-page.html",
    });
  }
  if (!title) {
    findings.push({
      rule_id: "document-title",
      severity: "serious",
      title: "Sidtitel saknas",
      description: "Startsidan saknar en beskrivande title-tagg.",
      selector: "head > title",
      fix_hint: "Lägg till en unik och beskrivande sidtitel.",
      help_url: "https://www.w3.org/WAI/WCAG22/Understanding/page-titled.html",
    });
  }
  if (missingAlt > 0) {
    findings.push({
      rule_id: "image-alt",
      severity: "critical",
      title: `${missingAlt} bild${missingAlt === 1 ? "" : "er"} saknar alt-attribut`,
      description: "Bilder utan alt-attribut kan inte tolkas korrekt av hjälpmedel.",
      selector: "img:not([alt])",
      fix_hint:
        'Skriv ett relevant alt-värde för innehållsbilder och alt="" för rent dekorativa bilder.',
      help_url: "https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html",
      evidence: { count: missingAlt },
    });
  }
  if (count(/<h1\b/gi, html) === 0) {
    findings.push({
      rule_id: "page-has-heading-one",
      severity: "moderate",
      title: "Huvudrubrik saknas",
      description: "Ingen h1-rubrik hittades på sidan.",
      selector: "h1",
      fix_hint: "Lägg till en tydlig huvudrubrik som beskriver sidans huvudinnehåll.",
    });
  }
  if (unnamedInputs > 0) {
    findings.push({
      rule_id: "form-field-name",
      severity: "serious",
      title: `${unnamedInputs} formulärfält behöver kontrolleras`,
      description: "Fält utan id eller tillgängligt namn hittades i sidans HTML.",
      selector: "input, select, textarea",
      fix_hint:
        "Koppla varje fält till en synlig label eller ett korrekt aria-label/aria-labelledby.",
      manual_review_required: true,
      evidence: { count: unnamedInputs },
    });
  }
  if (unnamedButtons > 0) {
    findings.push({
      rule_id: "button-name",
      severity: "critical",
      title: `${unnamedButtons} knapp${unnamedButtons === 1 ? "" : "ar"} saknar namn`,
      description: "Tomma knappar utan aria-label hittades.",
      selector: "button",
      fix_hint: "Ge varje knapp synlig text eller ett tillgängligt namn.",
      evidence: { count: unnamedButtons },
    });
  }

  findings.push({
    rule_id: "manual-wcag-review",
    severity: "info",
    title: "Manuell WCAG-kontroll återstår",
    description:
      "Kontrast, tangentbordsflöde, fokusordning, begriplighet och skärmläsarupplevelse kan inte verifieras fullständigt automatiskt.",
    fix_hint:
      "Genomför den manuella checklistan och dokumentera resultatet innan en fullständig audit markeras klar.",
    manual_review_required: true,
  });
  return findings;
}

const TRACKERS = [
  {
    match: /googletagmanager\.com|google-analytics\.com|gtag\(/i,
    name: "Google Analytics / Tag Manager",
    provider: "Google",
    category: "analytics" as const,
  },
  {
    match: /connect\.facebook\.net|fbq\(/i,
    name: "Meta Pixel",
    provider: "Meta",
    category: "marketing" as const,
  },
  {
    match: /hotjar\.com|hj\(/i,
    name: "Hotjar",
    provider: "Hotjar",
    category: "analytics" as const,
  },
  {
    match: /clarity\.ms/i,
    name: "Microsoft Clarity",
    provider: "Microsoft",
    category: "analytics" as const,
  },
  {
    match: /doubleclick\.net|googleadservices\.com/i,
    name: "Google Ads",
    provider: "Google",
    category: "marketing" as const,
  },
];

function consentInspection(html: string, setCookie: string | null) {
  const assets: ConsentAsset[] = [];
  const hasConsentPlatform =
    /cookiebot|usercentrics|onetrust|orejime|cookieyes|consent[-_ ]mode/i.test(html);
  for (const tracker of TRACKERS) {
    if (!tracker.match.test(html)) continue;
    assets.push({
      asset_type: "script",
      name: tracker.name,
      provider: tracker.provider,
      category: tracker.category,
      detected_before_consent: !hasConsentPlatform,
      confidence: 0.9,
      evidence: { source: "initial_html" },
    });
  }
  if (setCookie) {
    for (const raw of setCookie.split(/,(?=[^;,]+=)/g)) {
      const name = raw.split("=", 1)[0]?.trim();
      if (!name) continue;
      assets.push({
        asset_type: "cookie",
        name,
        category: "unclassified",
        detected_before_consent: true,
        confidence: 0.7,
        evidence: { source: "set-cookie-response-header" },
      });
    }
  }

  const findings: Finding[] = [];
  const preConsent = assets.filter(
    (asset) => asset.detected_before_consent && asset.category !== "necessary",
  );
  if (preConsent.length > 0) {
    findings.push({
      rule_id: "non-essential-before-consent",
      severity: "serious",
      title: `${preConsent.length} möjlig tracker laddas före samtycke`,
      description:
        "Analys- eller marknadsföringsteknik verkar finnas i den första HTML-responsen utan att en samtyckesplattform kunde verifieras.",
      fix_hint:
        "Blockera icke-nödvändiga taggar tills besökaren aktivt har samtyckt och verifiera i en riktig webbläsarscan.",
      manual_review_required: true,
      evidence: { assets: preConsent.map((asset) => asset.name) },
    });
  }
  if (!hasConsentPlatform && assets.length > 0) {
    findings.push({
      rule_id: "consent-platform-not-detected",
      severity: "moderate",
      title: "Samtyckesplattform kunde inte verifieras",
      description:
        "Scannern hittade trackers men ingen tydlig consent manager i den initiala HTML-koden.",
      fix_hint: "Kontrollera banner, kategorier, återkallelse och faktisk blockering i webbläsare.",
      manual_review_required: true,
    });
  }
  if (!/privacy|integritet|cookie/i.test(html)) {
    findings.push({
      rule_id: "privacy-link-not-detected",
      severity: "minor",
      title: "Länk till integritets- eller cookieinformation hittades inte",
      description:
        "Den initiala HTML-koden saknar en tydligt identifierbar länk till integritets- eller cookieinformation.",
      fix_hint:
        "Länka tydligt till aktuell information om kakor, leverantörer, ändamål och lagringstid.",
      manual_review_required: true,
    });
  }
  return { findings, assets, hasConsentPlatform };
}

function summary(findings: Finding[], extra: Record<string, unknown> = {}) {
  const totals = findings.reduce<Record<string, number>>((acc, finding) => {
    acc[finding.severity] = (acc[finding.severity] ?? 0) + 1;
    return acc;
  }, {});
  const penalty = findings.reduce((sum, finding) => {
    return (
      sum + ({ info: 0, minor: 3, moderate: 8, serious: 15, critical: 25 }[finding.severity] ?? 0)
    );
  }, 0);
  return { score: Math.max(0, 100 - penalty), totals, findingCount: findings.length, ...extra };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return reply({ error: "Method not allowed" }, 405);

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (!serviceKey || !supabaseUrl) return reply({ error: "Server configuration missing" }, 500);

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const {
    data: { user },
    error: userError,
  } = await admin.auth.getUser(token);
  if (userError || !user) return reply({ error: "Unauthorized" }, 401);

  const { data: role } = await admin
    .from("user_roles")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (!role) return reply({ error: "Admin access required" }, 403);

  let scanId: string | null = null;
  try {
    const body = (await request.json()) as { siteId?: string; kind?: ScanKind };
    if (!body.siteId || !["accessibility", "consent"].includes(body.kind ?? "")) {
      return reply({ error: "siteId and a valid kind are required" }, 400);
    }
    const kind = body.kind as ScanKind;
    const { data: site, error: siteError } = await admin
      .from("sites")
      .select("id, organization_id, domain")
      .eq("id", body.siteId)
      .single();
    if (siteError || !site) return reply({ error: "Site not found" }, 404);

    const target = normaliseTarget(site.domain);
    const { data: scan, error: scanError } = await admin
      .from("site_scans")
      .insert({
        organization_id: site.organization_id,
        site_id: site.id,
        kind,
        status: "running",
        engine: "aurora-static-prescan",
        engine_version: "1.0.0",
        page_url: target.href,
        requested_by: user.id,
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (scanError || !scan) throw scanError ?? new Error("Scan could not be created");
    scanId = scan.id;

    const response = await fetch(target, {
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
      headers: { "User-Agent": "AuroraCareAudit/1.0 (+https://auroramedia.se/care)" },
    });
    if (!response.ok) throw new Error(`Webbplatsen svarade med HTTP ${response.status}.`);
    const html = (await response.text()).slice(0, 2_000_000);
    let findings: Finding[];
    let assets: ConsentAsset[] = [];
    let extra: Record<string, unknown> = {};
    if (kind === "accessibility") {
      findings = accessibilityFindings(html);
      extra = { automatedCoverage: "partial", manualReviewRequired: true };
    } else {
      const result = consentInspection(html, response.headers.get("set-cookie"));
      findings = result.findings;
      assets = result.assets;
      extra = {
        assetCount: assets.length,
        consentPlatformDetected: result.hasConsentPlatform,
        browserVerificationRequired: true,
      };
    }

    if (findings.length > 0) {
      const { error } = await admin.from("site_findings").insert(
        findings.map((finding) => ({
          organization_id: site.organization_id,
          site_id: site.id,
          scan_id: scan.id,
          kind,
          page_url: target.href,
          ...finding,
        })),
      );
      if (error) throw error;
    }
    if (assets.length > 0) {
      const { error } = await admin.from("consent_assets").insert(
        assets.map((asset) => ({
          organization_id: site.organization_id,
          site_id: site.id,
          scan_id: scan.id,
          ...asset,
        })),
      );
      if (error) throw error;
    }

    const completedAt = new Date().toISOString();
    const resultSummary = summary(findings, extra);
    const { error: updateError } = await admin
      .from("site_scans")
      .update({
        status: "completed",
        completed_at: completedAt,
        pages_scanned: 1,
        summary: resultSummary,
      })
      .eq("id", scan.id);
    if (updateError) throw updateError;

    await admin.from("site_audit_configs").upsert(
      {
        organization_id: site.organization_id,
        site_id: site.id,
        last_scan_at: completedAt,
      },
      { onConflict: "site_id" },
    );
    await admin.from("audit_log").insert({
      actor_id: user.id,
      actor_email: user.email,
      action: `site_${kind}_scan_completed`,
      entity: "site",
      entity_id: site.id,
      metadata: { scan_id: scan.id, page_url: target.href, ...resultSummary },
    });

    return reply({ ok: true, scanId: scan.id, kind, summary: resultSummary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scan failed";
    if (scanId) {
      await admin
        .from("site_scans")
        .update({
          status: "failed",
          error_message: message.slice(0, 500),
          completed_at: new Date().toISOString(),
        })
        .eq("id", scanId);
    }
    console.error("[run-site-audit]", error);
    return reply({ error: message }, 500);
  }
});
