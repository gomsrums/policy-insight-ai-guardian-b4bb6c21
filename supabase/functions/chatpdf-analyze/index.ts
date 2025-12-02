import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request size (max 10MB)
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'Request too large' }), {
        status: 413,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { document_content, document_name } = body;

    // Input validation
    if (!document_content || typeof document_content !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid document content' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const docName = document_name && typeof document_name === 'string' ? document_name : 'uploaded-document.pdf';

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not found in environment");
      return new Response(JSON.stringify({ 
        success: false,
        error: "Lovable AI API key not configured" 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Starting Lovable AI analysis for:", docName, "Content length:", document_content.length);

    // Truncate content if too long (Lovable AI has context limits)
    const maxContentLength = 100000; // ~100K chars
    const truncatedContent = document_content.length > maxContentLength 
      ? document_content.substring(0, maxContentLength) + "\n\n[Document truncated due to length...]"
      : document_content;

    const analysisPrompt = `You are an expert insurance policy analyst. Analyze this insurance policy document and provide a comprehensive analysis.

DOCUMENT NAME: ${docName}

DOCUMENT CONTENT:
${truncatedContent}

Provide your analysis in the following JSON format ONLY (no additional text before or after):

{
  "summary": "Comprehensive summary of the policy in 2-3 sentences",
  "gaps": [
    "List of coverage gaps and exclusions as individual strings"
  ],
  "recommendations": [
    "List of specific recommendations to improve coverage"
  ],
  "risk_assessment": {
    "overall_risk_level": "Low/Medium/High",
    "risk_factors": ["List of identified risk factors"],
    "mitigation_strategies": ["List of strategies to mitigate risks"]
  },
  "coverage_analysis": [
    {
      "type": "Coverage type name",
      "status": "Covered/Partial/Not Covered/Excluded",
      "limit": "Coverage limit if mentioned",
      "notes": "Additional notes about this coverage"
    }
  ]
}

Focus on:
- Missing coverage types typical for this type of insurance
- Exclusions and limitations
- Insufficient coverage limits
- Deductible analysis
- Premium optimization opportunities
- Regulatory compliance gaps

Return ONLY the JSON object.`;

    // Call Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an expert insurance policy analyst. Always respond with valid JSON only, no markdown formatting."
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI request failed:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          success: false,
          error: "Rate limit exceeded. Please try again in a moment." 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          success: false,
          error: "AI credits exhausted. Please add credits to continue." 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ 
        success: false,
        error: `AI analysis failed: ${errorText.substring(0, 200)}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await response.json();
    console.log("Lovable AI response received");

    const content = aiResponse.choices?.[0]?.message?.content || "";
    console.log("AI response content (first 500 chars):", content.substring(0, 500));

    let analysisResult;
    try {
      // Clean the response - remove markdown code blocks if present
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      analysisResult = JSON.parse(cleanContent);
    } catch (parseError) {
      console.warn("Failed to parse JSON response, using fallback format:", parseError);
      
      // Fallback: create structured response from text
      analysisResult = {
        summary: content.substring(0, 300) + "...",
        gaps: extractBulletPoints(content, "gap"),
        recommendations: extractBulletPoints(content, "recommend"),
        risk_assessment: {
          overall_risk_level: "Medium",
          risk_factors: extractBulletPoints(content, "risk"),
          mitigation_strategies: extractBulletPoints(content, "mitig")
        },
        coverage_analysis: []
      };
    }

    // Generate a unique document ID
    const documentId = `lovable-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Return the structured analysis result
    const result = {
      success: true,
      document_id: documentId,
      is_insurance_policy: true,
      summary: analysisResult.summary || "Policy analysis completed",
      gaps: analysisResult.gaps || [],
      recommendations: analysisResult.recommendations || [],
      risk_assessment: analysisResult.risk_assessment || {
        overall_risk_level: "Medium",
        risk_factors: [],
        mitigation_strategies: []
      },
      coverage_analysis: analysisResult.coverage_analysis || [],
      overpayments: []
    };

    console.log("Returning analysis result");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in chatpdf-analyze:", error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const isTimeout = errorMessage.includes('abort') || errorMessage.includes('timeout');
    
    return new Response(JSON.stringify({ 
      success: false,
      error: isTimeout ? 'Request timed out - document may be too large' : `Analysis failed: ${errorMessage}`
    }), {
      status: isTimeout ? 408 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Helper function to extract bullet points from text
function extractBulletPoints(text: string, keyword: string): string[] {
  const lines = text.split('\n');
  const points: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.toLowerCase().includes(keyword) && (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\./.test(trimmed))) {
      const cleaned = trimmed.replace(/^[•\-*\d.]+\s*/, '').trim();
      if (cleaned.length > 10) {
        points.push(cleaned);
      }
    }
  }
  
  return points.slice(0, 5);
}
