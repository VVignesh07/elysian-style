
update public.app_settings
set value = '"✨ Enjoy FREE Shipping on all UPI / Prepaid Orders | 🚚 Cash on Delivery Available (+₹50)"'::jsonb
where key = 'announcement_text';

update public.app_settings
set value = 'true'::jsonb
where key = 'announcement_enabled';
