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

const CHATPDF_API_KEY = "sec_t759nqrP5IPLQM9ssZXIx0aHIK0hiv3k";
const CHATPDF_BASE_URL = "https://api.chatpdf.com/v1";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: RecommendationRequest = await req.json();
    
    if (!CHATPDF_API_KEY) {
      throw new Error('ChatPDF API key not configured');
    }

    // Create a temporary document with the policy analysis data
    const policyAnalysisText = createPolicyAnalysisDocument(data);
    
    // Upload the policy analysis as a text document to ChatPDF
    const formData = new FormData();
    const textFile = new Blob([policyAnalysisText], { type: "text/plain" });
    formData.append("file", textFile, "policy-analysis.txt");

    const uploadResponse = await fetch(`${CHATPDF_BASE_URL}/sources/add-file`, {
      method: "POST",
      headers: {
        "x-api-key": CHATPDF_API_KEY,
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.text();
      throw new Error(`ChatPDF upload failed: ${uploadResponse.status} - ${errorData}`);
    }

    const uploadData = await uploadResponse.json();
    const sourceId = uploadData.sourceId;

    if (!sourceId) {
      throw new Error("No source ID returned from ChatPDF upload");
    }

    // Create a comprehensive analysis prompt
    const analysisPrompt = createAnalysisPrompt(data);

    const response = await fetch(`${CHATPDF_BASE_URL}/chats/message`, {
      method: "POST",
      headers: {
        "x-api-key": CHATPDF_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sourceId: sourceId,
        messages: [
          {
            role: "user",
            content: analysisPrompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`ChatPDF analysis failed: ${response.status} - ${errorData}`);
    }

    const result = await response.json();
    let recommendations = result.content || '';
    
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

function createPolicyAnalysisDocument(data: RecommendationRequest): string {
  const countryNames: Record<string, string> = {
    US: 'United States', UK: 'United Kingdom', CA: 'Canada', AU: 'Australia',
    DE: 'Germany', FR: 'France', IN: 'India', JP: 'Japan', SG: 'Singapore'
  };

  const countryName = countryNames[data.country] || data.country;
  const annualPremium = data.monthlyPremium * 12;
  
  return `INSURANCE POLICY ANALYSIS REPORT

POLICY DETAILS:
- Policy Type: ${data.policyType} insurance
- Monthly Premium: $${data.monthlyPremium} (Annual: $${annualPremium})
- Coverage Amount: $${data.coverageAmount.toLocaleString()}
- Deductible: $${data.deductible}
- Country: ${countryName}
${data.additionalDetails ? `- Additional Context: ${data.additionalDetails}` : ''}

CURRENT ANALYSIS SCORES (out of 10):
- Affordability Score: ${data.scores.affordability}/10
- Coverage Adequacy Score: ${data.scores.coverage}/10
- Deductible Optimization Score: ${data.scores.deductible}/10
- Value for Money Score: ${data.scores.value}/10

${countryName.toUpperCase()} MARKET BENCHMARKS:
- Average Premium in Market: $${data.benchmarks.averagePremium}/year
- Recommended Coverage Amount: $${data.benchmarks.recommendedCoverage.toLocaleString()}
- Optimal Deductible Range: $${data.benchmarks.optimalDeductible}

AREAS FOR ANALYSIS:
This policy analysis document provides the foundation for generating personalized recommendations based on the client's specific situation, market conditions, and identified gaps or opportunities for improvement.
`;
}

function createAnalysisPrompt(data: RecommendationRequest): string {
  const countryNames: Record<string, string> = {
    US: 'United States', UK: 'United Kingdom', CA: 'Canada', AU: 'Australia',
    DE: 'Germany', FR: 'France', IN: 'India', JP: 'Japan', SG: 'Singapore'
  };

  const countryName = countryNames[data.country] || data.country;
  
  return `You are an expert insurance advisor analyzing this ${data.policyType} insurance policy for a client in ${countryName}.

Based on the policy analysis document provided, please generate 5-8 specific, actionable recommendations tailored to this client's situation. Consider:

1. Their specific financial situation and policy details
2. ${countryName} insurance regulations and market conditions
3. Areas where scores are low and need improvement
4. Cost optimization opportunities
5. Coverage gaps or risks specific to their situation
6. Any concerns mentioned in additional details

TASK: Provide specific, actionable recommendations. Each recommendation should be practical and actionable, not generic advice. Focus on this client's unique situation based on their scores, premiums, coverage amounts, and country-specific factors.

Format your response as a numbered list of specific recommendations. Be direct and actionable.`;
}