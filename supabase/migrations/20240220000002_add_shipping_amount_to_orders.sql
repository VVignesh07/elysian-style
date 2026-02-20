-- Add shipping_amount column to orders table
ALTER TABLE public.orders 
ADD COLUMN shipping_amount DECIMAL(10,2) DEFAULT 0;
