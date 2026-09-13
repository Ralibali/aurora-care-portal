-- Aurora Care: integrated accessibility monitoring and consent governance.
-- Automated scans are decision support, not a legal/compliance guarantee.

create type public.care_scan_kind as enum ('accessibility', 'consent');
create type public.care_scan_status as enum ('queued', 'running', 'completed', 'failed');
create type public.care_finding_severity as enum ('info', 'minor', 'moderate', 'serious', 'critical');
create type public.care_finding_status as enum ('open', 'accepted', 'resolved', 'ignored');

create table public.site_audit_configs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  site_id uuid not null references public.sites(id) on delete cascade,
  accessibility_enabled boolean not null default true,
  consent_enabled boolean not null default true,
  scan_frequency text not null default 'monthly' check (scan_frequency in ('weekly', 'monthly', 'quarterly', 'manual')),
  next_scan_at timestamptz,
  last_scan_at timestamptz,
  consent_mode_v2 boolean not null default false,
  block_before_consent boolean not null default false,
  consent_provider text,
  policy_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id)
);

create table public.site_scans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  site_id uuid not null references public.sites(id) on delete cascade,
  kind public.care_scan_kind not null,
  status public.care_scan_status not null default 'queued',
  engine text not null,
  engine_version text,
  page_url text not null,
  pages_scanned integer not null default 0 check (pages_scanned >= 0),
  summary jsonb not null default '{}'::jsonb,
  error_message text,
  requested_by uuid references auth.users(id) on delete set null,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.site_findings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  site_id uuid not null references public.sites(id) on delete cascade,
  scan_id uuid not null references public.site_scans(id) on delete cascade,
  kind public.care_scan_kind not null,
  rule_id text not null,
  severity public.care_finding_severity not null default 'moderate',
  status public.care_finding_status not null default 'open',
  title text not null,
  description text not null,
  page_url text not null,
  selector text,
  fix_hint text,
  help_url text,
  manual_review_required boolean not null default false,
  evidence jsonb not null default '{}'::jsonb,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.consent_assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  site_id uuid not null references public.sites(id) on delete cascade,
  scan_id uuid not null references public.site_scans(id) on delete cascade,
  asset_type text not null check (asset_type in ('cookie', 'script', 'pixel', 'storage', 'request')),
  name text not null,
  provider text,
  category text not null default 'unclassified' check (category in ('necessary', 'analytics', 'marketing', 'preferences', 'unclassified')),
  source_url text,
  detected_before_consent boolean not null default false,
  confidence numeric(4,3) not null default 1 check (confidence between 0 and 1),
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.consent_versions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  site_id uuid not null references public.sites(id) on delete cascade,
  version integer not null check (version > 0),
  provider text,
  configuration jsonb not null default '{}'::jsonb,
  change_note text,
  published_by uuid references auth.users(id) on delete set null,
  published_at timestamptz not null default now(),
  unique (site_id, version)
);

create index site_scans_site_created_idx on public.site_scans(site_id, created_at desc);
create index site_findings_site_status_idx on public.site_findings(site_id, status, severity);
create index site_findings_scan_idx on public.site_findings(scan_id);
create index consent_assets_scan_idx on public.consent_assets(scan_id);
create index consent_versions_site_idx on public.consent_versions(site_id, version desc);

alter table public.site_audit_configs enable row level security;
alter table public.site_scans enable row level security;
alter table public.site_findings enable row level security;
alter table public.consent_assets enable row level security;
alter table public.consent_versions enable row level security;

revoke all on table public.site_audit_configs, public.site_scans, public.site_findings, public.consent_assets, public.consent_versions from anon, authenticated;
grant select, insert, update, delete on table public.site_audit_configs, public.site_scans, public.site_findings, public.consent_versions to authenticated;
grant select on table public.consent_assets to authenticated;
grant all on table public.site_audit_configs, public.site_scans, public.site_findings, public.consent_assets, public.consent_versions to service_role;

create policy "audit_configs_admin_all" on public.site_audit_configs for all to authenticated
  using (public.has_role((select auth.uid()), 'admin'))
  with check (public.has_role((select auth.uid()), 'admin'));
create policy "audit_configs_org_read" on public.site_audit_configs for select to authenticated
  using (organization_id = public.current_org_id());

create policy "site_scans_admin_all" on public.site_scans for all to authenticated
  using (public.has_role((select auth.uid()), 'admin'))
  with check (public.has_role((select auth.uid()), 'admin'));
create policy "site_scans_org_read" on public.site_scans for select to authenticated
  using (organization_id = public.current_org_id());

create policy "site_findings_admin_all" on public.site_findings for all to authenticated
  using (public.has_role((select auth.uid()), 'admin'))
  with check (public.has_role((select auth.uid()), 'admin'));
create policy "site_findings_org_read" on public.site_findings for select to authenticated
  using (organization_id = public.current_org_id());

create policy "consent_assets_admin_read" on public.consent_assets for select to authenticated
  using (public.has_role((select auth.uid()), 'admin'));
create policy "consent_assets_org_read" on public.consent_assets for select to authenticated
  using (organization_id = public.current_org_id());

create policy "consent_versions_admin_all" on public.consent_versions for all to authenticated
  using (public.has_role((select auth.uid()), 'admin'))
  with check (public.has_role((select auth.uid()), 'admin'));
create policy "consent_versions_org_read" on public.consent_versions for select to authenticated
  using (organization_id = public.current_org_id());

create trigger site_audit_configs_updated_at before update on public.site_audit_configs
  for each row execute function public.update_updated_at_column();
create trigger site_findings_updated_at before update on public.site_findings
  for each row execute function public.update_updated_at_column();

comment on table public.site_scans is 'Technical scan evidence. Automated results never represent a full WCAG or GDPR compliance guarantee.';
comment on column public.site_findings.manual_review_required is 'True when a human must evaluate the WCAG or consent requirement.';
