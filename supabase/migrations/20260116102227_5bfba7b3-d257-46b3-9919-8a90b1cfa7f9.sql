-- Fix the daily_spending view to use SECURITY INVOKER instead of SECURITY DEFINER
DROP VIEW IF EXISTS public.daily_spending;

CREATE VIEW public.daily_spending 
WITH (security_invoker = true)
AS
SELECT 
  user_id,
  DATE(created_at) as spending_date,
  SUM(usd_amount) as daily_total_usd
FROM public.transactions
GROUP BY user_id, DATE(created_at);