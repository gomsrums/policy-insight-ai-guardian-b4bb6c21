
import { supabase } from "@/integrations/supabase/client";
import { generateEmbeddings, storeDocumentChunks } from "./embedding-service";

export interface KnowledgeBaseEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  region?: string;
  policy_type?: string;
  tags?: string[];
  source?: string;
}

export const getKnowledgeBase = async (filters?: {
  category?: string;
  region?: string;
  policy_type?: string;
}): Promise<KnowledgeBaseEntry[]> => {
  try {
    let query = supabase.from('insurance_knowledge_base').select('*');
    
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.region) {
      query = query.eq('region', filters.region);
    }
    if (filters?.policy_type) {
      query = query.eq('policy_type', filters.policy_type);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching knowledge base:', error);
    return [];
  }
};

export const processKnowledgeBase = async (): Promise<void> => {
  try {
    console.log('Processing insurance knowledge base...');
    
    // Get all knowledge base entries
    const { data: entries, error } = await supabase
      .from('insurance_knowledge_base')
      .select('*');
    
    if (error) throw error;
    
    // Process each entry and create embeddings
    for (const entry of entries || []) {
      // Create chunks from content
      const chunks = [entry.content]; // For knowledge base, we can use the full content as one chunk
      
      // Generate embeddings
      const embeddingResults = await generateEmbeddings(chunks);
      
      // Store chunks with embeddings, linked to knowledge base
      const chunkData = embeddingResults.map((result, index) => ({
        knowledge_base_id: entry.id,
        chunk_text: result.text,
        chunk_index: index,
        embedding: `[${result.embedding.join(',')}]`, // Convert array to string format
        metadata: { 
          title: entry.title,
          category: entry.category,
          region: entry.region,
          policy_type: entry.policy_type,
          tags: entry.tags
        }
      }));
      
      const { error: insertError } = await supabase
        .from('document_chunks')
        .upsert(chunkData, { onConflict: 'knowledge_base_id,chunk_index' });
      
      if (insertError) {
        console.error(`Error storing chunks for ${entry.title}:`, insertError);
      } else {
        console.log(`Processed knowledge base entry: ${entry.title}`);
      }
    }
    
    console.log('Knowledge base processing completed');
  } catch (error) {
    console.error('Error processing knowledge base:', error);
    throw error;
  }
};

export const searchKnowledgeBase = async (
  query: string,
  filters?: {
    category?: string;
    region?: string;
    policy_type?: string;
  }
): Promise<any[]> => {
  try {
    // Generate embedding for query
    const [queryEmbedding] = await generateEmbeddings([query]);
    
    // Search in knowledge base chunks
    const { data, error } = await supabase.rpc('search_knowledge_base', {
      query_embedding: `[${queryEmbedding.embedding.join(',')}]`,
      match_threshold: 0.7,
      match_count: 10,
      category_filter: filters?.category,
      region_filter: filters?.region,
      policy_type_filter: filters?.policy_type
    });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching knowledge base:', error);
    return [];
  }
};
