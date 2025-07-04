
-- Create analysis_history table
CREATE TABLE public.analysis_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id TEXT NOT NULL,
  user_id UUID,
  summary TEXT,
  risk_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chat_history table
CREATE TABLE public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id TEXT NOT NULL,
  user_id UUID,
  sender TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create broker_companies table
CREATE TABLE public.broker_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create compliance_reports table
CREATE TABLE public.compliance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID NOT NULL,
  policy_name TEXT NOT NULL,
  compliance_score INTEGER,
  risk_level TEXT,
  flagged_issues JSONB,
  recommendations JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (broker_id) REFERENCES public.broker_companies(id)
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create regulations table
CREATE TABLE public.regulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  category TEXT NOT NULL,
  regulation_text TEXT NOT NULL,
  mandatory BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable the vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create insurance_knowledge_base table
CREATE TABLE public.insurance_knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  region TEXT,
  policy_type TEXT,
  tags TEXT[],
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create document_chunks table
CREATE TABLE public.document_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID,
  knowledge_base_id UUID REFERENCES public.insurance_knowledge_base(id),
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create processed_documents table
CREATE TABLE public.processed_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_name TEXT NOT NULL,
  file_path TEXT,
  content_type TEXT,
  total_chunks INTEGER DEFAULT 0,
  processing_status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient queries
CREATE INDEX idx_analysis_history_document_id ON public.analysis_history(document_id);
CREATE INDEX idx_chat_history_document_id ON public.chat_history(document_id);
CREATE INDEX ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX ON document_chunks (document_id);
CREATE INDEX ON document_chunks (knowledge_base_id);
CREATE INDEX ON insurance_knowledge_base (category);
CREATE INDEX ON insurance_knowledge_base (region);
CREATE INDEX ON insurance_knowledge_base (policy_type);

-- Enable Row Level Security
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broker_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processed_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (adjust as needed)
CREATE POLICY "Public can use history tables" ON public.analysis_history FOR ALL USING (true);
CREATE POLICY "Public can use chat history" ON public.chat_history FOR ALL USING (true);

-- Broker company policies
CREATE POLICY "Allow broker company registration" ON public.broker_companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Brokers can view their own company data" ON public.broker_companies FOR SELECT USING (true);
CREATE POLICY "Brokers can update their own company data" ON public.broker_companies FOR UPDATE USING (true);

-- Compliance reports policies
CREATE POLICY "Brokers can view their own reports" ON public.compliance_reports FOR SELECT USING (broker_id = auth.uid());
CREATE POLICY "Brokers can create their own reports" ON public.compliance_reports FOR INSERT WITH CHECK (broker_id = auth.uid());
CREATE POLICY "Brokers can update their own reports" ON public.compliance_reports FOR UPDATE USING (broker_id = auth.uid());
CREATE POLICY "Brokers can delete their own reports" ON public.compliance_reports FOR DELETE USING (broker_id = auth.uid());

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Regulations policies
CREATE POLICY "Authenticated brokers can view regulations" ON public.regulations FOR SELECT USING (true);

-- Knowledge base and documents policies
CREATE POLICY "Public can read knowledge base" ON public.insurance_knowledge_base FOR SELECT USING (true);
CREATE POLICY "Public can read document chunks" ON public.document_chunks FOR SELECT USING (true);
CREATE POLICY "Public can read processed documents" ON public.processed_documents FOR SELECT USING (true);

-- Insert sample insurance knowledge base entries
INSERT INTO public.insurance_knowledge_base (title, content, category, region, policy_type, tags, source) VALUES
(
  'Commercial General Liability Coverage Requirements',
  'Commercial General Liability (CGL) insurance provides coverage for bodily injury, property damage, and personal and advertising injury claims. Standard coverage limits typically range from $1M to $2M per occurrence. Key exclusions include professional liability, cyber liability, and employment practices. Most policies include products and completed operations coverage.',
  'coverage_types',
  'US',
  'commercial',
  ARRAY['CGL', 'liability', 'commercial', 'coverage_limits'],
  'Insurance Industry Standards'
),
(
  'California Workers Compensation Requirements',
  'California requires all employers with one or more employees to carry workers compensation insurance. Coverage must include medical expenses, temporary disability, permanent disability, and death benefits. Minimum coverage limits are set by state regulation. Self-insurance options available for qualified employers.',
  'regulations',
  'California',
  'workers_compensation',
  ARRAY['workers_comp', 'California', 'mandatory', 'employees'],
  'California Department of Industrial Relations'
),
(
  'Professional Liability Insurance Best Practices',
  'Professional liability insurance protects against claims of errors, omissions, or negligence in professional services. Coverage should include defense costs, settlements, and judgments. Retroactive dates are crucial for claims-made policies. Typical limits range from $1M to $5M depending on profession and risk exposure.',
  'best_practices',
  'US',
  'professional',
  ARRAY['professional_liability', 'errors_omissions', 'claims_made'],
  'Insurance Best Practices Guide'
),
(
  'Cyber Liability Coverage Components',
  'Cyber liability insurance should include first-party coverage (data recovery, business interruption, notification costs) and third-party coverage (privacy liability, regulatory fines). Key features include breach response services, forensic investigation, and regulatory defense. Coverage limits typically range from $1M to $10M.',
  'coverage_types',
  'US',
  'cyber',
  ARRAY['cyber_liability', 'data_breach', 'privacy', 'regulatory'],
  'Cybersecurity Insurance Standards'
),
(
  'UK Employers Liability Insurance Requirements',
  'UK law requires all employers to have Employers Liability insurance with minimum coverage of £5 million. This covers compensation claims from employees who are injured or become ill due to work. The policy must be displayed in the workplace and cover all employees including temporary and part-time workers.',
  'regulations',
  'UK',
  'employers_liability',
  ARRAY['employers_liability', 'UK', 'mandatory', '£5_million'],
  'UK Health and Safety Executive'
);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
