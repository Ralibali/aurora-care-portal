-- RLS restricts rows, but the organization column is also an access boundary.
-- Preserve admin assignment and trusted provisioning while protecting clients.
CREATE OR REPLACE FUNCTION public.protect_profile_tenant()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF current_user IN ('anon', 'authenticated')
    AND NOT public.has_role(auth.uid(), 'admin')
    AND (NEW.id IS DISTINCT FROM OLD.id
      OR NEW.organization_id IS DISTINCT FROM OLD.organization_id
      OR NEW.email IS DISTINCT FROM OLD.email) THEN
    RAISE EXCEPTION 'Profile identity can only be changed by an administrator'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.protect_profile_tenant() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS protect_profile_tenant ON public.profiles;
CREATE TRIGGER protect_profile_tenant BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_tenant();
