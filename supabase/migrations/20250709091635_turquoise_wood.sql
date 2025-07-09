/*
  # Update User Creation Process

  1. Updates
    - Improve the handle_new_user function to be more robust
    - Add better error handling for user creation
    - Ensure profiles are created properly from user metadata

  2. Security
    - Maintain existing RLS policies
    - Ensure proper role assignment
*/

-- Drop existing function and recreate with better error handling
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert into profiles table with data from user metadata
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee')::text
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ language plpgsql security definer;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add a function to manually create profiles if needed
CREATE OR REPLACE FUNCTION public.create_profile_if_missing(user_id uuid, user_name text, user_role text DEFAULT 'employee')
RETURNS void AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (user_id, user_name, user_role)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role;
END;
$$ language plpgsql security definer;