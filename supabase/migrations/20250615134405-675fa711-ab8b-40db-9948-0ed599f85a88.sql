
-- Table for storing analysis results (history)
CREATE TABLE public.analysis_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id TEXT NOT NULL,
  user_id UUID, -- Optional, in case you later enable authentication
  summary TEXT,
  risk_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for storing chat messages (history)
CREATE TABLE public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id TEXT NOT NULL,
  user_id UUID, -- Optional, in case you later enable authentication
  sender TEXT NOT NULL, -- "user" or "assistant"
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- (Optionally: add indexes for query efficiency)
CREATE INDEX idx_analysis_history_document_id ON public.analysis_history(document_id);
CREATE INDEX idx_chat_history_document_id ON public.chat_history(document_id);

-- If you wish guests to see their history (no authentication), you could use document_id as the session key.

-- Enable Row Level Security to restrict read/write per user if you add auth later.
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- Policies: allow all interactions for now (public app). You can tighten later.
CREATE POLICY "Public can use history tables" 
  ON public.analysis_history
  FOR ALL
  USING (true);

CREATE POLICY "Public can use chat history" 
  ON public.chat_history
  FOR ALL
  USING (true);
