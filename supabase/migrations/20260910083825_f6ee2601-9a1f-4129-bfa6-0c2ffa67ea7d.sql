-- ENUMS
CREATE TYPE public.app_role AS ENUM ('admin','client');
CREATE TYPE public.site_status AS ENUM ('active','paused','onboarding','offboarded');
CREATE TYPE public.health_status AS ENUM ('healthy','attention','critical','unknown');
CREATE TYPE public.incident_severity AS ENUM ('low','medium','high','critical');
CREATE TYPE public.incident_status AS ENUM ('open','investigating','resolved');
CREATE TYPE public.report_status AS ENUM ('draft','ready','sent','overdue');
CREATE TYPE public.subscription_status AS ENUM ('trialing','active','past_due','canceled','pending');
CREATE TYPE public.support_status AS ENUM ('new','in_progress','answered','closed');
CREATE TYPE public.connection_mode AS ENUM ('demo','live');

-- UPDATED_AT HELPER
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

-- ORGANIZATIONS
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  org_number text,
  is_provider boolean NOT NULL DEFAULT false,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  full_name text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- USER ROLES
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.current_org_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
$$;

-- new user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- organizations policies
CREATE POLICY "orgs_admin_all" ON public.organizations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "orgs_member_read" ON public.organizations FOR SELECT TO authenticated
  USING (id = public.current_org_id());

-- profiles policies
CREATE POLICY "profiles_self_read" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "profiles_admin_insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- user_roles policies
CREATE POLICY "roles_self_read" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- PLANS (public read)
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  tagline text,
  price_sek_monthly integer NOT NULL DEFAULT 0,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  stripe_price_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plans TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plans TO authenticated;
GRANT ALL ON public.plans TO service_role;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_public_read" ON public.plans FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "plans_admin_all" ON public.plans FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER plans_updated_at BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CUSTOMERS
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  contact_name text,
  contact_email text,
  contact_phone text,
  notes text,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customers_admin_all" ON public.customers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "customers_org_read" ON public.customers FOR SELECT TO authenticated
  USING (organization_id = public.current_org_id());
CREATE TRIGGER customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SITES
CREATE TABLE public.sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.plans(id) ON DELETE SET NULL,
  name text NOT NULL,
  domain text NOT NULL,
  wp_admin_url text,
  status public.site_status NOT NULL DEFAULT 'onboarding',
  health public.health_status NOT NULL DEFAULT 'unknown',
  wpmgr_site_id text,
  wpmgr_enrollment_id text,
  onboarding_checklist jsonb NOT NULL DEFAULT '[]'::jsonb,
  php_version text,
  wp_version text,
  last_backup_at timestamptz,
  last_sync_at timestamptz,
  ssl_expires_at timestamptz,
  uptime_30d numeric(5,2),
  pending_updates integer NOT NULL DEFAULT 0,
  security_findings integer NOT NULL DEFAULT 0,
  performance_score integer,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sites TO authenticated;
GRANT ALL ON public.sites TO service_role;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sites_admin_all" ON public.sites FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "sites_org_read" ON public.sites FOR SELECT TO authenticated
  USING (organization_id = public.current_org_id());
CREATE TRIGGER sites_updated_at BEFORE UPDATE ON public.sites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- BILLING STATE (subscriptions)
CREATE TABLE public.billing_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  site_id uuid REFERENCES public.sites(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.plans(id) ON DELETE SET NULL,
  status public.subscription_status NOT NULL DEFAULT 'pending',
  mrr_sek integer NOT NULL DEFAULT 0,
  current_period_start date,
  current_period_end date,
  renewal_date date,
  stripe_customer_id text,
  stripe_subscription_id text,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.billing_state TO authenticated;
GRANT ALL ON public.billing_state TO service_role;
ALTER TABLE public.billing_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "billing_admin_all" ON public.billing_state FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "billing_org_read" ON public.billing_state FOR SELECT TO authenticated
  USING (organization_id = public.current_org_id());
CREATE TRIGGER billing_updated_at BEFORE UPDATE ON public.billing_state FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- INCIDENTS
CREATE TABLE public.incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  severity public.incident_severity NOT NULL DEFAULT 'low',
  status public.incident_status NOT NULL DEFAULT 'open',
  opened_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.incidents TO authenticated;
GRANT ALL ON public.incidents TO service_role;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "incidents_admin_all" ON public.incidents FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "incidents_org_read" ON public.incidents FOR SELECT TO authenticated
  USING (organization_id = public.current_org_id());
CREATE TRIGGER incidents_updated_at BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- MAINTENANCE EVENTS
CREATE TABLE public.maintenance_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  title text NOT NULL,
  detail text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'demo',
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.maintenance_events TO authenticated;
GRANT ALL ON public.maintenance_events TO service_role;
ALTER TABLE public.maintenance_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_admin_all" ON public.maintenance_events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "events_org_read" ON public.maintenance_events FOR SELECT TO authenticated
  USING (organization_id = public.current_org_id());

-- REPORTS
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  period_month date NOT NULL,
  status public.report_status NOT NULL DEFAULT 'draft',
  uptime_pct numeric(5,2),
  updates_applied integer NOT NULL DEFAULT 0,
  backups_completed integer NOT NULL DEFAULT 0,
  incidents_count integer NOT NULL DEFAULT 0,
  security_notes text,
  performance_notes text,
  next_actions text,
  summary text,
  sent_at timestamptz,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (site_id, period_month)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_admin_all" ON public.reports FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "reports_org_read" ON public.reports FOR SELECT TO authenticated
  USING (organization_id = public.current_org_id());
CREATE TRIGGER reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SUPPORT REQUESTS
CREATE TABLE public.support_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  site_id uuid REFERENCES public.sites(id) ON DELETE SET NULL,
  created_by uuid,
  subject text NOT NULL,
  message text NOT NULL,
  priority public.incident_severity NOT NULL DEFAULT 'low',
  status public.support_status NOT NULL DEFAULT 'new',
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_requests TO authenticated;
GRANT ALL ON public.support_requests TO service_role;
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "support_admin_all" ON public.support_requests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "support_org_read" ON public.support_requests FOR SELECT TO authenticated
  USING (organization_id = public.current_org_id());
CREATE POLICY "support_org_insert" ON public.support_requests FOR INSERT TO authenticated
  WITH CHECK (organization_id = public.current_org_id() AND created_by = auth.uid());
CREATE TRIGGER support_updated_at BEFORE UPDATE ON public.support_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- INTEGRATION CONNECTIONS
CREATE TABLE public.integration_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'wpmgr',
  label text NOT NULL,
  base_url text,
  mode public.connection_mode NOT NULL DEFAULT 'demo',
  status text NOT NULL DEFAULT 'not_configured',
  last_test_at timestamptz,
  last_test_message text,
  last_sync_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.integration_connections TO authenticated;
GRANT ALL ON public.integration_connections TO service_role;
ALTER TABLE public.integration_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "integrations_admin_all" ON public.integration_connections FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER integrations_updated_at BEFORE UPDATE ON public.integration_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AUDIT LOG
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  action text NOT NULL,
  entity text,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_admin_read" ON public.audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "audit_authenticated_insert" ON public.audit_log FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid());

CREATE INDEX idx_sites_org ON public.sites(organization_id);
CREATE INDEX idx_sites_customer ON public.sites(customer_id);
CREATE INDEX idx_incidents_site ON public.incidents(site_id);
CREATE INDEX idx_events_site ON public.maintenance_events(site_id);
CREATE INDEX idx_reports_site ON public.reports(site_id);