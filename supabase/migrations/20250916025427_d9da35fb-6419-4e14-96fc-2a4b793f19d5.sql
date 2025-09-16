-- Create a new admin user directly in the database
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@test.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"username": "admin", "full_name": "Admin User"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Create profile for the admin user
INSERT INTO public.profiles (user_id, username, full_name, role)
SELECT 
  id,
  'admin',
  'Admin User',
  'admin'
FROM auth.users 
WHERE email = 'admin@test.com';