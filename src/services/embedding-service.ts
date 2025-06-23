
import { supabase } from "@/integrations/supabase/client";

export interface EmbeddingResult {
  embedding: number[];
  text: string;
}

export const generateEmbeddings = async (texts: string[]): Promise<EmbeddingResult[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-embeddings', {
      body: { texts }
    });
    
    if (error) throw error;
    return data.embeddings;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
};

export const storeDocumentChunks = async (
  documentId: string, 
  chunks: string[]
): Promise<void> => {
  try {
    // Generate embeddings for all chunks
    const embeddingResults = await generateEmbeddings(chunks);
    
    // Store chunks with embeddings
    const chunkData = embeddingResults.map((result, index) => ({
      document_id: documentId,
      chunk_text: result.text,
      chunk_index: index,
      embedding: `[${result.embedding.join(',')}]`, // Convert array to string format
      metadata: { document_id: documentId, chunk_size: result.text.length }
    }));
    
    const { error } = await supabase
      .from('document_chunks')
      .insert(chunkData);
    
    if (error) throw error;
    
    console.log(`Stored ${chunks.length} chunks with embeddings`);
  } catch (error) {
    console.error('Error storing document chunks:', error);
    throw error;
  }
};

export const findSimilarChunks = async (
  query: string, 
  limit: number = 5
): Promise<any[]> => {
  try {
    // Generate embedding for query
    const [queryEmbedding] = await generateEmbeddings([query]);
    
    // Search for similar chunks using vector similarity
    const { data, error } = await supabase.rpc('search_similar_chunks', {
      query_embedding: `[${queryEmbedding.embedding.join(',')}]`,
      match_threshold: 0.7,
      match_count: limit
    });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error finding similar chunks:', error);
    return [];
  }
};
