-- Promote aantigravity123@gmail.com to Admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' 
FROM auth.users 
WHERE email = 'aantigravity123@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Also update user metadata for faster JWT-based checks
UPDATE auth.users
SET raw_user_meta_data = 
    COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'aantigravity123@gmail.com';
