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
      console.error("CHATPDF_API_KEY not found in environment");
      return new Response(JSON.stringify({ 
        success: false,
        error: "ChatPDF API key not configured" 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("CHATPDF_API_KEY is configured:", chatpdfApiKey ? 'Yes' : 'No');

    console.log("Starting ChatPDF analysis for:", sanitizedName);

    // Step 1: Upload document to ChatPDF with timeout
    const formData = new FormData();
    
    // Handle PDF content properly - convert to base64 if it's binary data
    let fileBlob;
    try {
      if (sanitizedContent.startsWith('%PDF')) {
        // This is raw PDF content - need to handle binary data properly
        console.log("Processing raw PDF content, length:", sanitizedContent.length);
        
        // For PDF content sent as string, we need to convert it properly
        // First try to decode if it's base64 encoded
        let binaryData;
        try {
          // Check if it might be base64
          if (sanitizedContent.match(/^[A-Za-z0-9+/]+=*$/)) {
            binaryData = Uint8Array.from(atob(sanitizedContent), c => c.charCodeAt(0));
          } else {
            // Treat as raw binary string
            binaryData = new Uint8Array(sanitizedContent.length);
            for (let i = 0; i < sanitizedContent.length; i++) {
              binaryData[i] = sanitizedContent.charCodeAt(i) & 0xFF;
            }
          }
        } catch (e) {
          // If base64 decode fails, treat as raw binary
          binaryData = new Uint8Array(sanitizedContent.length);
          for (let i = 0; i < sanitizedContent.length; i++) {
            binaryData[i] = sanitizedContent.charCodeAt(i) & 0xFF;
          }
        }
        
        fileBlob = new Blob([binaryData], { type: "application/pdf" });
        console.log("Created PDF blob with size:", fileBlob.size);
      } else {
        // This is text content, create as text file for analysis
        console.log("Processing text content, length:", sanitizedContent.length);
        fileBlob = new Blob([sanitizedContent], { type: "text/plain" });
      }
    } catch (blobError) {
      console.error("Error creating file blob:", blobError);
      return new Response(JSON.stringify({ 
        success: false,
        error: "Failed to process document content" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    formData.append("file", fileBlob, sanitizedName);

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

    let uploadData;
    try {
      uploadData = await uploadResponse.json();
    } catch (error) {
      const errorText = await uploadResponse.text();
      console.error("ChatPDF upload failed - invalid JSON response:", errorText);
      return new Response(JSON.stringify({ 
        success: false,
        error: `ChatPDF upload failed: ${errorText.substring(0, 200)}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!uploadResponse.ok || !uploadData.sourceId) {
      console.error("ChatPDF upload failed:", uploadData);
      return new Response(JSON.stringify({ 
        success: false,
        error: `ChatPDF upload failed: ${JSON.stringify(uploadData)}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
    
    let analysisResponse;
    try {
      analysisResponse = await fetch("https://api.chatpdf.com/v1/chats/message", {
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
    } catch (fetchError) {
      clearTimeout(analysisTimeout);
      console.error("Failed to send analysis request:", fetchError);
      const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
      return new Response(JSON.stringify({ 
        success: false,
        error: `Failed to send analysis request: ${errorMessage}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    clearTimeout(analysisTimeout);

    // Get response text first to handle non-JSON responses
    const responseText = await analysisResponse.text();
    console.log("Raw ChatPDF response status:", analysisResponse.status);
    console.log("Raw ChatPDF response text (first 500 chars):", responseText.substring(0, 500));

    if (!analysisResponse.ok) {
      console.error("ChatPDF analysis failed with status:", analysisResponse.status);
      
      // Check if it's an HTML error page (common with internal server errors)
      if (responseText.toLowerCase().includes('<!doctype html') || responseText.toLowerCase().includes('<html')) {
        console.error("ChatPDF returned HTML error page instead of JSON");
        return new Response(JSON.stringify({ 
          success: false,
          error: "ChatPDF service is experiencing issues. Please try again later." 
        }), {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      // Try to parse as JSON error
      let errorData;
      try {
        errorData = JSON.parse(responseText);
        console.error("ChatPDF analysis failed:", errorData);
        return new Response(JSON.stringify({ 
          success: false,
          error: `ChatPDF analysis failed: ${JSON.stringify(errorData)}` 
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (parseError) {
        console.error("ChatPDF analysis failed - non-JSON error response:", responseText);
        return new Response(JSON.stringify({ 
          success: false,
          error: `ChatPDF analysis failed: ${responseText.substring(0, 200)}` 
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    let analysisData;
    try {
      analysisData = JSON.parse(responseText);
      console.log("ChatPDF analysis response:", analysisData);
    } catch (error) {
      console.error("ChatPDF returned non-JSON response:", responseText.substring(0, 500));
      
      // Check if it's an HTML response (internal server error)
      if (responseText.toLowerCase().includes('<!doctype html') || responseText.toLowerCase().includes('<html')) {
        return new Response(JSON.stringify({ 
          success: false,
          error: "ChatPDF service is experiencing internal issues. Please try uploading the document again." 
        }), {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ 
        success: false,
        error: `ChatPDF returned invalid response: ${responseText.substring(0, 200)}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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