
import { PolicyDocument, AnalysisResult } from "@/lib/chatpdf-types";

const HF_FUNCTION_URL = "https://takieoywodunrjoteclz.supabase.co/functions/v1/insurance-analysis-hf";

export const uploadDocumentForAnalysis = async (document: PolicyDocument): Promise<AnalysisResult> => {
  try {
    console.log("Starting document analysis with Hugging Face:", document.name);
    
    let documentContent = '';
    
    if (document.content) {
      documentContent = document.content;
      console.log("Using document content, length:", documentContent.length);
    } else if (document.file) {
      // For PDF files, we'll need to extract text content
      // For now, we'll use a placeholder - in production you'd use PDF parsing
      documentContent = "PDF content extraction would be implemented here";
      console.log("Using placeholder content for PDF file");
    } else {
      throw new Error("No content available for analysis");
    }

    console.log("Making request to:", HF_FUNCTION_URL);
    
    const requestBody = {
      action: "analyze",
      document_content: documentContent,
    };
    
    console.log("Request body:", requestBody);

    const response = await fetch(HF_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Hugging Face analysis error response:", errorData);
      throw new Error(`Analysis failed: ${response.status} - ${errorData}`);
    }

    const analysisData = await response.json();
    console.log("Raw Hugging Face analysis response:", analysisData);

    if (!analysisData || !analysisData.response) {
      console.error("Invalid response structure:", analysisData);
      throw new Error("No analysis result returned from API");
    }

    // Store document content for chat context with the document ID we'll receive
    const documentId = analysisData.document_id || `hf-${Date.now()}`;
    localStorage.setItem(`document_${documentId}`, documentContent);
    console.log("Stored document content for chat with ID:", documentId);

    // Parse the comprehensive response from Hugging Face
    const fullAnalysis = analysisData.response;
    console.log("Full analysis text:", fullAnalysis);
    
    // Extract different sections from the response
    const sections = fullAnalysis.split(/\*\*[A-Z\s]+:\*\*/i);
    
    // Parse summary - try multiple patterns
    let summary = '';
    const summaryPatterns = [
      /\*\*POLICY SUMMARY[:\s]*\*\*(.*?)(?=\*\*|$)/is,
      /\*\*SUMMARY[:\s]*\*\*(.*?)(?=\*\*|$)/is,
      /Policy Summary[:\s]*(.*?)(?=Coverage|Risk|$)/is
    ];
    
    for (const pattern of summaryPatterns) {
      const match = fullAnalysis.match(pattern);
      if (match && match[1]?.trim()) {
        summary = match[1].trim();
        break;
      }
    }
    
    if (!summary) {
      // Fallback to first part of the analysis
      summary = fullAnalysis.substring(0, 500).trim();
    }
    
    console.log("Extracted summary:", summary);
    
    // Extract gaps with multiple patterns
    let gaps = [];
    const gapPatterns = [
      /\*\*COVERAGE GAPS[:\s]*\*\*(.*?)(?=\*\*|$)/is,
      /\*\*GAPS[:\s]*\*\*(.*?)(?=\*\*|$)/is,
      /Coverage Gaps[:\s]*(.*?)(?=Risk|Recommendations|$)/is
    ];
    
    for (const pattern of gapPatterns) {
      const match = fullAnalysis.match(pattern);
      if (match && match[1]?.trim()) {
        gaps = match[1].split('\n')
          .map(line => line.replace(/^[-•*]\s*/, '').trim())
          .filter(line => line.length > 10)
          .slice(0, 5);
        break;
      }
    }
    
    if (gaps.length === 0) {
      gaps = ["Analysis completed - specific coverage gaps will be detailed in the full report"];
    }
    
    console.log("Extracted gaps:", gaps);
    
    // Extract recommendations with multiple patterns
    let recommendations = [];
    const recPatterns = [
      /\*\*RECOMMENDATIONS[:\s]*\*\*(.*?)(?=\*\*|$)/is,
      /\*\*INSIGHTS[:\s]*\*\*(.*?)(?=\*\*|$)/is,
      /Recommendations[:\s]*(.*?)(?=Risk|$)/is
    ];
    
    for (const pattern of recPatterns) {
      const match = fullAnalysis.match(pattern);
      if (match && match[1]?.trim()) {
        recommendations = match[1].split('\n')
          .map(line => line.replace(/^[-•*]\s*/, '').trim())
          .filter(line => line.length > 10)
          .slice(0, 5);
        break;
      }
    }
    
    if (recommendations.length === 0) {
      recommendations = ["Comprehensive recommendations will be provided based on detailed policy analysis"];
    }
    
    console.log("Extracted recommendations:", recommendations);
    
    // Determine risk level with more patterns
    let riskLevel = "Medium";
    const riskPatterns = [
      /risk level[:\s]*(low|medium|high)/i,
      /overall risk[:\s]*(low|medium|high)/i,
      /(low|medium|high)\s*risk/i
    ];
    
    for (const pattern of riskPatterns) {
      const match = fullAnalysis.match(pattern);
      if (match && match[1]) {
        riskLevel = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
        break;
      }
    }
    
    console.log("Determined risk level:", riskLevel);
    
    // Extract risk factors
    let riskFactors = [];
    const riskFactorPatterns = [
      /\*\*RISK ASSESSMENT[:\s]*\*\*(.*?)(?=\*\*|$)/is,
      /\*\*RISK FACTORS[:\s]*\*\*(.*?)(?=\*\*|$)/is,
      /Risk Assessment[:\s]*(.*?)(?=Recommendations|$)/is
    ];
    
    for (const pattern of riskFactorPatterns) {
      const match = fullAnalysis.match(pattern);
      if (match && match[1]?.trim()) {
        riskFactors = match[1].split('\n')
          .map(line => line.replace(/^[-•*]\s*/, '').trim())
          .filter(line => line.length > 10)
          .slice(0, 3);
        break;
      }
    }
    
    if (riskFactors.length === 0) {
      riskFactors = ["Standard insurance risk factors apply based on policy type and coverage"];
    }
    
    console.log("Extracted risk factors:", riskFactors);

    const analysisResult: AnalysisResult = {
      summary: summary,
      gaps: gaps,
      overpayments: [], // Not typically provided by insurance analysis
      recommendations: recommendations,
      document_id: documentId,
      is_insurance_policy: true,
      risk_assessment: {
        overall_risk_level: riskLevel as "Low" | "Medium" | "High",
        risk_factors: riskFactors,
        mitigation_strategies: recommendations.slice(0, 3)
      }
    };
    
    console.log("Final analysis result:", analysisResult);
    return analysisResult;
  } catch (error) {
    console.error("Error analyzing document with Hugging Face:", error);
    console.error("Error stack:", error.stack);
    throw new Error(`Analysis failed: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
  }
};

export const sendChatMessage = async (documentId: string, question: string): Promise<string> => {
  try {
    console.log("Sending chat message to Hugging Face for document:", documentId);

    // We need to get the document content again for context
    // In a real implementation, you'd store this in a database
    const storedContent = localStorage.getItem(`document_${documentId}`);
    
    const response = await fetch(HF_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "chat",
        document_content: storedContent || "Document content not available",
        question: question,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error("Hugging Face chat error:", errorData);
      throw new Error(`Chat failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Hugging Face chat response:", data);
    return data.response || "I'm sorry, I couldn't process your question.";
  } catch (error) {
    console.error("Error sending chat message to Hugging Face:", error);
    throw error;
  }
};
