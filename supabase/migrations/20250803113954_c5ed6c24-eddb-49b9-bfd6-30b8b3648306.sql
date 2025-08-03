-- Fix admin privilege escalation by adding proper is_admin column
ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Update existing admin user (replace with actual admin email)
UPDATE public.profiles 
SET is_admin = TRUE 
WHERE email = 'gomsrums@gmail.com';

-- Drop existing policy and create new one to prevent users from updating their admin status
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile except admin status" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  CASE 
    WHEN is_admin = true THEN is_admin = true  -- Admin status cannot be changed
    ELSE is_admin = false  -- Non-admins cannot make themselves admin
  END
);

-- Re-create select policy
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Re-create insert policy
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Fix database function security issues
CREATE OR REPLACE FUNCTION public.get_user_tier(user_uuid uuid)
RETURNS subscription_tiers
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, auth
AS $function$
  SELECT st.*
  FROM public.subscription_tiers st
  LEFT JOIN public.user_subscriptions us ON st.id = us.tier_id AND us.user_id = user_uuid
  WHERE us.user_id IS NOT NULL AND us.status = 'active'
  UNION ALL
  SELECT st.*
  FROM public.subscription_tiers st
  WHERE st.name = 'basic' AND NOT EXISTS (
    SELECT 1 FROM public.user_subscriptions WHERE user_id = user_uuid AND status = 'active'
  )
  LIMIT 1;
$function$;

-- Fix handle_new_user function security
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, name, is_admin)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    FALSE
  );
  RETURN new;
END;
$function$;

-- Restrict overly permissive RLS policies
DROP POLICY IF EXISTS "Public can use chat history" ON public.chat_history;
CREATE POLICY "Users can manage their own chat history" 
ON public.chat_history 
FOR ALL 
USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Public can use history tables" ON public.analysis_history;
CREATE POLICY "Users can manage their own analysis history" 
ON public.analysis_history 
FOR ALL 
USING (auth.uid() = user_id OR user_id IS NULL);