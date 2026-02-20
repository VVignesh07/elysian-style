-- Add updated_at column to reviews table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='updated_at') THEN
        ALTER TABLE public.reviews ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Bind the updated_at trigger
DROP TRIGGER IF EXISTS tr_update_reviews_updated_at ON public.reviews;
CREATE TRIGGER tr_update_reviews_updated_at 
    BEFORE UPDATE ON public.reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
