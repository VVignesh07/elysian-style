-- =====================================================
-- ADMIN NOTIFICATIONS SYSTEM
-- =====================================================

-- 1. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL DEFAULT 'new_order',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS for Notifications
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin All Notifications" ON public.admin_notifications;
CREATE POLICY "Admin All Notifications" ON public.admin_notifications 
FOR ALL USING (is_admin());

-- 3. Trigger Function to create notification on new order
CREATE OR REPLACE FUNCTION public.notify_admin_on_order()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, order_id)
  VALUES (
    'new_order',
    'New Order Received',
    'A new order #' || COALESCE(NEW.order_number, NEW.id::text) || ' has been placed by ' || NEW.customer_name,
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Bind Trigger to orders table
DROP TRIGGER IF EXISTS tr_notify_admin_on_order ON public.orders;
CREATE TRIGGER tr_notify_admin_on_order
AFTER INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.notify_admin_on_order();

-- 5. Helper Function to mark all as read
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS VOID AS $$
BEGIN
  UPDATE public.admin_notifications SET is_read = TRUE WHERE is_read = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
