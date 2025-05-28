
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
      throw new Error(`ChatPDF upload failed: ${uploadResponse.status}`);
    }

    const uploadData = await uploadResponse.json();
    console.log("ChatPDF upload response:", uploadData);
    const sourceId = uploadData.sourceId;

    // Step 2: Analyze the document for insurance policy information
    const analysisQuestions = [
      "Is this document an insurance policy? Provide a summary of what this document covers.",
      "What are the main coverage gaps or areas where this policy might not provide adequate protection?",
      "What recommendations would you make to improve this insurance coverage?",
      "Perform a risk assessment of this insurance policy. Identify risk factors and suggest mitigation strategies. Rate the overall risk as Low, Medium, or High."
    ];

    const analysisResults = await Promise.all(
      analysisQuestions.map(async (question) => {
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
                content: question,
              },
            ],
          }),
        });

        if (!response.ok) {
          throw new Error(`ChatPDF query failed: ${response.status}`);
        }

        const data = await response.json();
        return data.content;
      })
    );

    console.log("Analysis results:", analysisResults);

    // Step 3: Process the responses into our format
    const [summaryResponse, gapsResponse, recommendationsResponse, riskResponse] = analysisResults;
    
    // Parse gaps from the response
    const gaps = gapsResponse.split('\n')
      .filter((line: string) => line.trim().length > 0 && (line.includes('•') || line.includes('-') || line.includes('1.') || line.includes('2.')))
      .map((line: string) => line.replace(/^[•\-\d\.]\s*/, '').trim())
      .filter((gap: string) => gap.length > 0);

    // Parse recommendations
    const recommendations = recommendationsResponse.split('\n')
      .filter((line: string) => line.trim().length > 0 && (line.includes('•') || line.includes('-') || line.includes('1.') || line.includes('2.')))
      .map((line: string) => line.replace(/^[•\-\d\.]\s*/, '').trim())
      .filter((rec: string) => rec.length > 0);

    // Parse risk assessment
    const riskLevel = riskResponse.toLowerCase().includes('high') ? 'High' : 
                     riskResponse.toLowerCase().includes('medium') ? 'Medium' : 'Low';
    
    const riskFactors = riskResponse.split('\n')
      .filter((line: string) => line.trim().length > 0 && 
        (line.toLowerCase().includes('risk') || line.includes('•') || line.includes('-')))
      .map((line: string) => line.replace(/^[•\-\d\.]\s*/, '').trim())
      .filter((factor: string) => factor.length > 10)
      .slice(0, 5);

    const mitigationStrategies = riskResponse.split('\n')
      .filter((line: string) => line.trim().length > 0 && 
        (line.toLowerCase().includes('mitigat') || line.toLowerCase().includes('recommend') || 
         line.toLowerCase().includes('suggest')))
      .map((line: string) => line.replace(/^[•\-\d\.]\s*/, '').trim())
      .filter((strategy: string) => strategy.length > 10)
      .slice(0, 5);

    const transformedData: AnalysisResult = {
      document_id: sourceId,
      is_insurance_policy: summaryResponse.toLowerCase().includes('insurance') || summaryResponse.toLowerCase().includes('policy'),
      summary: summaryResponse,
      gaps: gaps.length > 0 ? gaps : ["No specific coverage gaps identified in the analysis."],
      overpayments: [],
      recommendations: recommendations.length > 0 ? recommendations : ["No specific recommendations provided."],
      risk_assessment: {
        overall_risk_level: riskLevel as "Low" | "Medium" | "High",
        risk_factors: riskFactors.length > 0 ? riskFactors : ["No specific risk factors identified."],
        mitigation_strategies: mitigationStrategies.length > 0 ? mitigationStrategies : ["No specific mitigation strategies provided."]
      }
    };

    console.log("Transformed analysis data:", transformedData);
    return transformedData;
  } catch (error) {
    console.error("Error analyzing document with ChatPDF:", error);
    throw error;
  }
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

export const getBenchmarkComparison = async (profile: BusinessProfile): Promise<PolicyBenchmark> => {
  try {
    console.log("Getting benchmark comparison for profile:", profile);
    
    let mockBenchmark: PolicyBenchmark;

    if (profile.policyType === "individual") {
      // Individual policy benchmarks
      const age = profile.individualDetails?.age || 25;
      const location = profile.individualDetails?.location || "suburban";
      const familySize = profile.individualDetails?.familySize || 1;

      mockBenchmark = {
        coverageLimits: `For an individual aged ${age} in a ${location} area with ${familySize} family member(s), recommended coverage includes: Life insurance 10-12x annual income, disability insurance 60-70% of income, and adequate health insurance with low deductibles.`,
        deductibles: `Recommended deductibles for individuals: Health insurance $500-$2,500, auto insurance $500-$1,000, homeowners/renters $500-$1,500 depending on financial situation.`,
        missingCoverages: [
          "Umbrella liability insurance",
          "Long-term disability insurance", 
          "Critical illness coverage",
          "Identity theft protection"
        ],
        premiumComparison: `Based on your age and location, you may be paying within market range. Consider bundling policies for discounts.`,
        benchmarkScore: age < 35 ? 8 : age < 50 ? 7 : 6
      };
    } else {
      // Business policy benchmarks
      mockBenchmark = {
        coverageLimits: `For a ${profile.type} business in ${profile.industry} with ${profile.employees} employees, recommended coverage limits are typically higher than standard policies.`,
        deductibles: `Industry standard deductibles for ${profile.industry} businesses range from $1,000-$5,000 depending on coverage type.`,
        missingCoverages: [
          "Cyber liability insurance",
          "Professional liability coverage",
          "Business interruption insurance"
        ],
        premiumComparison: `Based on your business profile, you may be paying 10-15% above market rate for similar coverage.`,
        benchmarkScore: 75 / 10
      };
    }
    
    return mockBenchmark;
  } catch (error) {
    console.error("Error getting benchmark comparison:", error);
    throw error;
  }
};
