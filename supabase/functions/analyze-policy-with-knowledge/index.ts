
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentText, knowledgeContext, chunks } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `
You are an expert insurance policy analyzer. Analyze the provided insurance policy using the knowledge base context for reference.

KNOWLEDGE BASE CONTEXT:
${knowledgeContext}

POLICY DOCUMENT:
${documentText}

ADDITIONAL CONTEXT:
${chunks ? chunks.join('\n\n') : ''}

Please provide a comprehensive analysis with the following structure:

1. SUMMARY: Brief overview of the policy and its main coverage areas
2. COVERAGE GAPS: Identify what's missing compared to industry standards
3. OVERPAYMENTS: Areas where the client might be paying too much
4. RECOMMENDATIONS: Specific suggestions for improvement
5. RISK ASSESSMENT: Overall risk level and specific risk factors
6. MITIGATION STRATEGIES: Ways to address identified risks

Format your response as JSON with these fields:
{
  "summary": "...",
  "gaps": ["gap1", "gap2", ...],
  "overpayments": ["overpayment1", "overpayment2", ...],
  "recommendations": ["rec1", "rec2", ...],
  "risk_level": "Low|Medium|High",
  "risk_factors": ["factor1", "factor2", ...],
  "mitigation_strategies": ["strategy1", "strategy2", ...]
}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert insurance policy analyzer. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const analysis = JSON.parse(content);
      return new Response(JSON.stringify({ analysis }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      // Fallback if JSON parsing fails
      return new Response(JSON.stringify({ 
        analysis: {
          summary: content,
          gaps: [],
          overpayments: [],
          recommendations: [],
          risk_level: "Medium",
          risk_factors: [],
          mitigation_strategies: []
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in analyze-policy-with-knowledge:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
