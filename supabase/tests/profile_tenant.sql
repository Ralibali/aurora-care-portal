-- Execute in a transaction after migrations, then roll back. No customer rows
-- are written: the real trigger is exercised against a temporary profile.
CREATE TEMP TABLE profile_guard_test (LIKE public.profiles INCLUDING DEFAULTS);
GRANT SELECT, UPDATE ON profile_guard_test TO authenticated;
INSERT INTO profile_guard_test (id, email, full_name)
VALUES ('d63c381f-3cc6-4bfd-89a9-b4326c3a9211', 'test@example.invalid', 'Before');
CREATE TRIGGER profile_guard_test BEFORE UPDATE ON profile_guard_test
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_tenant();
SELECT set_config('request.jwt.claim.sub', 'd63c381f-3cc6-4bfd-89a9-b4326c3a9211', true);
SET LOCAL ROLE authenticated;
DO $$
BEGIN
  BEGIN
    UPDATE pg_temp.profile_guard_test
    SET organization_id = '056eece8-3c9e-4b81-a345-e4256a6357a8';
    RAISE EXCEPTION 'Client was allowed to switch tenant';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    UPDATE pg_temp.profile_guard_test SET email = 'other@example.invalid';
    RAISE EXCEPTION 'Client was allowed to rewrite verified email';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  UPDATE pg_temp.profile_guard_test SET full_name = 'After';
  IF NOT EXISTS (SELECT 1 FROM pg_temp.profile_guard_test WHERE full_name = 'After') THEN
    RAISE EXCEPTION 'Display-name update failed';
  END IF;
END;
$$;
RESET ROLE;
