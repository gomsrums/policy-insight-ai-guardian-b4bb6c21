
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { policy_text, reference_standards } = body;

    if (!policy_text) {
      return new Response(JSON.stringify({ error: "Missing policy_text" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prepare a prompt for OpenAI
    let prompt = `
You are an expert insurance analyst. Given this insurance policy document, please do:
1. List in bullet points what is NOT covered by this policy (missing coverages, exclusions).
2. List any insufficient coverage limits if mentioned (with numbers if possible).
3. If provided, compare the policy against these reference standards/industry benchmarks and highlight any missing or insufficient coverages compared to standard.
4. Summarize your findings as concise bullet points grouped under: "Missing Coverages", "Critical Exclusions", and "Insufficient Limits".

Policy Document:
${policy_text}

${reference_standards ? `
REFERENCE STANDARDS/INDUSTRY BENCHMARKS:
${reference_standards}
` : ""}
    `.trim();

    // Call OpenAI API
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o", // or gpt-4o-mini for cheaper/faster
        messages: [
          {
            role: "system",
            content: "You help insurance professionals analyze policy documents for missing coverages and regulatory gaps.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 700,
        temperature: 0.5,
      }),
    });

    const aiJson = await openAIResponse.json();
    const message = aiJson?.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ analysis: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in policy-analyze-openai:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
