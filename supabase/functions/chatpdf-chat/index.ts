import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const chatpdfApiKey = Deno.env.get('CHATPDF_API_KEY');

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { document_id, question } = body;

    if (!document_id || !question) {
      return new Response(JSON.stringify({ error: "Missing document_id or question" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!chatpdfApiKey) {
      return new Response(JSON.stringify({ error: "ChatPDF API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Sending chat message to ChatPDF for document:", document_id);

    // Send chat message to ChatPDF
    const chatResponse = await fetch("https://api.chatpdf.com/v1/chats/message", {
      method: "POST",
      headers: {
        "x-api-key": chatpdfApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sourceId: document_id,
        messages: [
          {
            role: "user",
            content: question,
          },
        ],
      }),
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      console.error("ChatPDF chat failed:", errorText);
      throw new Error(`ChatPDF chat failed: ${errorText}`);
    }

    const chatData = await chatResponse.json();
    console.log("ChatPDF chat response:", chatData);

    return new Response(JSON.stringify({ 
      success: true,
      response: chatData.content || "I couldn't process your question. Please try rephrasing it."
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in chatpdf-chat:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});