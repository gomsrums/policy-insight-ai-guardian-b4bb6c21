
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
    - Do NOT use bold formatting or special symbols
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

    // Step 3: Send comprehensive coverage gap analysis request
    const coverageGapPrompt = `
    Based on this insurance policy document, please analyze and identify all coverage gaps, limitations, and exclusions. Provide your response in the following exact format:

    Start with: "Areas where your policy may have limited or no coverage"

    Then list each gap as a bullet point using this format:
    • [Gap Title]: [Detailed description of the limitation or exclusion] - [Impact or consequence of this gap]

    Focus on identifying:
    - Underinsurance clauses and their implications
    - Time limits for claims and notifications
    - Fraudulent claims consequences
    - Coverage exclusions and limitations
    - Deductibles and their impact
    - Disclosure requirements
    - Inspection requirements
    - Other insurance policy requirements
    - Specific coverage limits and caps

    CRITICAL FORMATTING REQUIREMENTS:
    - Use bullet points (•) for each gap
    - Do NOT use numbered lists
    - Do NOT use bold formatting or special symbols
    - Use plain text only
    - Add proper line spacing between each bullet point
    - Follow the exact format: • [Title]: [Description] - [Impact]
    - Make sure there are line breaks between items for better readability
    `;

    console.log("Sending coverage gap analysis request to ChatPDF...");

    const gapAnalysisResponse = await fetch(`${CHATPDF_BASE_URL}/chats/message`, {
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
            content: coverageGapPrompt,
          },
        ],
      }),
    });

    console.log("Coverage gap analysis response status:", gapAnalysisResponse.status);

    if (!gapAnalysisResponse.ok) {
      const errorText = await gapAnalysisResponse.text();
      console.error("ChatPDF coverage gap analysis error response:", errorText);
      
      if (gapAnalysisResponse.status === 401) {
        throw new Error(`ChatPDF API authentication failed during gap analysis. Status: ${gapAnalysisResponse.status}. Response: ${errorText}`);
      } else {
        throw new Error(`ChatPDF coverage gap analysis failed (${gapAnalysisResponse.status}): ${errorText}`);
      }
    }

    const gapAnalysisData = await gapAnalysisResponse.json();
    console.log("ChatPDF coverage gap analysis response data:", gapAnalysisData);

    if (!gapAnalysisData.content) {
      throw new Error("No content returned from ChatPDF coverage gap analysis");
    }

    // Step 4: Send recommendations analysis request  
    const recommendationsPrompt = `
    Based on the coverage gaps and limitations identified in this insurance policy, please provide specific recommendations to address these issues. Format your response as:

    Start with: "Recommendations to address coverage gaps:"

    Then list each recommendation as a bullet point:
    • [Recommendation Title]: [Detailed actionable advice] - [Benefit or reason for this recommendation]

    Focus on providing actionable recommendations such as:
    - Regular coverage reviews and assessments
    - Record keeping best practices
    - Claims submission processes
    - Additional coverage options
    - Risk mitigation strategies

    FORMATTING REQUIREMENTS:
    - Use bullet points (•) for each recommendation
    - Do NOT use numbered lists
    - Do NOT use bold formatting or special symbols
    - Use plain text only
    - Add proper line spacing between each bullet point
    - Follow the format: • [Title]: [Description] - [Benefit]
    `;

    console.log("Sending recommendations request to ChatPDF...");

    const recommendationsResponse = await fetch(`${CHATPDF_BASE_URL}/chats/message`, {
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
            content: recommendationsPrompt,
          },
        ],
      }),
    });

    console.log("Recommendations response status:", recommendationsResponse.status);

    if (!recommendationsResponse.ok) {
      const errorText = await recommendationsResponse.text();
      console.error("ChatPDF recommendations error response:", errorText);
      
      if (recommendationsResponse.status === 401) {
        throw new Error(`ChatPDF API authentication failed during recommendations. Status: ${recommendationsResponse.status}. Response: ${errorText}`);
      } else {
        throw new Error(`ChatPDF recommendations failed (${recommendationsResponse.status}): ${errorText}`);
      }
    }

    const recommendationsData = await recommendationsResponse.json();
    console.log("ChatPDF recommendations response data:", recommendationsData);

    if (!recommendationsData.content) {
      throw new Error("No content returned from ChatPDF recommendations");
    }

    // Step 5: Process the analysis results
    const coverageGapAnalysis = gapAnalysisData.content;
    const recommendationsAnalysis = recommendationsData.content;
    
    // Clean and format the analysis text
    const cleanedGapAnalysis = cleanFormattingFromText(coverageGapAnalysis);
    const cleanedRecommendations = cleanFormattingFromText(recommendationsAnalysis);
    
    // Extract gaps and recommendations from the cleaned response
    const gaps = extractBulletPoints(cleanedGapAnalysis);
    const recommendations = extractBulletPoints(cleanedRecommendations);
    
    // Determine risk level based on number and severity of gaps
    const riskLevel = determineRiskLevel(cleanedGapAnalysis);
    const riskFactors = extractRiskFactors(cleanedGapAnalysis);

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
- Do NOT use bold formatting or special symbols
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
- Do NOT use bold formatting or special symbols anywhere
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
