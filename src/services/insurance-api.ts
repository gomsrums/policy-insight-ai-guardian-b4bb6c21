
import { PolicyDocument, AnalysisResult, BusinessProfile, PolicyBenchmark } from "@/lib/chatpdf-types";

const API_BASE_URL = "http://localhost:8000"; // Updated to local development server

export const uploadDocumentForAnalysis = async (document: PolicyDocument): Promise<AnalysisResult> => {
  try {
    console.log("Uploading document for analysis:", document);
    
    // Create form data for file upload
    const formData = new FormData();
    if (document.file) {
      formData.append("file", document.file);
    } else if (document.content) {
      // If it's text content, create a text file
      const textFile = new Blob([document.content], { type: "text/plain" });
      formData.append("file", textFile, "policy-text.txt");
    }
    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Raw API response:", data);
    
    // Transform the response to match the frontend's expected format
    // This ensures compatibility between the backend and frontend
    const transformedData: AnalysisResult = {
      summary: data.summary || "",
      gaps: Array.isArray(data.gaps) ? data.gaps : 
            (data.coverage_gaps ? 
              (Array.isArray(data.coverage_gaps) ? data.coverage_gaps : [data.coverage_gaps]) : 
              []),
      overpayments: Array.isArray(data.overpayments) ? data.overpayments : 
                    (data.potential_overpayments ? 
                      (Array.isArray(data.potential_overpayments) ? data.potential_overpayments : [data.potential_overpayments]) : 
                      []),
      recommendations: Array.isArray(data.recommendations) ? data.recommendations : 
                       (data.recommended_actions ? 
                         (Array.isArray(data.recommended_actions) ? data.recommended_actions : [data.recommended_actions]) : 
                         [])
    };
    
    console.log("Transformed data for frontend:", transformedData);
    return transformedData;
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
};

export const sendChatMessage = async (documentId: string, question: string): Promise<string> => {
  try {
    console.log("Sending chat message for document:", documentId);

    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
              question: question,
            document_id: documentId,
            query_type:"general"
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.answer;
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw error;
  }
};


export const getCoverageGaps = async (documentId: string): Promise<string> => {
  try {
    console.log("Sending chat message for document:", documentId);

    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/coverage-gaps`, {
      method: "GET",
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.answer;
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw error;
  }
};

export const getBenchmarkComparison = async (profile: BusinessProfile): Promise<PolicyBenchmark> => {
  try {
    console.log("Getting benchmark comparison for profile:", profile);
    
    const response = await fetch(`${API_BASE_URL}/benchmark`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ profile }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Benchmark response:", data);
    
    // Transform the response to match the frontend's expected format
    const transformedData: PolicyBenchmark = {
      coverageLimits: data.coverageLimits || data.coverage_limits || "",
      deductibles: data.deductibles || "",
      missingCoverages: Array.isArray(data.missingCoverages) ? data.missingCoverages : 
                        (Array.isArray(data.missing_coverages) ? data.missing_coverages : []),
      premiumComparison: data.premiumComparison || data.premium_comparison || "",
      benchmarkScore: typeof data.benchmarkScore === 'number' ? data.benchmarkScore : 
                      (typeof data.benchmark_score === 'number' ? data.benchmark_score : 0)
    };
    
    return transformedData;
  } catch (error) {
    console.error("Error getting benchmark comparison:", error);
    throw error;
  }
};
