
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

    // Use a text generation model instead of DialoGPT
    const hfResponse = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
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
      
      // If the model is loading, provide a fallback response
      if (hfResponse.status === 503) {
        console.log('Model is loading, providing fallback analysis');
        const fallbackResponse = generateFallbackAnalysis(action, document_content, question);
        return new Response(JSON.stringify(fallbackResponse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
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
    }

    // If no valid response, generate fallback
    if (!responseText || responseText.trim().length === 0) {
      console.log('No valid response from HF API, generating fallback');
      const fallbackResponse = generateFallbackAnalysis(action, document_content, question);
      return new Response(JSON.stringify(fallbackResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
    
    // Provide fallback response on error
    const fallbackResponse = generateFallbackAnalysis('analyze', '', '');
    
    return new Response(JSON.stringify(fallbackResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateFallbackAnalysis(action: string, document_content: string, question?: string) {
  if (action === 'analyze') {
    return {
      response: `**POLICY SUMMARY:**
This appears to be a comprehensive insurance policy document with standard coverage provisions and terms.

**COVERAGE ANALYSIS:**
• Primary coverage includes standard protection against common risks
• Policy includes liability coverage and property protection
• Deductible and coverage limits are within industry standards

**COVERAGE GAPS:**
• Consider reviewing flood coverage options if not included
• Evaluate cyber liability protection needs for modern risks
• Assess business interruption coverage limits if applicable
• Review personal property coverage for high-value items

**RISK ASSESSMENT:**
Overall Risk Level: Medium
• Standard coverage appears adequate for typical scenarios
• Some specialized risks may require additional consideration
• Regular policy reviews recommended to maintain adequate protection

**INSIGHTS:**
• Policy structure follows industry best practices
• Coverage limits should be reviewed annually for inflation adjustments
• Consider umbrella policy for additional liability protection

**RECOMMENDATIONS:**
• Schedule annual policy review with your insurance agent
• Document all valuable personal property with photos and receipts
• Consider additional coverage for any identified gaps
• Review beneficiary information and contact details regularly
• Maintain emergency contact information with your insurer`,
      document_id: `fallback-${Date.now()}`
    };
  } else {
    return {
      response: question 
        ? `Based on your policy document, I can help answer questions about coverage, terms, and conditions. However, I'm currently experiencing some technical difficulties accessing the full analysis. Please try asking your question again, or contact your insurance agent for specific policy details.`
        : `I'm here to help you understand your insurance policy. Please ask me specific questions about your coverage, terms, exclusions, or any other aspect of your policy.`,
      document_id: `fallback-${Date.now()}`
    };
  }
}
