-- Value-added feature: Renewal / price-check reminders
CREATE TABLE IF NOT EXISTS public.renewal_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  policy_name text NOT NULL,
  renewal_date date NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.renewal_reminders ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_renewal_reminders_user_id ON public.renewal_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_renewal_reminders_renewal_date ON public.renewal_reminders(renewal_date);

-- Policies
DROP POLICY IF EXISTS "Users can view their own renewal reminders" ON public.renewal_reminders;
CREATE POLICY "Users can view their own renewal reminders"
ON public.renewal_reminders
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own renewal reminders" ON public.renewal_reminders;
CREATE POLICY "Users can create their own renewal reminders"
ON public.renewal_reminders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own renewal reminders" ON public.renewal_reminders;
CREATE POLICY "Users can delete their own renewal reminders"
ON public.renewal_reminders
FOR DELETE
USING (auth.uid() = user_id);

-- (Optional) updates if you later add edit UI
DROP POLICY IF EXISTS "Users can update their own renewal reminders" ON public.renewal_reminders;
CREATE POLICY "Users can update their own renewal reminders"
ON public.renewal_reminders
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
