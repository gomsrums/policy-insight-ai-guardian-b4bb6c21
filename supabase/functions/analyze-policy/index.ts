import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { document_content, document_name, analysis_type } = await req.json();

    if (!document_content) {
      return new Response(
        JSON.stringify({ success: false, error: 'Document content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing document: ${document_name || 'unnamed'}, type: ${analysis_type || 'comprehensive'}`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert insurance policy analyst. Analyze the provided insurance policy document and extract comprehensive information.

Your task is to analyze the policy and return a JSON response with the following structure:

{
  "success": true,
  "document_id": "generated-uuid",
  "is_insurance_policy": boolean,
  "summary": "A 2-3 paragraph summary of the policy, including key coverage, limits, and notable exclusions",
  "gaps": ["Array of identified coverage gaps or concerning issues"],
  "overpayments": ["Array of areas where the policyholder might be overpaying"],
  "recommendations": [
    {
      "priority": "High" | "Medium" | "Low",
      "category": "string (e.g., Coverage, Deductible, Premium, Risk)",
      "issue": "Brief description of the issue",
      "recommendation": "Specific recommendation",
      "impact": "Potential impact of implementing this",
      "estimatedCost": "Estimated cost implication or 'Contact agent'"
    }
  ],
  "coverage_analysis": [
    {
      "type": "Coverage type name",
      "status": "Covered" | "Partial" | "Not Covered" | "Excluded",
      "limit": "Coverage limit if applicable",
      "notes": "Additional details",
      "risk": "High" | "Medium" | "Low"
    }
  ],
  "overallScore": number (0-100, where 100 is excellent coverage),
  "riskLevel": "Low" | "Medium" | "High",
  "risk_assessment": {
    "overall_risk_level": "Low" | "Medium" | "High",
    "risk_factors": ["Array of identified risk factors"],
    "mitigation_strategies": ["Array of suggested mitigations"]
  }
}

Analysis guidelines:
1. Look for common coverage types: Liability, Property, Medical, Collision, Comprehensive, Personal Injury, etc.
2. Identify exclusions and limitations clearly
3. Evaluate deductibles relative to coverage
4. Check for gaps in coverage based on standard insurance needs
5. Assess overall value for premium paid
6. Provide actionable recommendations
7. If the document is not an insurance policy, set is_insurance_policy to false

Return ONLY valid JSON, no additional text or markdown.`;

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
          { role: 'user', content: `Analyze this insurance policy document:\n\n${document_content.substring(0, 25000)}` }
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
    let analysisResult;
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3);
      }
      
      analysisResult = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', content.substring(0, 500));
      // Return a fallback structure
      analysisResult = {
        success: true,
        document_id: crypto.randomUUID(),
        is_insurance_policy: true,
        summary: content.substring(0, 1000),
        gaps: ['Unable to fully parse policy - manual review recommended'],
        overpayments: [],
        recommendations: [{
          priority: 'Medium',
          category: 'Review',
          issue: 'Policy requires manual review',
          recommendation: 'Please have an insurance professional review this policy',
          impact: 'Ensure complete coverage understanding',
          estimatedCost: 'Contact agent'
        }],
        coverage_analysis: [],
        overallScore: 50,
        riskLevel: 'Medium',
        risk_assessment: {
          overall_risk_level: 'Medium',
          risk_factors: ['Policy parsing incomplete'],
          mitigation_strategies: ['Manual professional review recommended']
        }
      };
    }

    // Ensure all required fields exist
    analysisResult.success = true;
    analysisResult.document_id = analysisResult.document_id || crypto.randomUUID();
    analysisResult.is_insurance_policy = analysisResult.is_insurance_policy !== false;
    analysisResult.summary = analysisResult.summary || 'Policy analysis completed.';
    analysisResult.gaps = Array.isArray(analysisResult.gaps) ? analysisResult.gaps : [];
    analysisResult.overpayments = Array.isArray(analysisResult.overpayments) ? analysisResult.overpayments : [];
    analysisResult.recommendations = Array.isArray(analysisResult.recommendations) ? analysisResult.recommendations : [];
    analysisResult.coverage_analysis = Array.isArray(analysisResult.coverage_analysis) ? analysisResult.coverage_analysis : [];
    analysisResult.overallScore = typeof analysisResult.overallScore === 'number' ? analysisResult.overallScore : 70;
    analysisResult.riskLevel = analysisResult.riskLevel || 'Medium';
    analysisResult.risk_assessment = analysisResult.risk_assessment || {
      overall_risk_level: analysisResult.riskLevel,
      risk_factors: [],
      mitigation_strategies: []
    };

    console.log('Analysis completed successfully for:', document_name);

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Policy analysis error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze policy',
        document_id: crypto.randomUUID(),
        is_insurance_policy: false,
        summary: 'Analysis failed - please try again',
        gaps: [],
        overpayments: [],
        recommendations: [],
        coverage_analysis: [],
        overallScore: 0,
        riskLevel: 'High',
        risk_assessment: {
          overall_risk_level: 'High',
          risk_factors: ['Analysis failed'],
          mitigation_strategies: ['Retry analysis or contact support']
        }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
