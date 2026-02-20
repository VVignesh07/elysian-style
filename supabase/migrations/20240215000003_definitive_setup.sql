-- =====================================================
-- DEFINITIVE SETUP: ROLES, PROFILES & ADMIN ACCESS
-- Safe to run multiple times. This is the "Proper Fix".
-- =====================================================

-- 1. UNIFY TABLES
-- Ensure profiles exists with correct schema
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure user_roles exists with correct schema (dropping legacy if needed)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_roles' AND column_name = 'role_id') THEN
        DROP TABLE public.user_roles CASCADE;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('admin', 'customer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. AUTOMATION: TRIGGER FOR NEW USERS
-- This ensures every new signup gets both a profile AND a user_role entry
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles (for frontend check)
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'customer')
  ON CONFLICT (id) DO NOTHING;

  -- Insert into user_roles (for RLS check)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_definitive ON auth.users;
CREATE TRIGGER on_auth_user_created_definitive
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 3. SYNC EXISTING USERS
-- Ensure all current auth users have a profile and a role
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'customer' FROM auth.users
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'customer' FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- 4. MASTER ADMIN ASSIGNMENT
-- Force the specific admin account into the correct state
DO $$
DECLARE
  target_email TEXT := 'zerofashion2025@gmail.com';
  target_uid UUID;
BEGIN
  SELECT id INTO target_uid FROM auth.users WHERE email = target_email;

  IF target_uid IS NOT NULL THEN
    -- Force Admin in profiles
    UPDATE public.profiles SET role = 'admin' WHERE id = target_uid;
    -- Force Admin in user_roles
    UPDATE public.user_roles SET role = 'admin' WHERE user_id = target_uid;
    
    RAISE NOTICE 'SUCCESS: Admin access forced for %', target_email;
  END IF;
END $$;

-- 5. SECURITY FUNCTIONS
CREATE OR REPLACE FUNCTION public.is_admin_user() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ) OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
