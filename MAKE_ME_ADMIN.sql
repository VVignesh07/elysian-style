-- 1. First, make sure the 'admin' role exists
INSERT INTO public.roles (name) 
VALUES ('admin') 
ON CONFLICT (name) DO NOTHING;

-- 2. Assign the 'admin' role to your email
-- Replace 'your-email@example.com' with your actual login email
DO $$
DECLARE
    target_user_id UUID;
    admin_role_id UUID;
BEGIN
    -- Get user ID
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'zerofashion2025@gmail.com';
    
    -- Get admin role ID
    SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin';
    
    -- Assign role
    IF target_user_id IS NOT NULL AND admin_role_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role_id)
        VALUES (target_user_id, admin_role_id)
        ON CONFLICT (user_id, role_id) DO NOTHING;
        
        RAISE NOTICE 'Admin role assigned successfully to %', 'your-email@example.com';
    ELSE
        RAISE EXCEPTION 'User or Admin Role not found. Check your email.';
    END IF;
END $$;
