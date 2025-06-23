
-- Function to search similar document chunks
CREATE OR REPLACE FUNCTION search_similar_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  chunk_text text,
  similarity float,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    document_chunks.id,
    document_chunks.chunk_text,
    1 - (document_chunks.embedding <=> query_embedding) AS similarity,
    document_chunks.metadata
  FROM document_chunks
  WHERE 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY document_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to search knowledge base with filters
CREATE OR REPLACE FUNCTION search_knowledge_base(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  category_filter text DEFAULT NULL,
  region_filter text DEFAULT NULL,
  policy_type_filter text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  chunk_text text,
  similarity float,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.chunk_text,
    1 - (dc.embedding <=> query_embedding) AS similarity,
    dc.metadata
  FROM document_chunks dc
  JOIN insurance_knowledge_base ikb ON dc.knowledge_base_id = ikb.id
  WHERE 
    1 - (dc.embedding <=> query_embedding) > match_threshold
    AND (category_filter IS NULL OR ikb.category = category_filter)
    AND (region_filter IS NULL OR ikb.region = region_filter)
    AND (policy_type_filter IS NULL OR ikb.policy_type = policy_type_filter)
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
