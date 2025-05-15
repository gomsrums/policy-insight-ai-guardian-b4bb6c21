
import { AnalysisResult } from "@/lib/chatpdf-types";

const API_KEY = "sec_7AEnMrTv2DZmIPoi6MfO9RqsIYRYM8Ym";

export const uploadDocumentToChatPDF = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("https://api.chatpdf.com/v1/sources/add-file", {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error uploading file: ${response.statusText}`);
    }

    const data = await response.json();
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
      throw new Error(`Error uploading text: ${response.statusText}`);
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
      throw new Error(`Error analyzing policy: ${response.statusText}`);
    }

    const data = await response.json();
    
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
      console.warn("Failed to parse ChatPDF response as JSON, using text extraction instead");
      
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
      throw new Error(`Error deleting source: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting source from ChatPDF:", error);
    throw error;
  }
};
