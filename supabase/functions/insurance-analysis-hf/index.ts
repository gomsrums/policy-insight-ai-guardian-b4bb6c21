
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const hfApiKey = Deno.env.get('HUGGING_FACE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, document_content, question } = await req.json();

    if (!hfApiKey) {
      throw new Error('Hugging Face API key not configured');
    }

    let prompt = '';
    
    if (action === 'analyze') {
      prompt = `As an expert insurance analyst, analyze this insurance policy document and provide a comprehensive analysis:

POLICY DOCUMENT:
${document_content}

Please provide a detailed analysis in the following format:

**POLICY SUMMARY:**
[Provide a clear summary of the policy including policy type, coverage limits, deductibles, and key features]

**COVERAGE ANALYSIS:**
[List all coverages included and their limits]

**COVERAGE GAPS:**
[Identify potential gaps or areas not covered]

**RISK ASSESSMENT:**
[Evaluate the overall risk level (Low/Medium/High) and specific risk factors]

**INSIGHTS:**
[Provide key insights about the policy's strengths and potential issues]

**RECOMMENDATIONS:**
[Suggest improvements or additional coverage considerations]

Please be thorough and specific in your analysis.`;
    } else if (action === 'chat') {
      prompt = `You are an expert insurance assistant. Based on the following policy document, answer the user's question:

POLICY DOCUMENT:
${document_content}

USER QUESTION: ${question}

Please provide a helpful and accurate answer based on the policy information.`;
    }

    const response = await fetch('https://api-inference.huggingface.co/models/bitext/Mistral-7B-Insurance', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.7,
          do_sample: true,
          return_full_text: false
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Hugging Face API error: ${error}`);
    }

    const data = await response.json();
    let responseText = '';
    
    if (Array.isArray(data) && data.length > 0) {
      responseText = data[0].generated_text || data[0].text || '';
    } else if (data.generated_text) {
      responseText = data.generated_text;
    } else {
      responseText = 'Analysis completed successfully.';
    }

    return new Response(JSON.stringify({ 
      response: responseText,
      document_id: `hf-${Date.now()}` // Generate a unique document ID
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in insurance-analysis-hf:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
