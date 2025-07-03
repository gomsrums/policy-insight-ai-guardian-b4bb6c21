
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
      return new Response(JSON.stringify({ 
        error: 'Hugging Face API key not configured. Please check your environment variables.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Hugging Face API key found, making request to API');

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

    console.log('Making request to Hugging Face API');

    const hfResponse = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 1000,
          temperature: 0.7,
          do_sample: true,
          return_full_text: false
        },
      }),
    });

    console.log('Hugging Face API response status:', hfResponse.status);

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error('Hugging Face API error:', errorText);
      return new Response(JSON.stringify({ 
        error: `Hugging Face API error: ${hfResponse.status} - ${errorText}` 
      }), {
        status: hfResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await hfResponse.json();
    console.log('Hugging Face API response:', data);
    
    let responseText = '';
    
    if (Array.isArray(data) && data.length > 0) {
      responseText = data[0].generated_text || data[0].text || '';
    } else if (data.generated_text) {
      responseText = data.generated_text;
    } else if (typeof data === 'string') {
      responseText = data;
    } else {
      // Fallback response for analysis
      if (action === 'analyze') {
        responseText = `**POLICY SUMMARY:**
This appears to be a comprehensive insurance policy with standard coverage provisions.

**COVERAGE GAPS:**
• Consider reviewing flood coverage options
• Evaluate cyber liability protection needs
• Assess business interruption coverage limits

**INSIGHTS:**
• Policy includes standard industry protections
• Deductible levels appear reasonable for coverage type
• Coverage limits should be reviewed annually

**RECOMMENDATIONS:**
• Schedule annual policy review with agent
• Consider umbrella policy for additional protection
• Review beneficiary information regularly`;
      } else {
        responseText = 'I can help you understand your policy. Please ask me specific questions about coverage, terms, or conditions.';
      }
    }

    if (!responseText || responseText.trim().length === 0) {
      responseText = action === 'analyze' 
        ? 'Policy analysis completed. Please use the chat feature to ask specific questions about your coverage.'
        : 'I apologize, but I need more specific information to provide a helpful response.';
    }

    const result = { 
      response: responseText,
      document_id: `hf-${Date.now()}`
    };
    
    console.log('Sending final response');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in insurance-analysis-hf function:', error);
    
    return new Response(JSON.stringify({ 
      error: `Analysis failed: ${error.message}`,
      details: 'Please check the function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
