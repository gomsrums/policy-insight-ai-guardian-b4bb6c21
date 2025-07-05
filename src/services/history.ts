import { supabase } from "@/integrations/supabase/client";
import { AnalysisResult, ChatMessage } from "@/lib/chatpdf-types";

export async function saveAnalysisResultHistory(result: AnalysisResult) {
  if (!result?.document_id) return;
  await supabase.from("analysis_history").insert({
    document_id: result.document_id,
    summary: result.summary,
    risk_level: result.risk_assessment?.overall_risk_level || null,
  });
}

export async function getAnalysisResultsHistory(documentId: string) {
  const { data, error } = await supabase
    .from("analysis_history")
    .select("*")
    .eq("document_id", documentId)
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) {
    console.error("Error loading analysis history:", error);
    return [];
  }
  return data || [];
}

// Keep these functions for backward compatibility but they won't be used by ChatInterface anymore
export async function saveChatMessage(documentId: string, chatMessage: ChatMessage) {
  // This function is kept for backward compatibility but not used by the new ChatInterface
  console.log("Note: Chat messages are now stored temporarily in memory only");
}

export async function getChatHistory(documentId: string) {
  // This function is kept for backward compatibility but not used by the new ChatInterface
  console.log("Note: Chat history is now loaded from temporary memory storage");
  return [];
}
