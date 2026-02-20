-- =====================================================
-- HERO SLIDES TABLE SETUP
-- =====================================================

CREATE TABLE IF NOT EXISTS public.hero_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  cta_text TEXT,
  cta_link TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Hero Slides" ON public.hero_slides;
CREATE POLICY "Public Read Hero Slides" ON public.hero_slides FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin Manage Hero Slides" ON public.hero_slides;
CREATE POLICY "Admin Manage Hero Slides" ON public.hero_slides FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS tr_update_hero_slides_updated_at ON public.hero_slides;
CREATE TRIGGER tr_update_hero_slides_updated_at 
BEFORE UPDATE ON public.hero_slides 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();
