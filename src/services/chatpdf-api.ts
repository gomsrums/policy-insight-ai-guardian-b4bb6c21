
import { PolicyDocument, AnalysisResult } from "@/lib/chatpdf-types";

const CHATPDF_API_KEY = "sec_t759nqrP5IPLQM9ssZXIx0aHIK0hiv3k";
const CHATPDF_BASE_URL = "https://api.chatpdf.com/v1";

export const uploadDocumentForAnalysis = async (document: PolicyDocument): Promise<AnalysisResult> => {
  try {
    console.log("Uploading document to ChatPDF:", document.name);
    console.log("Using API key:", CHATPDF_API_KEY.substring(0, 15) + "...");
    
    // Validate API key
    if (!CHATPDF_API_KEY) {
      throw new Error("ChatPDF API key is not configured");
    }
    
    // Step 1: Upload the document to ChatPDF
    const formData = new FormData();
    if (document.file) {
      formData.append("file", document.file);
    } else if (document.content) {
      // If it's text content, create a text file
      const textFile = new Blob([document.content], { type: "text/plain" });
      formData.append("file", textFile, "policy-text.txt");
    } else {
      throw new Error("No file or content available for analysis");
    }

    console.log("Making upload request to ChatPDF...");

    const uploadResponse = await fetch(`${CHATPDF_BASE_URL}/sources/add-file`, {
      method: "POST",
      headers: {
        "x-api-key": CHATPDF_API_KEY,
      },
      body: formData,
    });

    console.log("Upload response status:", uploadResponse.status);
    console.log("Upload response headers:", Object.fromEntries(uploadResponse.headers.entries()));

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error("ChatPDF upload error response:", errorText);
      
      // Try to parse JSON error response
      let errorData;
      try {
        errorData = JSON.parse(errorText);
        console.error("Parsed error data:", errorData);
      } catch (e) {
        console.error("Could not parse error response as JSON");
      }
      
      // Handle specific error cases
      if (uploadResponse.status === 401) {
        throw new Error(`ChatPDF API authentication failed. Status: ${uploadResponse.status}. Response: ${errorText}`);
      } else if (uploadResponse.status === 429) {
        throw new Error("ChatPDF API rate limit exceeded. Please try again later.");
      } else if (uploadResponse.status === 413) {
        throw new Error("File too large for ChatPDF API. Please try a smaller file.");
      } else {
        throw new Error(`ChatPDF upload failed (${uploadResponse.status}): ${errorText}`);
      }
    }

    const uploadData = await uploadResponse.json();
    console.log("ChatPDF upload response data:", uploadData);
    const sourceId = uploadData.sourceId;

    if (!sourceId) {
      throw new Error("No source ID returned from ChatPDF upload");
    }

    // Step 2: Send analysis request
    const comprehensivePrompt = `
    Please analyze this insurance policy document thoroughly and provide a comprehensive report with the following sections:

    1. POLICY SUMMARY: Describe the main coverage areas, policy limits, deductibles, and key features
    2. COVERAGE ANALYSIS: List what is covered in detail and identify any coverage gaps or limitations
    3. RISK ASSESSMENT: Evaluate the overall risk level (Low/Medium/High) and identify specific risk factors
    4. POSITIVE ASPECTS: Highlight the strengths, comprehensive coverage areas, and benefits of this policy
    5. NEGATIVE ASPECTS OR GAPS: Identify weaknesses, coverage gaps, exclusions, or areas of concern
    6. RECOMMENDATIONS: Suggest improvements, additional coverage, or modifications that should be considered

    Please format your response clearly with numbered sections and provide specific details for each area.
    Be thorough in identifying both positive and negative aspects of the policy.
    `;

    console.log("Sending comprehensive analysis request to ChatPDF...");

    const analysisResponse = await fetch(`${CHATPDF_BASE_URL}/chats/message`, {
      method: "POST",
      headers: {
        "x-api-key": CHATPDF_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sourceId: sourceId,
        messages: [
          {
            role: "user",
            content: comprehensivePrompt,
          },
        ],
      }),
    });

    console.log("Analysis response status:", analysisResponse.status);

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error("ChatPDF analysis error response:", errorText);
      
      if (analysisResponse.status === 401) {
        throw new Error(`ChatPDF API authentication failed during analysis. Status: ${analysisResponse.status}. Response: ${errorText}`);
      } else {
        throw new Error(`ChatPDF analysis failed (${analysisResponse.status}): ${errorText}`);
      }
    }

    const analysisData = await analysisResponse.json();
    console.log("ChatPDF analysis response data:", analysisData);

    if (!analysisData.content) {
      throw new Error("No content returned from ChatPDF analysis");
    }

    // Step 3: Parse the comprehensive response
    const fullAnalysis = analysisData.content;
    
    // Extract summary from the first section
    const summary = fullAnalysis.substring(0, 500).replace(/\n/g, ' ').trim() + "...";
    
    // Extract gaps and recommendations from the response
    const gaps = extractListItems(fullAnalysis, ['gap', 'missing', 'not covered', 'limitation', 'weakness', 'exclusion']);
    const recommendations = extractListItems(fullAnalysis, ['recommend', 'suggest', 'consider', 'should', 'improve', 'add']);
    
    // Determine risk level
    const riskLevel = determineRiskLevel(fullAnalysis);
    const riskFactors = extractListItems(fullAnalysis, ['risk', 'concern', 'problem', 'issue', 'vulnerable']);

    const analysisResult: AnalysisResult = {
      summary: summary,
      gaps: gaps,
      overpayments: [], // ChatPDF doesn't provide overpayment analysis
      recommendations: recommendations,
      document_id: sourceId,
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

// Helper function to extract list items from text
const extractListItems = (text: string, keywords: string[]): string[] => {
  const lines = text.split('\n');
  const items: string[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    // Look for bullet points, numbers, or lines containing keywords
    if (trimmedLine.match(/^[•\-\*\d\.]/)) {
      const cleanLine = trimmedLine.replace(/^[•\-\*\d\.\s]+/, '').trim();
      if (cleanLine.length > 10) {
        items.push(cleanLine);
      }
    } else if (keywords.some(keyword => trimmedLine.toLowerCase().includes(keyword))) {
      if (trimmedLine.length > 15) {
        items.push(trimmedLine);
      }
    }
  }
  
  return items.slice(0, 8); // Limit to 8 items
};

// Helper function to determine risk level
const determineRiskLevel = (text: string): "Low" | "Medium" | "High" => {
  const lowerText = text.toLowerCase();
  
  const highRiskIndicators = ['high risk', 'significant risk', 'major concern', 'critical gap', 'serious limitation'];
  const mediumRiskIndicators = ['medium risk', 'moderate risk', 'some concern', 'gaps identified', 'minor issues'];
  const lowRiskIndicators = ['low risk', 'minimal risk', 'well covered', 'comprehensive', 'adequate coverage'];
  
  if (highRiskIndicators.some(indicator => lowerText.includes(indicator))) {
    return "High";
  } else if (lowRiskIndicators.some(indicator => lowerText.includes(indicator))) {
    return "Low";
  }
  
  return "Medium"; // Default to Medium if unclear
};

export const sendChatMessage = async (documentId: string, question: string): Promise<string> => {
  try {
    console.log("Sending chat message to ChatPDF for document:", documentId);
    console.log("Using API key:", CHATPDF_API_KEY.substring(0, 15) + "...");

    if (!CHATPDF_API_KEY) {
      throw new Error("ChatPDF API key is not configured");
    }

    const response = await fetch(`${CHATPDF_BASE_URL}/chats/message`, {
      method: "POST",
      headers: {
        "x-api-key": CHATPDF_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sourceId: documentId,
        messages: [
          {
            role: "user",
            content: question,
          },
        ],
      }),
    });
    
    console.log("Chat response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("ChatPDF chat error response:", errorText);
      
      if (response.status === 401) {
        throw new Error(`ChatPDF API authentication failed during chat. Status: ${response.status}. Response: ${errorText}`);
      } else {
        throw new Error(`ChatPDF chat failed (${response.status}): ${errorText}`);
      }
    }
    
    const data = await response.json();
    console.log("ChatPDF chat response data:", data);
    return data.content || "No response received from ChatPDF.";
  } catch (error) {
    console.error("Error sending chat message to ChatPDF:", error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("An unexpected error occurred while chatting.");
    }
  }
};
