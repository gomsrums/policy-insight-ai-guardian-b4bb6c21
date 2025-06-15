
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

export async function saveChatMessage(documentId: string, chatMessage: ChatMessage) {
  await supabase.from("chat_history").insert({
    document_id: documentId,
    sender: chatMessage.role,
    message: chatMessage.content,
    timestamp: chatMessage.timestamp.toISOString(),
  });
}

export async function getChatHistory(documentId: string) {
  const { data, error } = await supabase
    .from("chat_history")
    .select("*")
    .eq("document_id", documentId)
    .order("timestamp", { ascending: true });
  if (error) {
    console.error("Error loading chat history:", error);
    return [];
  }
  return (data || []).map((msg: any) => ({
    id: msg.id,
    role: msg.sender,
    content: msg.message,
    timestamp: new Date(msg.timestamp),
  })) as ChatMessage[];
}
