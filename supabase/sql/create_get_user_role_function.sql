
-- Create a security definer function to get user role without causing recursion
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$;

-- Create profile policies using the new function
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to see their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy for users to update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Policy for admins to see all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.get_auth_user_role() = 'admin');

-- Policy for admins to update all profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (public.get_auth_user_role() = 'admin');

-- Policy for staff to see all profiles
CREATE POLICY "Staff can view all profiles"
ON public.profiles
FOR SELECT
USING (public.get_auth_user_role() = 'staff' OR public.get_auth_user_role() = 'admin');
