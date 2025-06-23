
import { supabase } from "@/integrations/supabase/client";

export interface ProcessedDocument {
  id: string;
  text: string;
  chunks: string[];
}

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    // For now, we'll use a simple approach. In production, you might want to use pdf-parse or similar
    const formData = new FormData();
    formData.append('file', file);
    
    // Call edge function to process PDF (we'll create this)
    const { data, error } = await supabase.functions.invoke('process-pdf', {
      body: formData,
    });
    
    if (error) throw error;
    return data.text || '';
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    // Fallback: return empty string for now
    return '';
  }
};

export const chunkText = (text: string, chunkSize: number = 1000, overlap: number = 200): string[] => {
  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let currentChunk = '';
  let currentSize = 0;
  
  for (const sentence of sentences) {
    const sentenceSize = sentence.length;
    
    if (currentSize + sentenceSize > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      
      // Start new chunk with overlap
      const words = currentChunk.split(' ');
      const overlapWords = words.slice(-Math.floor(overlap / 10));
      currentChunk = overlapWords.join(' ') + ' ' + sentence;
      currentSize = currentChunk.length;
    } else {
      currentChunk += (currentChunk ? '. ' : '') + sentence;
      currentSize += sentenceSize;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.filter(chunk => chunk.length > 50);
};

export const processDocument = async (file: File): Promise<ProcessedDocument> => {
  console.log('Processing document:', file.name);
  
  // Extract text from PDF
  const text = await extractTextFromPDF(file);
  
  if (!text) {
    throw new Error('Could not extract text from PDF');
  }
  
  // Create chunks
  const chunks = chunkText(text);
  
  // Store in database
  const { data: docData, error: docError } = await supabase
    .from('processed_documents')
    .insert({
      original_name: file.name,
      content_type: file.type,
      total_chunks: chunks.length,
      processing_status: 'completed'
    })
    .select()
    .single();
  
  if (docError) throw docError;
  
  return {
    id: docData.id,
    text,
    chunks
  };
};
