
import { PolicyDocument, AnalysisResult } from "@/lib/chatpdf-types";

const HF_FUNCTION_URL = "https://takieoywodunrjoteclz-supabase.co/functions/v1/insurance-analysis-hf";

export const uploadDocumentForAnalysis = async (document: PolicyDocument): Promise<AnalysisResult> => {
  try {
    console.log("Analyzing document with Hugging Face:", document.name);
    
    let documentContent = '';
    
    if (document.content) {
      documentContent = document.content;
    } else if (document.file) {
      // For PDF files, we'll need to extract text content
      // For now, we'll use a placeholder - in production you'd use PDF parsing
      documentContent = "PDF content extraction would be implemented here";
    } else {
      throw new Error("No content available for analysis");
    }

    const response = await fetch(HF_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "analyze",
        document_content: documentContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Hugging Face analysis error:", errorData);
      throw new Error(`Analysis failed: ${response.status} - ${errorData}`);
    }

    const analysisData = await response.json();
    console.log("Hugging Face analysis response:", analysisData);

    if (!analysisData.response) {
      throw new Error("No analysis result returned");
    }

    // Parse the comprehensive response from Hugging Face
    const fullAnalysis = analysisData.response;
    
    // Extract different sections from the response
    const sections = fullAnalysis.split(/\*\*[A-Z\s]+:\*\*/i);
    
    // Parse summary
    const summaryMatch = fullAnalysis.match(/\*\*POLICY SUMMARY:\*\*(.*?)(?=\*\*|$)/is);
    const summary = summaryMatch ? summaryMatch[1].trim() : fullAnalysis.substring(0, 500);
    
    // Extract gaps
    const gapsMatch = fullAnalysis.match(/\*\*COVERAGE GAPS:\*\*(.*?)(?=\*\*|$)/is);
    const gaps = gapsMatch ? 
      gapsMatch[1].split('\n').filter(line => line.trim().length > 10).slice(0, 5) : 
      ["No significant coverage gaps identified"];
    
    // Extract recommendations
    const recommendationsMatch = fullAnalysis.match(/\*\*RECOMMENDATIONS:\*\*(.*?)(?=\*\*|$)/is);
    const recommendations = recommendationsMatch ? 
      recommendationsMatch[1].split('\n').filter(line => line.trim().length > 10).slice(0, 5) : 
      ["Policy appears adequate for basic coverage"];
    
    // Determine risk level
    const riskMatch = fullAnalysis.match(/risk level[:\s]*(low|medium|high)/i);
    const riskLevel = riskMatch ? 
      (riskMatch[1].charAt(0).toUpperCase() + riskMatch[1].slice(1).toLowerCase()) as "Low" | "Medium" | "High" : 
      "Medium";
    
    // Extract risk factors
    const riskFactorsMatch = fullAnalysis.match(/\*\*RISK ASSESSMENT:\*\*(.*?)(?=\*\*|$)/is);
    const riskFactors = riskFactorsMatch ? 
      riskFactorsMatch[1].split('\n').filter(line => line.trim().length > 10).slice(0, 3) : 
      ["Standard insurance risks apply"];

    const analysisResult: AnalysisResult = {
      summary: summary,
      gaps: gaps,
      overpayments: [], // Not typically provided by insurance analysis
      recommendations: recommendations,
      document_id: analysisData.document_id,
      is_insurance_policy: true,
      risk_assessment: {
        overall_risk_level: riskLevel,
        risk_factors: riskFactors,
        mitigation_strategies: recommendations.slice(0, 3)
      }
    };
    
    console.log("Final analysis result:", analysisResult);
    return analysisResult;
  } catch (error) {
    console.error("Error analyzing document with Hugging Face:", error);
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
