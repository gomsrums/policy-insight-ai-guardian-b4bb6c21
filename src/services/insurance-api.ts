import { PolicyDocument, AnalysisResult, BusinessProfile, PolicyBenchmark } from "@/lib/chatpdf-types";

// SECURITY NOTE: This file now routes all ChatPDF calls through secure Supabase edge functions
// API keys are managed securely via Supabase secrets

// This function is now deprecated - use chatpdf-api.ts instead which routes through edge functions
export const uploadDocumentForAnalysis = async (document: PolicyDocument): Promise<AnalysisResult> => {
  throw new Error("This function has been deprecated for security reasons. Use the uploadDocumentForAnalysis function from chatpdf-api.ts instead.");
};

// This function is now deprecated - use chatpdf-api.ts instead which routes through edge functions  
export const sendChatMessage = async (documentId: string, question: string): Promise<string> => {
  throw new Error("This function has been deprecated for security reasons. Use the sendChatMessage function from chatpdf-api.ts instead.");
};

// This function is now deprecated - use chatpdf-api.ts instead which routes through edge functions
export const getCoverageGaps = async (documentId: string): Promise<string> => {
  throw new Error("This function has been deprecated for security reasons. Use appropriate functions from chatpdf-api.ts instead.");
};

// This function is now deprecated - use chatpdf-api.ts instead which routes through edge functions
export const getBenchmarkComparison = async (profile: BusinessProfile, documentId?: string): Promise<PolicyBenchmark> => {
  throw new Error("This function has been deprecated for security reasons. Use appropriate functions from chatpdf-api.ts instead.");
};