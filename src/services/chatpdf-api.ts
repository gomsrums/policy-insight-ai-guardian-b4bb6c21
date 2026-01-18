// This file is now a re-export from the new policy-api.ts
// Kept for backwards compatibility with existing imports

import { 
  analyzePolicy as uploadDocumentForAnalysis,
  PolicyDocument,
  AnalysisResult
} from "@/services/policy-api";
import { supabase } from "@/integrations/supabase/client";

// Re-export the new function with the old name for backwards compatibility
export { uploadDocumentForAnalysis };
export type { PolicyDocument, AnalysisResult };

/**
 * Send a chat message about a policy document
 * Uses Lovable AI (Gemini) through the chat-with-policy edge function
 */
export const sendChatMessage = async (documentId: string, question: string): Promise<string> => {
  try {
    console.log("Sending chat message...");

    const { data, error } = await supabase.functions.invoke('chat-with-policy', {
      body: {
        document_id: documentId,
        question: question
      }
    });

    if (error) {
      console.error("Chat error:", error);
      throw new Error(`Chat failed: ${error.message}`);
    }

    if (!data.success) {
      throw new Error(data.error || "Chat failed");
    }

    return data.response;
  } catch (error) {
    console.error("Error sending chat message:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred while chatting.");
  }
};
