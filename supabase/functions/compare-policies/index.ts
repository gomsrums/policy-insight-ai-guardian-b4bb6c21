import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PolicyInput {
  name: string;
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { policy1, policy2 } = await req.json() as { policy1: PolicyInput; policy2: PolicyInput };

    if (!policy1?.content || !policy2?.content) {
      return new Response(
        JSON.stringify({ success: false, error: 'Both policies are required for comparison' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Comparing policies: ${policy1.name} vs ${policy2.name}`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert insurance policy analyst specializing in side-by-side policy comparison.

Compare the two insurance policies and provide a detailed analysis in the following JSON format:

{
  "success": true,
  "policy1": {
    "name": "Policy name",
    "provider": "Insurance company name",
    "type": "Policy type (Auto/Home/Health/Life/etc.)",
    "premium": {
      "annual": number,
      "monthly": number or null,
      "currency": "USD/GBP/INR/EUR"
    },
    "overallScore": number (0-100),
    "riskLevel": "Low/Medium/High",
    "strengths": ["Array of key strengths"],
    "weaknesses": ["Array of key weaknesses"],
    "coverages": [
      {
        "type": "Coverage type",
        "limit": "Coverage limit",
        "status": "Covered/Partial/Not Covered",
        "deductible": "Deductible amount if applicable"
      }
    ],
    "exclusions": ["Array of notable exclusions"]
  },
  "policy2": {
    // Same structure as policy1
  },
  "comparison": {
    "winner": "policy1" or "policy2" or "tie",
    "winnerName": "Name of winning policy",
    "scoreDifference": number,
    "summary": "2-3 sentence summary of the comparison",
    "detailedAnalysis": "Detailed paragraph explaining the comparison",
    "coverageComparison": [
      {
        "type": "Coverage type",
        "policy1": { "status": "Covered/Partial/Not Covered", "limit": "limit", "notes": "any notes" },
        "policy2": { "status": "Covered/Partial/Not Covered", "limit": "limit", "notes": "any notes" },
        "betterPolicy": "policy1" or "policy2" or "equal"
      }
    ],
    "recommendations": [
      {
        "priority": "High/Medium/Low",
        "advice": "Specific recommendation based on comparison"
      }
    ],
    "costAnalysis": {
      "priceDifference": "Description of price difference",
      "valueForMoney": "Which policy offers better value and why"
    }
  }
}

Comparison guidelines:
1. Extract all coverage types from both policies
2. Compare limits, deductibles, and conditions for each coverage type
3. Consider premium costs relative to coverage provided
4. Identify unique benefits in each policy
5. Evaluate exclusions and their impact
6. Provide actionable recommendations for the policyholder
7. Score policies objectively (0-100) based on coverage breadth, value, and risk protection

Return ONLY valid JSON, no additional text.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Compare these two insurance policies:\n\n--- POLICY 1: ${policy1.name} ---\n${policy1.content.substring(0, 12000)}\n\n--- POLICY 2: ${policy2.name} ---\n${policy2.content.substring(0, 12000)}` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'Payment required. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse the JSON response
    let comparisonResult;
    try {
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3);
      }
      
      comparisonResult = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Return a fallback structure
      comparisonResult = {
        success: true,
        policy1: {
          name: policy1.name,
          overallScore: 70,
          riskLevel: 'Medium',
          strengths: ['Unable to fully parse - review manually'],
          weaknesses: [],
          coverages: [],
          exclusions: []
        },
        policy2: {
          name: policy2.name,
          overallScore: 70,
          riskLevel: 'Medium',
          strengths: ['Unable to fully parse - review manually'],
          weaknesses: [],
          coverages: [],
          exclusions: []
        },
        comparison: {
          winner: 'tie',
          winnerName: 'Unable to determine',
          scoreDifference: 0,
          summary: 'Manual review recommended for accurate comparison.',
          detailedAnalysis: content.substring(0, 1000),
          coverageComparison: [],
          recommendations: [{
            priority: 'High',
            advice: 'Please have an insurance professional review both policies for accurate comparison.'
          }],
          costAnalysis: {
            priceDifference: 'Unable to determine',
            valueForMoney: 'Manual review required'
          }
        }
      };
    }

    comparisonResult.success = true;
    
    console.log('Comparison completed:', comparisonResult.comparison?.winner);

    return new Response(
      JSON.stringify(comparisonResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Policy comparison error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to compare policies'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
