import { PolicyDocument, AnalysisResult, BusinessProfile, PolicyBenchmark } from "@/lib/chatpdf-types";

const CHATPDF_API_KEY = "sec_t759nqrP5IPLQM9ssZXIx0aHIK0hiv3k";
const CHATPDF_BASE_URL = "https://api.chatpdf.com/v1";

export const uploadDocumentForAnalysis = async (document: PolicyDocument): Promise<AnalysisResult> => {
  try {
    console.log("Uploading document to ChatPDF:", document.name);
    
    // Step 1: Upload the PDF to ChatPDF
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

    const uploadResponse = await fetch(`${CHATPDF_BASE_URL}/sources/add-file`, {
      method: "POST",
      headers: {
        "x-api-key": CHATPDF_API_KEY,
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.text();
      console.error("ChatPDF upload error:", errorData);
      throw new Error(`ChatPDF upload failed: ${uploadResponse.status} - ${errorData}`);
    }

    const uploadData = await uploadResponse.json();
    console.log("ChatPDF upload response:", uploadData);
    const sourceId = uploadData.sourceId;

    if (!sourceId) {
      throw new Error("No source ID returned from ChatPDF upload");
    }

    // Step 2: Comprehensive analysis with a single, detailed prompt
    const comprehensivePrompt = `
    Please analyze this insurance policy document thoroughly and provide:

    1. POLICY SUMMARY: Describe the main coverage areas, limits, and key features
    2. COVERAGE ANALYSIS: List what is covered and what might be missing
    3. RISK ASSESSMENT: Evaluate the overall risk level (Low/Medium/High) and identify specific risk factors
    4. POSITIVE ASPECTS: Highlight the strengths and good coverage areas of this policy
    5. NEGATIVE ASPECTS OR GAPS: Identify weaknesses, coverage gaps, or areas of concern
    6. RECOMMENDATIONS: Suggest improvements or additional coverage that should be considered

    Please format your response clearly with numbered sections and bullet points where appropriate.
    `;

    console.log("Sending comprehensive analysis request to ChatPDF...");

    const response = await fetch(`${CHATPDF_BASE_URL}/chats/message`, {
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

    if (!response.ok) {
      const errorData = await response.text();
      console.error("ChatPDF analysis error:", errorData);
      throw new Error(`ChatPDF analysis failed: ${response.status} - ${errorData}`);
    }

    const analysisData = await response.json();
    console.log("ChatPDF analysis response:", analysisData);

    if (!analysisData.content) {
      throw new Error("No content returned from ChatPDF analysis");
    }

    // Step 3: Parse the comprehensive response
    const fullAnalysis = analysisData.content;
    
    // Extract different sections from the response
    const sections = fullAnalysis.split(/\d+\.\s*[A-Z\s]+:/i);
    
    // Parse summary (first section or full text if sections not found)
    const summary = sections.length > 1 ? sections[1]?.trim() || fullAnalysis.substring(0, 500) : fullAnalysis.substring(0, 500);
    
    // Extract gaps and recommendations
    const gaps = this.extractListItems(fullAnalysis, ['gap', 'missing', 'not covered', 'limitation', 'weakness']);
    const recommendations = this.extractListItems(fullAnalysis, ['recommend', 'suggest', 'consider', 'should', 'improve']);
    
    // Determine risk level
    const riskLevel = this.determineRiskLevel(fullAnalysis);
    const riskFactors = this.extractListItems(fullAnalysis, ['risk', 'concern', 'problem', 'issue', 'exposure']);
    const mitigationStrategies = this.extractListItems(fullAnalysis, ['mitigate', 'reduce', 'prevent', 'address', 'solution']);

    const transformedData: AnalysisResult = {
      document_id: sourceId,
      is_insurance_policy: true,
      summary: summary,
      gaps: gaps.length > 0 ? gaps : ["Analysis completed - specific gaps will be identified through detailed review"],
      overpayments: [], // This would require premium comparison data
      recommendations: recommendations.length > 0 ? recommendations : ["Regular policy review recommended"],
      risk_assessment: {
        overall_risk_level: riskLevel,
        risk_factors: riskFactors.length > 0 ? riskFactors : ["Standard insurance risks apply"],
        mitigation_strategies: mitigationStrategies.length > 0 ? mitigationStrategies : ["Follow standard risk management practices"]
      }
    };

    console.log("Transformed analysis data:", transformedData);
    return transformedData;
  } catch (error) {
    console.error("Error analyzing document with ChatPDF:", error);
    throw new Error(`Analysis failed: ${error.message}`);
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
  
  const highRiskIndicators = ['high risk', 'significant risk', 'major concern', 'critical gap', 'severely limited'];
  const mediumRiskIndicators = ['medium risk', 'moderate risk', 'some concern', 'gaps identified', 'limited coverage'];
  const lowRiskIndicators = ['low risk', 'minimal risk', 'well covered', 'comprehensive', 'adequate protection'];
  
  if (highRiskIndicators.some(indicator => lowerText.includes(indicator))) {
    return "High";
  } else if (mediumRiskIndicators.some(indicator => lowerText.includes(indicator))) {
    return "Medium";
  } else if (lowRiskIndicators.some(indicator => lowerText.includes(indicator))) {
    return "Low";
  }
  
  // Default to Medium if unclear
  return "Medium";
};

export const sendChatMessage = async (documentId: string, question: string): Promise<string> => {
  try {
    console.log("Sending chat message to ChatPDF for document:", documentId);

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
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error("ChatPDF chat error:", errorData);
      throw new Error(`ChatPDF chat failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("ChatPDF chat response:", data);
    return data.content;
  } catch (error) {
    console.error("Error sending chat message to ChatPDF:", error);
    throw error;
  }
};

export const getCoverageGaps = async (documentId: string): Promise<string> => {
  try {
    console.log("Getting coverage gaps from ChatPDF for document:", documentId);

    const question = "Analyze this insurance policy and provide a detailed list of potential coverage gaps or areas where the policyholder might be underinsured. Please format your response as a numbered or bulleted list.";

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
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error("ChatPDF coverage gaps error:", errorData);
      throw new Error(`ChatPDF coverage gaps analysis failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("ChatPDF coverage gaps response:", data);
    return data.content;
  } catch (error) {
    console.error("Error getting coverage gaps from ChatPDF:", error);
    throw error;
  }
};

export const getBenchmarkComparison = async (profile: BusinessProfile, documentId?: string): Promise<PolicyBenchmark> => {
  try {
    console.log("Getting benchmark comparison for profile:", profile);
    
    if (!documentId) {
      throw new Error("Document ID is required for benchmark comparison");
    }

    // Use ChatPDF to analyze the document for benchmark comparison
    const benchmarkQuestions = [
      `Analyze this insurance policy for a ${profile.policyType} and provide coverage limits assessment based on the profile: ${JSON.stringify(profile)}`,
      `What are the deductibles in this policy and how do they compare to industry standards for a ${profile.type} business with ${profile.employees} employees?`,
      `Identify missing coverages in this policy that would be recommended for a ${profile.type} business in the ${profile.industry} industry.`,
      `Compare the premium costs mentioned in this policy to industry benchmarks for similar businesses.`,
      `Rate this policy from 1-10 based on how well it meets the needs of the business profile provided.`
    ];

    const benchmarkResults = await Promise.all(
      benchmarkQuestions.map(async (question) => {
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

        if (!response.ok) {
          throw new Error(`ChatPDF benchmark query failed: ${response.status}`);
        }

        const data = await response.json();
        return data.content;
      })
    );

    console.log("Benchmark analysis results:", benchmarkResults);

    const [coverageLimitsResponse, deductiblesResponse, missingCoveragesResponse, premiumResponse, ratingResponse] = benchmarkResults;
    
    // Parse missing coverages from the response
    const missingCoverages = missingCoveragesResponse.split('\n')
      .filter((line: string) => line.trim().length > 0 && (line.includes('•') || line.includes('-') || line.includes('1.') || line.includes('2.')))
      .map((line: string) => line.replace(/^[•\-\d\.]\s*/, '').trim())
      .filter((coverage: string) => coverage.length > 0)
      .slice(0, 5);

    // Extract rating from response
    const ratingMatch = ratingResponse.match(/(\d+)(?:\/10|\s*out\s*of\s*10)/i);
    const benchmarkScore = ratingMatch ? parseInt(ratingMatch[1]) : 
      (ratingResponse.toLowerCase().includes('excellent') ? 9 :
       ratingResponse.toLowerCase().includes('good') ? 7 :
       ratingResponse.toLowerCase().includes('poor') ? 4 : 6);

    const benchmark: PolicyBenchmark = {
      coverageLimits: coverageLimitsResponse,
      deductibles: deductiblesResponse,
      missingCoverages: missingCoverages.length > 0 ? missingCoverages : ["No missing coverages identified"],
      premiumComparison: premiumResponse,
      benchmarkScore: Math.min(10, Math.max(1, benchmarkScore))
    };
    
    return benchmark;
  } catch (error) {
    console.error("Error getting benchmark comparison:", error);
    throw error;
  }
};
