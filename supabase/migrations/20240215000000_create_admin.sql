-- =====================================================
-- MASTER ADMIN CREATION & RESET SCRIPT
-- Run this in Supabase SQL Editor or via Supabase CLI
-- This ensures the user exists, has a password, and is an Admin.
-- =====================================================

DO $$
DECLARE
  target_email TEXT := 'zerofashion2025@gmail.com';
  target_pass TEXT := 'ZeroFashion#1234';
  new_user_id UUID;
BEGIN
  -- 1. Check if user already exists in auth.users
  SELECT id INTO new_user_id FROM auth.users WHERE email = target_email;

  IF new_user_id IS NULL THEN
    -- User doesn't exist, create them
    new_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, 
      raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at, confirmation_token
    )
    VALUES (
      new_user_id, '00000000-0000-0000-0000-000000000000', target_email, 
      crypt(target_pass, gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated', now(), now(), ''
    );

    -- Create identity record (Crucial for Supabase to recognize the user)
    INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (
      new_user_id, new_user_id, 
      format('{"sub":"%s","email":"%s"}', new_user_id::text, target_email)::jsonb, 
      'email', now(), now(), now()
    );
    
    RAISE NOTICE 'Created new user with ID: %', new_user_id;
  ELSE
    -- User exists, just update the password
    UPDATE auth.users
    SET encrypted_password = crypt(target_pass, gen_salt('bf')),
        email_confirmed_at = NOW(),
        updated_at = NOW()
    WHERE id = new_user_id;
    
    RAISE NOTICE 'Updated existing user with ID: %', new_user_id;
  END IF;

  -- 2. RESOLVE SCHEMA CONFLICTS (Proper Fix)
  -- The existing user_roles table has a mandatory 'role_id' but we want a 'role' string.
  -- To fix this "properly", we ensure a clean schema for the simplified system.
  
  -- Drop existing user_roles if it has the wrong schema (contains role_id)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_roles' AND column_name = 'role_id') THEN
    DROP TABLE public.user_roles CASCADE;
    RAISE NOTICE 'Dropped legacy user_roles table to resolve schema conflict.';
  END IF;

  -- Create/Standardize public.user_roles
  CREATE TABLE IF NOT EXISTS public.user_roles (
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
      role TEXT NOT NULL CHECK (role IN ('admin', 'customer')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- 3. Standardize public.profiles (Primary table for frontend)
  CREATE TABLE IF NOT EXISTS public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT,
      role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- 4. Assign Admin Role (Clean Insert)
  DELETE FROM public.user_roles WHERE user_id = new_user_id;
  INSERT INTO public.user_roles (user_id, role) VALUES (new_user_id, 'admin');

  DELETE FROM public.profiles WHERE id = new_user_id;
  INSERT INTO public.profiles (id, email, role) VALUES (new_user_id, target_email, 'admin');

END $$;

-- 3. FINAL VERIFICATION
SELECT au.email, ur.role, au.email_confirmed_at
FROM auth.users au
LEFT JOIN public.user_roles ur ON au.id = ur.user_id
WHERE au.email = 'zerofashion2025@gmail.com';
