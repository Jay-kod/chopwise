-- ChopWise Supabase Schema & Row Level Security (RLS) policies
-- Follows official Supabase best practices:
-- 1. Evaluates (select auth.uid()) for query-level caching
-- 2. Enforces explicit TO authenticated and ownership checks
-- 3. Grants schema & table usage for Data API exposure
-- 4. Secures triggers with explicit search_path

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure Data API roles have access to public schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- ============================================================================
-- 1. PROFILES TABLE (linked to auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  consent_at TIMESTAMPTZ,
  profile_complete BOOLEAN NOT NULL DEFAULT false,
  profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.profiles TO authenticated;

DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
CREATE POLICY "Users can read their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- Trigger to automatically create a profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, consent_at, profile_complete, profile)
  VALUES (new.id, new.email, now(), now(), false, '{}'::jsonb)
  ON CONFLICT (id) DO UPDATE
  SET consent_at = COALESCE(public.profiles.consent_at, now());
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 2. SAVED MEALS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.saved_meals (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_id TEXT NOT NULL,
  meal JSONB NOT NULL,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_meal UNIQUE (user_id, meal_id)
);

ALTER TABLE public.saved_meals ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.saved_meals TO authenticated;

DROP POLICY IF EXISTS "Users can read their own saved meals" ON public.saved_meals;
CREATE POLICY "Users can read their own saved meals"
  ON public.saved_meals FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own saved meals" ON public.saved_meals;
CREATE POLICY "Users can insert their own saved meals"
  ON public.saved_meals FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own saved meals" ON public.saved_meals;
CREATE POLICY "Users can update their own saved meals"
  ON public.saved_meals FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own saved meals" ON public.saved_meals;
CREATE POLICY "Users can delete their own saved meals"
  ON public.saved_meals FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- 3. LATEST RECOMMENDATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.latest_recs (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  meals JSONB NOT NULL,
  profile_hash TEXT,
  per_meal_cap_ngn NUMERIC,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.latest_recs ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON TABLE public.latest_recs TO authenticated;

DROP POLICY IF EXISTS "Users can read their own latest recommendations" ON public.latest_recs;
CREATE POLICY "Users can read their own latest recommendations"
  ON public.latest_recs FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- 4. SERVER-ONLY TABLES (Protected with RLS, accessed via service role key)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.nutrition_cache (
  ingredients_hash TEXT PRIMARY KEY,
  nutrition JSONB NOT NULL,
  source TEXT NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.nutrition_cache ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.rate_limits (
  user_id TEXT PRIMARY KEY,
  window_start BIGINT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.admin_config (
  section TEXT PRIMARY KEY,
  config JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;
