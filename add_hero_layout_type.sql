-- Add layout_type column to hero_slides table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hero_slides' AND column_name='layout_type') THEN
        ALTER TABLE public.hero_slides ADD COLUMN layout_type TEXT DEFAULT 'split' CHECK (layout_type IN ('split', 'full'));
    END IF;
END $$;
