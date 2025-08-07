
import { PolicyDocument, AnalysisResult } from "@/lib/chatpdf-types";
import { supabase } from "@/integrations/supabase/client";

export const uploadDocumentForAnalysis = async (document: PolicyDocument): Promise<AnalysisResult> => {
  try {
    console.log("Analyzing document:", document.name);
    
    // Get document content
    let documentContent: string;
    if (document.file) {
      documentContent = await document.file.text();
    } else if (document.content) {
      documentContent = document.content;
    } else {
      throw new Error("No file or content available for analysis");
    }

    console.log("Sending document to ChatPDF analysis edge function...");

    // Call the ChatPDF analysis edge function
    const { data, error } = await supabase.functions.invoke('chatpdf-analyze', {
      body: {
        document_content: documentContent,
        document_name: document.name,
        analysis_type: "comprehensive"
      }
    });

    if (error) {
      console.error("ChatPDF analysis edge function error:", error);
      throw new Error(`Analysis failed: ${error.message}`);
    }

    console.log("Raw edge function response:", data);

    if (!data || !data.success) {
      console.error("ChatPDF analysis failed with response:", data);
      throw new Error(data?.error || "Analysis failed - no success response");
    }

    console.log("ChatPDF analysis completed:", data);

    const analysisResult: AnalysisResult = {
      summary: data.summary,
      gaps: data.gaps || [],
      overpayments: data.overpayments || [],
      recommendations: Array.isArray(data.recommendations) ? data.recommendations.map((rec: any) => ({
        priority: rec.priority || "Medium",
        category: rec.category || "General",
        issue: rec.issue || rec,
        recommendation: rec.recommendation || rec,
        impact: rec.impact || "Medium impact",
        estimatedCost: rec.estimatedCost || "Contact agent"
      })) : [],
      coverage_analysis: data.coverage_analysis || [],
      overallScore: data.overallScore || 75,
      riskLevel: data.riskLevel || data.risk_assessment?.overall_risk_level || "Medium",
      document_id: data.document_id,
      is_insurance_policy: data.is_insurance_policy,
      risk_assessment: data.risk_assessment || {
        overall_risk_level: "Medium",
        risk_factors: [],
        mitigation_strategies: []
      }
    };
    
    console.log("Final analysis result:", analysisResult);
    return analysisResult;
  } catch (error) {
    console.error("Error analyzing document with ChatPDF:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("fetch")) {
        throw new Error("Network error: Unable to connect to ChatPDF. Please check your internet connection.");
      } else if (error.message.includes("401") || error.message.includes("authentication")) {
        throw new Error("ChatPDF API authentication failed. Please verify the API key is correct and has proper permissions.");
      } else {
        throw error;
      }
    } else {
      throw new Error("An unexpected error occurred during document analysis.");
    }
  }
};

// Helper function to clean formatting from text
const cleanFormattingFromText = (text: string): string => {
  return text
    .replace(/\*\*/g, '') // Remove ** bold formatting
    .replace(/\*/g, '') // Remove * formatting
    .replace(/#{1,6}\s*/g, '') // Remove # heading symbols
    .replace(/\n{3,}/g, '\n\n') // Normalize excessive line breaks to double
    .trim();
};

// Helper function to extract bullet points from text
const extractBulletPoints = (text: string): string[] => {
  const lines = text.split('\n');
  const bulletPoints: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for bullet points (•) or similar markers
    if (line.match(/^[•\-\*]\s/) || line.match(/^\d+\.\s/)) {
      let fullPoint = line.replace(/^[•\-\*]\s*/, '').replace(/^\d+\.\s*/, '');
      
      // Check if next lines are continuation of this point (indented)
      let j = i + 1;
      while (j < lines.length && lines[j].trim() && !lines[j].trim().match(/^[•\-\*]\s/) && !lines[j].trim().match(/^\d+\.\s/)) {
        if (lines[j].trim().startsWith('-') || lines[j].trim().length > 0) {
          fullPoint += ' ' + lines[j].trim();
        }
        j++;
      }
      
      if (fullPoint.length > 10) { // Only include substantial points
        bulletPoints.push(fullPoint);
      }
      
      i = j - 1; // Skip processed lines
    }
  }
  
  return bulletPoints.slice(0, 10); // Limit to 10 items
};

// Helper function to extract risk factors
const extractRiskFactors = (text: string): string[] => {
  const riskKeywords = ['risk', 'limitation', 'exclusion', 'gap', 'underinsurance', 'deductible', 'time limit'];
  const lines = text.split('\n');
  const riskFactors: string[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.match(/^[•\-\*]\s/) && riskKeywords.some(keyword => 
      trimmedLine.toLowerCase().includes(keyword))) {
      const factor = trimmedLine.replace(/^[•\-\*]\s*/, '').split(':')[0];
      if (factor.length > 5) {
        riskFactors.push(factor);
      }
    }
  }
  
  return riskFactors.slice(0, 5); // Limit to 5 risk factors
};

// Helper function to determine risk level
const determineRiskLevel = (text: string): "Low" | "Medium" | "High" => {
  const lowerText = text.toLowerCase();
  
  // Count risk indicators
  const highRiskCount = (lowerText.match(/underinsurance|fraudulent|time limit|exclusion|limitation|deductible/g) || []).length;
  
  if (highRiskCount >= 5) {
    return "High";
  } else if (highRiskCount >= 3) {
    return "Medium";
  }
  
  return "Low";
};

export const sendChatMessage = async (documentId: string, question: string): Promise<string> => {
  try {
    console.log("Calling ChatPDF chat edge function...");

    // Call the ChatPDF chat edge function
    const { data, error } = await supabase.functions.invoke('chatpdf-chat', {
      body: {
        document_id: documentId,
        question: question
      }
    });

    if (error) {
      console.error("ChatPDF chat edge function error:", error);
      throw new Error(`Chat failed: ${error.message}`);
    }

    if (!data.success) {
      throw new Error(data.error || "Chat failed");
    }

    return data.response;
  } catch (error) {
    console.error("Error sending chat message:", error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("An unexpected error occurred while chatting.");
    }
  }
};
