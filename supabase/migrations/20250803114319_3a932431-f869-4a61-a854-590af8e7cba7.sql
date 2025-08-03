-- Add policy to prevent users from updating their admin status
-- First drop the existing update policy temporarily
DROP POLICY IF EXISTS "Users can update their own profile except admin status" ON public.profiles;

-- Create a new update policy that prevents admin status changes
CREATE POLICY "Users can update profile but not admin status" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  (
    -- If user is currently admin, they must remain admin (no self-demotion)
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = is_admin 
    OR 
    -- If user is not admin, they cannot become admin
    (NOT (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) AND is_admin = FALSE)
  )
);