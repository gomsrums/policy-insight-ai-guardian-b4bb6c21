-- Fix broker_companies RLS - restrict to own data only
DROP POLICY IF EXISTS "Brokers can view their own company data" ON public.broker_companies;
DROP POLICY IF EXISTS "Brokers can update their own company data" ON public.broker_companies;

CREATE POLICY "Brokers can view their own company data" 
ON public.broker_companies 
FOR SELECT 
USING (auth.uid()::text = id::text);

CREATE POLICY "Brokers can update their own company data" 
ON public.broker_companies 
FOR UPDATE 
USING (auth.uid()::text = id::text);

-- Fix analytics_events RLS - restrict to authenticated users only
DROP POLICY IF EXISTS "Allow inserting analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Allow reading analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can view own analytics" ON public.analytics_events;

-- Only authenticated users can insert their own events
CREATE POLICY "Authenticated users can insert own events" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND (user_id IS NULL OR auth.uid() = user_id));

-- Users can only view their own events
CREATE POLICY "Users can view own analytics events" 
ON public.analytics_events 
FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can view all events (check is_admin in profiles)
CREATE POLICY "Admins can view all analytics events" 
ON public.analytics_events 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);