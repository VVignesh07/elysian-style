-- Add show_limited_stock column to products table
ALTER TABLE public.products 
ADD COLUMN show_limited_stock BOOLEAN DEFAULT FALSE;
