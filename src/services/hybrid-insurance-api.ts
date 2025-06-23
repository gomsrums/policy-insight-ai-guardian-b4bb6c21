
import { PolicyDocument, AnalysisResult, BusinessProfile, PolicyBenchmark } from "@/lib/chatpdf-types";
import { processDocument } from "./pdf-processor";
import { storeDocumentChunks, findSimilarChunks } from "./embedding-service";
import { searchKnowledgeBase } from "./knowledge-base";
import { supabase } from "@/integrations/supabase/client";

export const uploadDocumentForAnalysis = async (document: PolicyDocument): Promise<AnalysisResult> => {
  try {
    console.log("Processing document with hybrid approach:", document.name);
    
    // Process the document
    let processedDoc;
    if (document.file) {
      processedDoc = await processDocument(document.file);
    } else if (document.content) {
      // Handle text content
      const chunks = document.content.split('\n\n').filter(chunk => chunk.trim().length > 50);
      processedDoc = {
        id: `text-${Date.now()}`,
        text: document.content,
        chunks
      };
    } else {
      throw new Error("No file or content available for analysis");
    }
    
    // Store document chunks with embeddings
    await storeDocumentChunks(processedDoc.id, processedDoc.chunks);
    
    // Analyze the document using AI with knowledge base context
    const analysisResult = await analyzeDocumentWithKnowledgeBase(processedDoc);
    
    return {
      ...analysisResult,
      document_id: processedDoc.id
    };
  } catch (error) {
    console.error("Error in hybrid document analysis:", error);
    throw new Error(`Analysis failed: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
  }
};

const analyzeDocumentWithKnowledgeBase = async (processedDoc: any): Promise<Omit<AnalysisResult, 'document_id'>> => {
  try {
    // Get relevant knowledge base context
    const knowledgeContext = await searchKnowledgeBase(
      "insurance policy analysis coverage requirements regulations best practices",
      { category: "regulations" }
    );
    
    // Prepare context from knowledge base
    const contextText = knowledgeContext
      .map(item => `${item.metadata?.title || ''}: ${item.chunk_text}`)
      .join('\n\n');
    
    // Call OpenAI for analysis with knowledge base context
    const { data, error } = await supabase.functions.invoke('analyze-policy-with-knowledge', {
      body: {
        documentText: processedDoc.text,
        knowledgeContext: contextText,
        chunks: processedDoc.chunks.slice(0, 5) // Send first 5 chunks for context
      }
    });
    
    if (error) throw error;
    
    // Parse and structure the analysis result
    const analysis = data.analysis;
    
    return {
      summary: analysis.summary || "Policy analysis completed successfully",
      gaps: analysis.gaps || [],
      overpayments: analysis.overpayments || [],
      recommendations: analysis.recommendations || [],
      is_insurance_policy: true,
      risk_assessment: {
        overall_risk_level: analysis.risk_level || "Medium",
        risk_factors: analysis.risk_factors || [],
        mitigation_strategies: analysis.mitigation_strategies || []
      }
    };
  } catch (error) {
    console.error("Error in AI analysis:", error);
    throw error;
  }
};

export const sendChatMessage = async (documentId: string, question: string): Promise<string> => {
  try {
    console.log("Sending chat message for document:", documentId);
    
    // Find relevant document chunks
    const similarChunks = await findSimilarChunks(question, 5);
    
    // Get relevant knowledge base context
    const knowledgeContext = await searchKnowledgeBase(question);
    
    // Prepare context
    const documentContext = similarChunks.map(chunk => chunk.chunk_text).join('\n\n');
    const knowledgeContextText = knowledgeContext
      .map(item => `${item.metadata?.title || ''}: ${item.chunk_text}`)
      .join('\n\n');
    
    // Send to OpenAI for response
    const { data, error } = await supabase.functions.invoke('chat-with-policy', {
      body: {
        question,
        documentContext,
        knowledgeContext: knowledgeContextText
      }
    });
    
    if (error) throw error;
    return data.response;
  } catch (error) {
    console.error("Error in chat message:", error);
    throw error;
  }
};

export const getCoverageGaps = async (documentId: string): Promise<string> => {
  try {
    console.log("Getting coverage gaps for document:", documentId);
    
    // Get document chunks
    const { data: chunks, error } = await supabase
      .from('document_chunks')
      .select('chunk_text')
      .eq('document_id', documentId)
      .limit(10);
    
    if (error) throw error;
    
    // Get relevant knowledge base for coverage requirements
    const knowledgeContext = await searchKnowledgeBase(
      "coverage requirements gaps missing insurance policy standards",
      { category: "coverage_types" }
    );
    
    const documentText = chunks?.map(c => c.chunk_text).join('\n\n') || '';
    const knowledgeContextText = knowledgeContext
      .map(item => `${item.metadata?.title || ''}: ${item.chunk_text}`)
      .join('\n\n');
    
    // Analyze for coverage gaps
    const { data, error: analysisError } = await supabase.functions.invoke('analyze-coverage-gaps', {
      body: {
        documentText,
        knowledgeContext: knowledgeContextText
      }
    });
    
    if (analysisError) throw analysisError;
    return data.gaps;
  } catch (error) {
    console.error("Error getting coverage gaps:", error);
    throw error;
  }
};

export const getBenchmarkComparison = async (profile: BusinessProfile, documentId?: string): Promise<PolicyBenchmark> => {
  try {
    console.log("Getting benchmark comparison for profile:", profile);
    
    if (!documentId) {
      throw new Error("Document ID is required for benchmark comparison");
    }
    
    // Get document chunks
    const { data: chunks, error } = await supabase
      .from('document_chunks')
      .select('chunk_text')
      .eq('document_id', documentId)
      .limit(10);
    
    if (error) throw error;
    
    // Get relevant knowledge base for benchmarking
    const knowledgeContext = await searchKnowledgeBase(
      `${profile.type} ${profile.policyType} insurance benchmarks standards limits`,
      { 
        policy_type: profile.policyType,
        category: "best_practices"
      }
    );
    
    const documentText = chunks?.map(c => c.chunk_text).join('\n\n') || '';
    const knowledgeContextText = knowledgeContext
      .map(item => `${item.metadata?.title || ''}: ${item.chunk_text}`)
      .join('\n\n');
    
    // Get benchmark analysis
    const { data, error: analysisError } = await supabase.functions.invoke('benchmark-analysis', {
      body: {
        profile,
        documentText,
        knowledgeContext: knowledgeContextText
      }
    });
    
    if (analysisError) throw analysisError;
    
    return {
      coverageLimits: data.coverageLimits || "Analysis completed",
      deductibles: data.deductibles || "Standard deductibles identified",
      missingCoverages: data.missingCoverages || ["No specific gaps identified"],
      premiumComparison: data.premiumComparison || "Premium analysis completed",
      benchmarkScore: Math.min(10, Math.max(1, data.benchmarkScore || 6))
    };
  } catch (error) {
    console.error("Error getting benchmark comparison:", error);
    throw error;
  }
};
