-- Update admin profile to Yusuf Ilham Zamzami
UPDATE profiles 
SET 
  full_name = 'Yusuf Ilham Zamzami',
  username = 'yusuf.ilham.zamzami'
WHERE user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- Update the auth user's email
UPDATE auth.users 
SET 
  email = 'yusuf.ilham.zamzami@example.com',
  raw_user_meta_data = jsonb_set(
    raw_user_meta_data, 
    '{full_name}', 
    '"Yusuf Ilham Zamzami"'
  )
WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';