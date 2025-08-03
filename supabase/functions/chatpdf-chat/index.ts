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
    // Validate request size
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 1024 * 1024) { // 1MB limit for chat
      return new Response(JSON.stringify({ error: 'Request too large' }), {
        status: 413,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { document_id, question } = body;

    // Input validation
    if (!document_id || typeof document_id !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid document ID' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!question || typeof question !== 'string' || question.length > 2000) {
      return new Response(JSON.stringify({ error: 'Invalid question' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Sanitize inputs
    const sanitizedDocumentId = document_id.replace(/[^\w-]/gi, '').trim();
    const sanitizedQuestion = question.trim().substring(0, 2000);

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

    // Send chat message to ChatPDF with timeout
    const chatController = new AbortController();
    const chatTimeout = setTimeout(() => chatController.abort(), 30000); // 30s timeout
    
    const chatResponse = await fetch("https://api.chatpdf.com/v1/chats/message", {
      method: "POST",
      headers: {
        "x-api-key": chatpdfApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sourceId: sanitizedDocumentId,
        messages: [
          {
            role: "user",
            content: sanitizedQuestion,
          },
        ],
      }),
      signal: chatController.signal
    });
    
    clearTimeout(chatTimeout);

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