/*
  # Update user creation function with better error handling

  1. Changes
    - Drop existing trigger first to avoid dependency issues
    - Recreate handle_new_user function with improved error handling
    - Add fallback for user name using email if metadata is missing
    - Add exception handling to prevent user creation failures
    - Recreate the trigger
    - Add helper function for manual profile creation

  2. Security
    - Maintains existing RLS policies
    - Functions are security definer for proper permissions
*/

-- Drop the trigger first to avoid dependency issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Now we can safely drop and recreate the function
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