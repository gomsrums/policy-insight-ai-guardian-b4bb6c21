
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

    // Step 2: Generate structured summary
    const summaryPrompt = `
    Please provide a comprehensive summary of this insurance policy document in the following structured format:

    Start with: "The policy document contains the insurance policy details for [type of insurance/vehicle] (Policy No. [policy number]) issued by [insurance company]. It includes the following key information:"

    Then provide a numbered list of key aspects:
    1. Policy Period: [Coverage dates and duration]
    2. Insured Item/Vehicle: [Details about what's insured - make, model, specifications]
    3. Premium Amount: [Total premium and breakdown if available]
    4. Special Benefits: [Any bonuses, discounts, or special features like No Claim Bonus]
    5. Coverage Limitations: [Important limitations, exclusions, or restrictions]
    6. Requirements: [Driver requirements, conditions, or prerequisites]
    7. Contact Information: [Customer service details if available]

    End with: "Overall, the document serves as a certificate of insurance and policy schedule, detailing the terms, conditions, and coverage of the insurance policy."

    Please extract the actual details from the document and format them according to this structure. If any section is not applicable or information is not available, adapt accordingly but maintain the structured format.

    IMPORTANT FORMATTING RULES:
    - Do NOT use ** for bold formatting
    - Use plain text only
    - Add proper line spacing between sections
    - Keep the numbered format simple without extra symbols
    `;

    console.log("Sending summary request to ChatPDF...");

    const summaryResponse = await fetch(`${CHATPDF_BASE_URL}/chats/message`, {
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
            content: summaryPrompt,
          },
        ],
      }),
    });

    console.log("Summary response status:", summaryResponse.status);

    if (!summaryResponse.ok) {
      const errorText = await summaryResponse.text();
      console.error("ChatPDF summary error response:", errorText);
      
      if (summaryResponse.status === 401) {
        throw new Error(`ChatPDF API authentication failed during summary. Status: ${summaryResponse.status}. Response: ${errorText}`);
      } else {
        throw new Error(`ChatPDF summary failed (${summaryResponse.status}): ${errorText}`);
      }
    }

    const summaryData = await summaryResponse.json();
    console.log("ChatPDF summary response data:", summaryData);

    if (!summaryData.content) {
      throw new Error("No summary content returned from ChatPDF");
    }

    const structuredSummary = summaryData.content;

    // Step 3: Send comprehensive analysis request for gaps and recommendations
    const analysisPrompt = `
    Based on this insurance policy document, please analyze and provide coverage gaps and recommendations in the following format:

    Start with: "The insurance policy document outlines several limitations and exclusions regarding coverage. Here are the key coverage gaps:"

    Then provide a numbered list for coverage gaps with proper formatting:
    1. Gap Title: Description
       - Sub-point if needed
       - Another sub-point if needed

    2. Next Gap Title: Description
       - Sub-points as needed

    After coverage gaps, provide recommendations in a similar format.

    CRITICAL FORMATTING REQUIREMENTS:
    - Do NOT use ** for bold formatting anywhere
    - Do NOT use # symbols
    - Use plain text only
    - Add proper line spacing between each numbered item
    - Use simple numbered format (1., 2., 3., etc.)
    - Use simple dash (-) for sub-points
    - Make sure there are line breaks between sections for better readability
    `;

    console.log("Sending analysis request to ChatPDF...");

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
            content: analysisPrompt,
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

    // Step 4: Process the analysis results
    const fullAnalysis = analysisData.content;
    
    // Clean and format the analysis text
    const cleanedAnalysis = cleanFormattingFromText(fullAnalysis);
    
    // Extract gaps and recommendations from the cleaned response
    const gaps = extractFormattedListItems(cleanedAnalysis, ['gap', 'limitation', 'exclusion', 'not cover']);
    const recommendations = extractFormattedListItems(cleanedAnalysis, ['recommend', 'suggest', 'consider', 'should', 'improve']);
    
    // Determine risk level
    const riskLevel = determineRiskLevel(fullAnalysis);
    const riskFactors = extractFormattedListItems(cleanedAnalysis, ['risk', 'concern', 'problem', 'issue']);

    const analysisResult: AnalysisResult = {
      summary: cleanFormattingFromText(structuredSummary),
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

// Helper function to clean formatting from text
const cleanFormattingFromText = (text: string): string => {
  return text
    .replace(/\*\*/g, '') // Remove ** bold formatting
    .replace(/#{1,6}\s*/g, '') // Remove # heading symbols
    .replace(/\n{3,}/g, '\n\n') // Normalize excessive line breaks to double
    .trim();
};

// Helper function to extract formatted list items from text
const extractFormattedListItems = (text: string, keywords: string[]): string[] => {
  const lines = text.split('\n');
  const items: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for numbered items (1., 2., etc.) or bullet points
    if (line.match(/^\d+\.\s/) || line.match(/^[•\-\*]\s/)) {
      let fullItem = line.replace(/^\d+\.\s*/, '').replace(/^[•\-\*]\s*/, '');
      
      // Check if next lines are sub-points (indented or start with -)
      let j = i + 1;
      while (j < lines.length && lines[j].trim().startsWith('-')) {
        fullItem += '\n' + lines[j].trim();
        j++;
      }
      
      // Only include if it contains relevant keywords or is a substantial item
      if (keywords.some(keyword => fullItem.toLowerCase().includes(keyword)) || fullItem.length > 20) {
        items.push(fullItem);
      }
      
      i = j - 1; // Skip processed sub-items
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

    // Enhance the question with formatting instructions
    let enhancedQuestion = question;
    if (question.toLowerCase().includes('summary') || question.toLowerCase().includes('summarize')) {
      enhancedQuestion = `${question}

Please provide the response in this structured format:

Start with: "The policy document contains the insurance policy details for [type] (Policy No. [number]) issued by [company]. It includes the following key information:"

Then provide numbered key points:
1. Policy Period: [dates and duration]
2. Insured Item: [details about what's insured]
3. Premium Amount: [total and breakdown]
4. Special Benefits: [bonuses, discounts, features]
5. Coverage Limitations: [restrictions, exclusions]
6. Requirements: [conditions, prerequisites]
7. Contact Information: [customer service details]

End with: "Overall, the document serves as a certificate of insurance and policy schedule, detailing the terms, conditions, and coverage of the insurance policy."

IMPORTANT FORMATTING RULES:
- Do NOT use ** for bold formatting
- Do NOT use # symbols
- Use plain text only
- Add proper line spacing between sections`;
    }

    // Add formatting instructions for coverage gap questions
    if (question.toLowerCase().includes('gap') || question.toLowerCase().includes('coverage') || question.toLowerCase().includes('limitation')) {
      enhancedQuestion = `${question}

Please format your response like this example:

"The insurance policy document outlines several limitations and exclusions regarding coverage. Here are the key coverage gaps:

1. Use Limitations: The policy does not cover the vehicle if used for:
   - Hire or reward
   - Carriage of goods (other than samples or personal luggage)
   - Organized racing, pace making, speed testing, or reliability trials

2. Personal Accident Cover: There is no personal accident cover for the owner-driver under Section III, as it is stated to be Rs. 0.

3. Deductibles: There is a compulsory deductible of Rs. 100 for each claim, which means the insured will have to bear this amount before the insurance coverage applies."

CRITICAL FORMATTING REQUIREMENTS:
- Do NOT use ** for bold formatting anywhere
- Do NOT use # symbols  
- Use plain text only
- Add proper line spacing between each numbered item
- Use simple numbered format (1., 2., 3., etc.)
- Use simple dash (-) for sub-points
- Make sure there are line breaks between sections for better readability`;
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
            content: enhancedQuestion,
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
    
    // Clean the response formatting before returning
    const cleanedResponse = cleanFormattingFromText(data.content || "No response received from ChatPDF.");
    return cleanedResponse;
  } catch (error) {
    console.error("Error sending chat message to ChatPDF:", error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("An unexpected error occurred while chatting.");
    }
  }
};
