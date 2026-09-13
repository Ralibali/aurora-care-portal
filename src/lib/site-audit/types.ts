export type AuditKind = "accessibility" | "consent";
export type ScanStatus = "queued" | "running" | "completed" | "failed";
export type FindingSeverity = "info" | "minor" | "moderate" | "serious" | "critical";
export type FindingStatus = "open" | "accepted" | "resolved" | "ignored";

export type AuditSummary = {
  score?: number;
  totals?: Partial<Record<FindingSeverity, number>>;
  findingCount?: number;
  assetCount?: number;
  automatedCoverage?: string;
  manualReviewRequired?: boolean;
  browserVerificationRequired?: boolean;
  consentPlatformDetected?: boolean;
};

export type SiteScan = {
  id: string;
  organization_id: string;
  site_id: string;
  kind: AuditKind;
  status: ScanStatus;
  engine: string;
  engine_version: string | null;
  page_url: string;
  pages_scanned: number;
  summary: AuditSummary;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
};

export type SiteFinding = {
  id: string;
  site_id: string;
  scan_id: string;
  kind: AuditKind;
  rule_id: string;
  severity: FindingSeverity;
  status: FindingStatus;
  title: string;
  description: string;
  page_url: string;
  selector: string | null;
  fix_hint: string | null;
  help_url: string | null;
  manual_review_required: boolean;
  evidence: Record<string, unknown>;
  last_seen_at: string;
  resolved_at: string | null;
};

export type ConsentAsset = {
  id: string;
  scan_id: string;
  site_id: string;
  asset_type: "cookie" | "script" | "pixel" | "storage" | "request";
  name: string;
  provider: string | null;
  category: "necessary" | "analytics" | "marketing" | "preferences" | "unclassified";
  source_url: string | null;
  detected_before_consent: boolean;
  confidence: number;
};
