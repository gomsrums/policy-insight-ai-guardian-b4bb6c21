import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecommendationRequest {
  policyType: string;
  monthlyPremium: number;
  coverageAmount: number;
  deductible: number;
  country: string;
  additionalDetails?: string;
  scores: {
    affordability: number;
    coverage: number;
    deductible: number;
    value: number;
  };
  benchmarks: {
    averagePremium: number;
    recommendedCoverage: number;
    optimalDeductible: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: RecommendationRequest = await req.json();
    const hfToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
    
    if (!hfToken) {
      throw new Error('Hugging Face API token not configured');
    }

    // Create a comprehensive analysis prompt
    const analysisPrompt = createAnalysisPrompt(data);

    const response = await fetch(
      'https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3.1-70B-Instruct',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: analysisPrompt,
          parameters: {
            max_new_tokens: 800,
            temperature: 0.1,
            do_sample: false,
            return_full_text: false
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HF API error: ${response.status}`);
    }

    const result = await response.json();
    let recommendations = result[0]?.generated_text || '';
    
    // Clean up the response and format it properly
    recommendations = recommendations.trim();
    
    // Split into actionable recommendations
    const recommendationList = recommendations
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '').replace(/^[\-\*]\s*/, '').trim())
      .filter(line => line.length > 10); // Filter out very short lines

    return new Response(JSON.stringify({ 
      recommendations: recommendationList,
      analysis: recommendations 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating recommendations:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate recommendations',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function createAnalysisPrompt(data: RecommendationRequest): string {
  const countryNames: Record<string, string> = {
    US: 'United States', UK: 'United Kingdom', CA: 'Canada', AU: 'Australia',
    DE: 'Germany', FR: 'France', IN: 'India', JP: 'Japan', SG: 'Singapore'
  };

  const countryName = countryNames[data.country] || data.country;
  const annualPremium = data.monthlyPremium * 12;
  
  return `You are an expert insurance advisor analyzing a ${data.policyType} insurance policy for a client in ${countryName}.

CLIENT'S POLICY DETAILS:
- Policy Type: ${data.policyType} insurance
- Monthly Premium: $${data.monthlyPremium} (Annual: $${annualPremium})
- Coverage Amount: $${data.coverageAmount.toLocaleString()}
- Deductible: $${data.deductible}
- Country: ${countryName}
${data.additionalDetails ? `- Additional Context: ${data.additionalDetails}` : ''}

CURRENT ANALYSIS SCORES (out of 10):
- Affordability: ${data.scores.affordability}/10
- Coverage Adequacy: ${data.scores.coverage}/10
- Deductible Optimization: ${data.scores.deductible}/10
- Value for Money: ${data.scores.value}/10

${countryName.toUpperCase()} MARKET BENCHMARKS:
- Average Premium: $${data.benchmarks.averagePremium}/year
- Recommended Coverage: $${data.benchmarks.recommendedCoverage.toLocaleString()}
- Optimal Deductible: $${data.benchmarks.optimalDeductible}

TASK: Provide 5-8 specific, actionable recommendations tailored to this client's situation. Consider:
1. Their specific financial situation and policy details
2. ${countryName} insurance regulations and market conditions
3. Areas where scores are low and need improvement
4. Cost optimization opportunities
5. Coverage gaps or risks specific to their situation
6. Any concerns mentioned in additional details

Format your response as a numbered list of specific recommendations. Each recommendation should be practical and actionable, not generic advice. Focus on this client's unique situation.`;
}