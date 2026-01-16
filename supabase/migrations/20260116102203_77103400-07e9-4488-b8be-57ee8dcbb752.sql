-- Drop broker_companies table since Broker Portal is removed
DROP TABLE IF EXISTS public.broker_companies CASCADE;

-- Also drop compliance_reports that depends on broker_companies
DROP TABLE IF EXISTS public.compliance_reports CASCADE;