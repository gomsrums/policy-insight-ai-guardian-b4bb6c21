
-- Enable the vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table for storing insurance knowledge base documents
CREATE TABLE public.insurance_knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL, -- e.g., 'regulations', 'best_practices', 'coverage_types'
  region TEXT, -- e.g., 'US', 'California', 'Texas', 'UK'
  policy_type TEXT, -- e.g., 'commercial', 'auto', 'property', 'liability'
  tags TEXT[],
  source TEXT, -- where this knowledge came from
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for document chunks with embeddings
CREATE TABLE public.document_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID, -- can reference uploaded documents or knowledge base entries
  knowledge_base_id UUID REFERENCES public.insurance_knowledge_base(id),
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding vector(1536), -- OpenAI embeddings are 1536 dimensions
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for processed documents
CREATE TABLE public.processed_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_name TEXT NOT NULL,
  file_path TEXT,
  content_type TEXT,
  total_chunks INTEGER DEFAULT 0,
  processing_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient vector similarity search
CREATE INDEX ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX ON document_chunks (document_id);
CREATE INDEX ON document_chunks (knowledge_base_id);
CREATE INDEX ON insurance_knowledge_base (category);
CREATE INDEX ON insurance_knowledge_base (region);
CREATE INDEX ON insurance_knowledge_base (policy_type);

-- Enable RLS
ALTER TABLE public.insurance_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processed_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can restrict later)
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
