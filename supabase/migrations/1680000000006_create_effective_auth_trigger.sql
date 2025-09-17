-- Create a reliable auth.users -> public.users sync trigger
-- This script will DROP any existing trigger/function named
-- trg_sync_auth_user / handle_auth_user_change, then create a robust
-- trigger function and attach it to auth.users.
-- Run in Supabase SQL Editor as a project Owner or role with permission to create functions/triggers.

-- Remove old trigger(s) if present
DROP TRIGGER IF EXISTS trg_sync_auth_user ON auth.users;
DROP TRIGGER IF EXISTS trg_sync_auth_user ON public.users;

-- Remove old function if present
DROP FUNCTION IF EXISTS public.handle_auth_user_change();

-- Create robust trigger function
CREATE OR REPLACE FUNCTION public.handle_auth_user_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  payload jsonb;
  meta jsonb;
  username text;
  avatar_url text;
  identities jsonb;
  github_id integer;
  created timestamptz;
BEGIN
  -- Safely convert NEW to jsonb
  payload := row_to_json(NEW)::jsonb;

  -- Support multiple metadata fields across Supabase versions
  meta := COALESCE(payload -> 'user_metadata', payload -> 'raw_user_meta_data', '{}'::jsonb);

  -- Try common metadata fields
  username := COALESCE(meta ->> 'username', meta ->> 'name', meta ->> 'email');
  avatar_url := COALESCE(meta ->> 'avatar_url', meta ->> 'avatarUrl');

  -- identities may be array; try to pull first identity id
  identities := payload -> 'identities';
  IF identities IS NOT NULL AND jsonb_typeof(identities) = 'array' AND jsonb_array_length(identities) > 0 THEN
    BEGIN
      github_id := NULLIF((identities->0->>'id')::int, 0);
    EXCEPTION WHEN others THEN
      github_id := NULL;
    END;
  END IF;

  -- created_at fallback
  BEGIN
    created := (payload ->> 'created_at')::timestamptz;
  EXCEPTION WHEN others THEN
    created := now();
  END;

  -- Upsert into public.users; guard errors so auth flows don't abort
  BEGIN
    INSERT INTO public.users (id, github_id, username, avatar_url, created_at)
    VALUES (
      NEW.id,
      github_id,
      username,
      avatar_url,
      COALESCE(created, now())
    )
    ON CONFLICT (id) DO UPDATE SET
      github_id  = COALESCE(EXCLUDED.github_id, public.users.github_id),
      username   = COALESCE(EXCLUDED.username, public.users.username),
      avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url)
    ;
  EXCEPTION WHEN others THEN
    -- Log a warning, do not re-raise to avoid aborting auth transaction
    RAISE WARNING 'handle_auth_user_change upsert failed for id=%: %', NEW.id, SQLERRM;
  END;

  RETURN NULL; -- AFTER trigger returns null
END;
$$;

-- Attach trigger to auth.users for INSERT or UPDATE
CREATE TRIGGER trg_sync_auth_user
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_auth_user_change();
