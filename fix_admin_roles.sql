-- =====================================================
-- FIX ADMIN ROLES (SAFE & ROBUST)
-- =====================================================

-- 1. Ensure user_roles table exists (CRITICAL FOR AUTH CONTEXT)
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('admin', 'customer')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
CREATE POLICY "Users can read own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- 2. Securely set admin using logic provided
DO $$
DECLARE
  v_user_email TEXT := 'zerofashion2025@gmail.com'; -- << CHANGE THIS BEFORE RUNNING
  v_user_id UUID;
BEGIN
  -- Find the user ID based on email
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_user_email;
  
  IF v_user_id IS NOT NULL THEN
    -- Ensure they are in user_roles as admin (Primary check for AdminAuthContext)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin')
    ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
    
    RAISE NOTICE 'User % has been set as ADMIN in user_roles table.', v_user_email;
    
    -- Optional: Try to update profiles table if it exists (Graceful fallback)
    BEGIN
        UPDATE public.profiles SET role = 'admin' WHERE id = v_user_id;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Note: Could not update profiles table (column might be missing), but user_roles is set correctly.';
    END;
    
  ELSE
    RAISE NOTICE 'User % not found in auth.users. Please sign up first.', v_user_email;
  END IF;
END $$;

-- Verify
SELECT * FROM public.user_roles;
