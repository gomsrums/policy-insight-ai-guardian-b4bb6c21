
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
    console.log('Starting insurance analysis request');
    
    const requestData = await req.json();
    console.log('Request data received:', { 
      action: requestData.action, 
      contentLength: requestData.document_content?.length 
    });
    
    const { action, document_content, question } = requestData;

    if (!hfApiKey) {
      console.error('Hugging Face API key not configured');
      throw new Error('Hugging Face API key not configured');
    }

    console.log('Hugging Face API key found, length:', hfApiKey.length);

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

    console.log('Making request to Hugging Face API with model: bitext/Mistral-7B-Insurance');
    console.log('Prompt length:', prompt.length);

    const hfResponse = await fetch('https://api-inference.huggingface.co/models/bitext/Mistral-7B-Insurance', {
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

    console.log('Hugging Face API response status:', hfResponse.status);
    console.log('Hugging Face API response headers:', Object.fromEntries(hfResponse.headers.entries()));

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error('Hugging Face API error:', errorText);
      throw new Error(`Hugging Face API error: ${hfResponse.status} - ${errorText}`);
    }

    const data = await hfResponse.json();
    console.log('Hugging Face API response data structure:', typeof data, Array.isArray(data));
    console.log('Hugging Face API response:', data);
    
    let responseText = '';
    
    if (Array.isArray(data) && data.length > 0) {
      responseText = data[0].generated_text || data[0].text || '';
      console.log('Extracted response from array:', responseText.length, 'characters');
    } else if (data.generated_text) {
      responseText = data.generated_text;
      console.log('Extracted response from object:', responseText.length, 'characters');
    } else if (typeof data === 'string') {
      responseText = data;
      console.log('Response is string:', responseText.length, 'characters');
    } else {
      console.error('Unexpected response format:', data);
      responseText = 'Analysis completed successfully, but response format was unexpected.';
    }

    if (!responseText || responseText.trim().length === 0) {
      console.error('Empty response from Hugging Face API');
      responseText = 'Analysis completed but no detailed response was generated. Please try again.';
    }

    const result = { 
      response: responseText,
      document_id: `hf-${Date.now()}` // Generate a unique document ID
    };
    
    console.log('Sending final response:', { 
      responseLength: result.response.length,
      documentId: result.document_id 
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in insurance-analysis-hf function:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
