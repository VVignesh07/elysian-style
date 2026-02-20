-- Create promotional_banners table
CREATE TABLE IF NOT EXISTS promotional_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    image_url TEXT NOT NULL,
    button_text TEXT,
    button_link TEXT,
    position TEXT DEFAULT 'hero' CHECK (position IN ('hero', 'mid-page', 'footer')),
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial Autumn Collection banner
INSERT INTO promotional_banners (title, subtitle, description, image_url, button_text, button_link, position, priority)
VALUES (
    'Autumn Collection',
    'Limited Time',
    'Up to 30% OFF on selected styles',
    'https://images.unsplash.com/photo-1520006403993-474000b673e3?auto=format&fit=crop&q=80&w=2000',
    'Shop Collection',
    '/collections',
    'mid-page',
    10
) ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE promotional_banners ENABLE ROW LEVEL SECURITY;

-- Public can view active banners
CREATE POLICY "Anyone can view active banners"
    ON promotional_banners
    FOR SELECT
    USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage banners"
    ON promotional_banners
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_banners_active_priority 
    ON promotional_banners(is_active, priority DESC, created_at DESC);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_promotional_banners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER promotional_banners_updated_at
    BEFORE UPDATE ON promotional_banners
    FOR EACH ROW
    EXECUTE FUNCTION update_promotional_banners_updated_at();
