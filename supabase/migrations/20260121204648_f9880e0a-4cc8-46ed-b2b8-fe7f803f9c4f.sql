-- Security fix: restrict renewal_reminders policies to authenticated users only
DROP POLICY IF EXISTS "Users can view their own renewal reminders" ON public.renewal_reminders;
DROP POLICY IF EXISTS "Users can create their own renewal reminders" ON public.renewal_reminders;
DROP POLICY IF EXISTS "Users can delete their own renewal reminders" ON public.renewal_reminders;
DROP POLICY IF EXISTS "Users can update their own renewal reminders" ON public.renewal_reminders;

CREATE POLICY "Users can view their own renewal reminders"
ON public.renewal_reminders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own renewal reminders"
ON public.renewal_reminders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own renewal reminders"
ON public.renewal_reminders
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own renewal reminders"
ON public.renewal_reminders
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
