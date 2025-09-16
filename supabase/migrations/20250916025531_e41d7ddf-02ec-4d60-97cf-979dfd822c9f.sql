-- Create a new admin user with email admin2@test.com
DO $$
DECLARE
    new_user_id uuid;
BEGIN
    -- Generate a new UUID
    new_user_id := gen_random_uuid();
    
    -- Insert into auth.users
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
        new_user_id,
        'authenticated',
        'authenticated',
        'admin2@test.com',
        crypt('admin123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"username": "admin2", "full_name": "Admin User 2"}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    );
    
    -- Insert into profiles
    INSERT INTO public.profiles (user_id, username, full_name, role)
    VALUES (new_user_id, 'admin2', 'Admin User 2', 'admin');
END $$;