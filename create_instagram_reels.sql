-- =====================================================
-- INSTAGRAM REELS TABLE SETUP
-- =====================================================

CREATE TABLE IF NOT EXISTS public.instagram_reels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reel_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.instagram_reels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Reels" ON public.instagram_reels;
CREATE POLICY "Public Read Reels" ON public.instagram_reels FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin Manage Reels" ON public.instagram_reels;
CREATE POLICY "Admin Manage Reels" ON public.instagram_reels FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS tr_update_reels_updated_at ON public.instagram_reels;
CREATE TRIGGER tr_update_reels_updated_at 
BEFORE UPDATE ON public.instagram_reels 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Fix for potentially missing function in some environments
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
