import { AnalysisResult, PolicyBenchmark } from "@/lib/chatpdf-types";

// Updated with the correct API key
const API_KEY = "sec_EvOyQVA4IfSmWsdU3EZufWHAhgUEN2WS";

export const uploadDocumentToChatPDF = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    console.log("Uploading file to ChatPDF...");
    const response = await fetch("https://api.chatpdf.com/v1/sources/add-file", {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("ChatPDF API error:", errorData);
      throw new Error(`Error uploading file: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    console.log("File uploaded successfully, sourceId:", data.sourceId);
    return data.sourceId;
  } catch (error) {
    console.error("Error uploading document to ChatPDF:", error);
    throw error;
  }
};

export const uploadTextToChatPDF = async (text: string): Promise<string> => {
  try {
    const response = await fetch("https://api.chatpdf.com/v1/sources/add-text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({
        content: text,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error uploading text: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    return data.sourceId;
  } catch (error) {
    console.error("Error uploading text to ChatPDF:", error);
    throw error;
  }
};

export const analyzePolicyWithChatPDF = async (sourceId: string): Promise<AnalysisResult> => {
  try {
    console.log("Analyzing policy with sourceId:", sourceId);
    const response = await fetch("https://api.chatpdf.com/v1/chats/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({
        sourceId: sourceId,
        messages: [
          {
            role: "user",
            content: `Analyze this insurance policy document and provide:
              1. A summary of what the policy covers
              2. Identify potential coverage gaps or areas where the policyholder might be underinsured
              3. Identify potential areas where the policyholder might be overpaying or have unnecessary coverage
              4. Provide specific recommendations for improving the policy
              Format your response as a structured JSON object with these keys: summary, gaps, overpayments, and recommendations.`
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("ChatPDF API error during analysis:", errorData);
      throw new Error(`Error analyzing policy: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    console.log("Analysis response received:", data);
    
    try {
      // Try to parse the content as JSON
      const parsedContent = JSON.parse(data.content);
      return {
        summary: parsedContent.summary || "No summary available",
        gaps: Array.isArray(parsedContent.gaps) ? parsedContent.gaps : [],
        overpayments: Array.isArray(parsedContent.overpayments) ? parsedContent.overpayments : [],
        recommendations: Array.isArray(parsedContent.recommendations) ? parsedContent.recommendations : [],
      };
    } catch (parseError) {
      // If parsing fails, extract information using regex or other means
      console.warn("Failed to parse ChatPDF response as JSON, using text extraction instead:", parseError);
      
      const content = data.content;
      return {
        summary: extractSection(content, "summary") || "Summary not available",
        gaps: extractListItems(content, "gaps") || [],
        overpayments: extractListItems(content, "overpayments") || [],
        recommendations: extractListItems(content, "recommendations") || [],
      };
    }
  } catch (error) {
    console.error("Error analyzing policy with ChatPDF:", error);
    throw error;
  }
};

export const chatWithPolicy = async (sourceId: string, message: string): Promise<string> => {
  try {
    const response = await fetch("https://api.chatpdf.com/v1/chats/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({
        sourceId: sourceId,
        messages: [
          {
            role: "user",
            content: message
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error chatting with policy: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error("Error chatting with policy:", error);
    throw error;
  }
};

export const compareWithBenchmark = async (sourceId: string, businessType: string, businessSize: string): Promise<PolicyBenchmark> => {
  try {
    const response = await fetch("https://api.chatpdf.com/v1/chats/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({
        sourceId: sourceId,
        messages: [
          {
            role: "user",
            content: `Compare this insurance policy against industry benchmarks for a ${businessSize} ${businessType} business. 
            Specifically analyze:
            1. Whether the coverage limits meet industry standards
            2. If the deductibles are appropriate for this business type and size
            3. If there are any industry-specific coverages missing
            4. How the premium compares to typical rates
            Format your response as a structured JSON object with these keys: coverageLimits, deductibles, missingCoverages, premiumComparison, and benchmarkScore (a number from 1-10 indicating how well the policy matches industry benchmarks).`
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error comparing with benchmark: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    
    try {
      // Try to parse the content as JSON
      const parsedContent = JSON.parse(data.content);
      return {
        coverageLimits: parsedContent.coverageLimits || "No data available",
        deductibles: parsedContent.deductibles || "No data available",
        missingCoverages: Array.isArray(parsedContent.missingCoverages) ? parsedContent.missingCoverages : [],
        premiumComparison: parsedContent.premiumComparison || "No data available",
        benchmarkScore: parsedContent.benchmarkScore || 0,
      };
    } catch (parseError) {
      // If parsing fails, extract information using text
      console.warn("Failed to parse benchmark response as JSON, using text extraction instead");
      
      const content = data.content;
      return {
        coverageLimits: extractSection(content, "coverage limits") || "No data available",
        deductibles: extractSection(content, "deductibles") || "No data available",
        missingCoverages: extractListItems(content, "missing coverages") || [],
        premiumComparison: extractSection(content, "premium comparison") || "No data available",
        benchmarkScore: extractBenchmarkScore(content) || 0,
      };
    }
  } catch (error) {
    console.error("Error comparing with benchmark:", error);
    throw error;
  }
};

// Helper function to extract a section from the text content
function extractSection(content: string, sectionName: string): string {
  const regex = new RegExp(`${sectionName}[:\\s]*(.*?)(?=\\n\\n|$)`, 'is');
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

// Helper function to extract list items for a section
function extractListItems(content: string, sectionName: string): string[] {
  const section = extractSection(content, sectionName);
  if (!section) return [];
  
  // Split by numbered items or bullet points
  const items = section.split(/\n\s*[•\-\d+\.]\s*/);
  return items.filter(item => item.trim().length > 0);
}

// Helper function to extract benchmark score
function extractBenchmarkScore(content: string): number {
  const regex = /benchmark\s*score[:\s]*(\d+)/i;
  const match = content.match(regex);
  return match ? parseInt(match[1], 10) : 0;
}

export const deleteSourceFromChatPDF = async (sourceId: string): Promise<void> => {
  try {
    const response = await fetch("https://api.chatpdf.com/v1/sources/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({
        sources: [sourceId],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error deleting source: ${errorData.message || response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting source from ChatPDF:", error);
    throw error;
  }
};
