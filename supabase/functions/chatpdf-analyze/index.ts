import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const chatpdfApiKey = Deno.env.get('CHATPDF_API_KEY');

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
    const { document_content, document_name, analysis_type = "comprehensive" } = body;

    // Input validation - make document_name optional
    if (!document_content || typeof document_content !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid document content' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Document name is optional, provide default if missing
    const docName = document_name && typeof document_name === 'string' ? document_name : 'uploaded-document.pdf';
    if (docName.length > 255) {
      return new Response(JSON.stringify({ error: 'Document name too long' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Sanitize inputs - be more lenient with content size for PDFs
    const sanitizedContent = document_content.trim().substring(0, 500000); // Increased to 500KB for PDFs
    const sanitizedName = docName.replace(/[^\w\s.-]/gi, '').trim().substring(0, 255) || 'document.pdf';

    if (!chatpdfApiKey) {
      return new Response(JSON.stringify({ error: "ChatPDF API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Starting ChatPDF analysis for:", sanitizedName);

    // Step 1: Upload document to ChatPDF with timeout
    const formData = new FormData();
    const textFile = new Blob([sanitizedContent], { type: "application/pdf" });
    formData.append("file", textFile, sanitizedName);

    const uploadController = new AbortController();
    const uploadTimeout = setTimeout(() => uploadController.abort(), 45000); // Increased to 45s for large PDFs
    
    const uploadResponse = await fetch("https://api.chatpdf.com/v1/sources/add-file", {
      method: "POST",
      headers: {
        "x-api-key": chatpdfApiKey,
      },
      body: formData,
      signal: uploadController.signal
    });
    
    clearTimeout(uploadTimeout);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error("ChatPDF upload failed:", errorText);
      throw new Error(`ChatPDF upload failed: ${errorText}`);
    }

    const uploadData = await uploadResponse.json();
    const sourceId = uploadData.sourceId;

    console.log("Document uploaded to ChatPDF with sourceId:", sourceId);

    // Step 2: Generate comprehensive analysis
    const analysisPrompt = `
    Analyze this insurance policy document and provide a comprehensive analysis in the following JSON format:

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

    Return ONLY the JSON object, no additional text.
    `;

    // Send analysis prompt with timeout
    const analysisController = new AbortController();
    const analysisTimeout = setTimeout(() => analysisController.abort(), 60000); // 60s timeout
    
    const analysisResponse = await fetch("https://api.chatpdf.com/v1/chats/message", {
      method: "POST",
      headers: {
        "x-api-key": chatpdfApiKey,
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
      signal: analysisController.signal
    });
    
    clearTimeout(analysisTimeout);

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error("ChatPDF analysis failed:", errorText);
      throw new Error(`ChatPDF analysis failed: ${errorText}`);
    }

    const analysisData = await analysisResponse.json();
    console.log("ChatPDF analysis response:", analysisData);

    let analysisResult;
    try {
      // Try to parse the JSON response
      const cleanContent = analysisData.content.replace(/```json\n?|\n?```/g, '').trim();
      analysisResult = JSON.parse(cleanContent);
    } catch (parseError) {
      console.warn("Failed to parse JSON response, using fallback format:", parseError);
      
      // Fallback: create structured response from text
      analysisResult = {
        summary: analysisData.content.substring(0, 300) + "...",
        gaps: extractBulletPoints(analysisData.content, "gap"),
        recommendations: extractBulletPoints(analysisData.content, "recommend"),
        risk_assessment: {
          overall_risk_level: "Medium",
          risk_factors: extractBulletPoints(analysisData.content, "risk"),
          mitigation_strategies: extractBulletPoints(analysisData.content, "mitig")
        },
        coverage_analysis: []
      };
    }

    // Return the structured analysis result
    const result = {
      success: true,
      document_id: sourceId,
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
      overpayments: [] // ChatPDF doesn't analyze overpayments
    };

    console.log("Returning analysis result:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in chatpdf-analyze:", error);
    
    // Provide more detailed error information
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
    if (trimmed.includes(keyword) && (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*'))) {
      const cleaned = trimmed.replace(/^[•\-*]\s*/, '').trim();
      if (cleaned.length > 10) {
        points.push(cleaned);
      }
    }
  }
  
  return points.slice(0, 5); // Limit to 5 items
}