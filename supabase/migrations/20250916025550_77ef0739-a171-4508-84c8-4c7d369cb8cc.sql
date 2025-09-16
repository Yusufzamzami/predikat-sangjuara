-- Create a simple admin user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
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
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'authenticated',
  'authenticated',
  'admin@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"username": "admin", "full_name": "Administrator"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);