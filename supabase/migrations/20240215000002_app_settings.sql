-- =====================================================
-- APP SETTINGS & ROBUST ADMIN CHECK
-- =====================================================

-- 1. Create a robust admin check function
-- SECURITY DEFINER allows this function to bypass RLS on the user_roles table
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

-- 2. Ensure app_settings table exists
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- 3. Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- 4. Update Policies to use the new function
DROP POLICY IF EXISTS "Admins can manage settings" ON public.app_settings;
CREATE POLICY "Admins can manage settings" ON public.app_settings 
FOR ALL 
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- 5. Ensure Public can still read
DROP POLICY IF EXISTS "Public can view settings" ON public.app_settings;
CREATE POLICY "Public can view settings" ON public.app_settings 
FOR SELECT 
USING (true);

-- 6. Pre-populate all announcement keys (Important for UPSERT)
INSERT INTO public.app_settings (key, value, description)
VALUES 
    ('announcement_enabled', 'false'::jsonb, 'Toggle to show/hide the top announcement bar'),
    ('announcement_text', '"Welcome to KVP JEWELLERY! Shop our latest collections."'::jsonb, 'The text to display in the top scrolling announcement bar'),
    ('announcement_bg_color', '"#000000"'::jsonb, 'Background color of the announcement bar'),
    ('announcement_text_color', '"#ffffff"'::jsonb, 'Text color of the announcement bar'),
    ('announcement_speed', '20'::jsonb, 'Scrolling speed in seconds (lower is faster)')
ON CONFLICT (key) DO NOTHING;
