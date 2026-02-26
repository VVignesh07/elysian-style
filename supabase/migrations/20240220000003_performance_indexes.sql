-- Add performance indexes for frequently queried columns

-- 1. Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON public.orders USING gin (customer_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_orders_email ON public.orders USING gin (email gin_trgm_ops);

-- 2. Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- 3. Order Items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- 4. RPC for Admin Dashboard Stats
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    p_count INTEGER;
    c_count INTEGER;
    o_count INTEGER;
    total_rev DECIMAL(10,2);
BEGIN
    SELECT COUNT(*) INTO p_count FROM public.products;
    SELECT COUNT(*) INTO c_count FROM public.categories;
    SELECT COUNT(*) INTO o_count FROM public.orders;
    SELECT COALESCE(SUM(total_amount), 0) INTO total_rev FROM public.orders WHERE status != 'Cancelled';

    RETURN json_build_object(
        'productsCount', p_count,
        'categoriesCount', c_count,
        'ordersCount', o_count,
        'totalRevenue', total_rev
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
