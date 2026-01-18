import { supabase } from "@/integrations/supabase/client";

export interface PolicyDocument {
  id: string;
  name: string;
  type: "file" | "text";
  content?: string;
  file?: File;
  previewUrl?: string;
  status: "uploading" | "processing" | "ready" | "error";
  errorMessage?: string;
}

export interface RecommendationItem {
  priority: "High" | "Medium" | "Low";
  category: string;
  issue: string;
  recommendation: string;
  impact: string;
  estimatedCost: string;
}

export interface CoverageAnalysisItem {
  type: string;
  status: "Covered" | "Partial" | "Not Covered" | "Excluded";
  limit?: string;
  notes: string;
  risk?: "High" | "Medium" | "Low";
}

export interface AnalysisResult {
  document_id: string;
  is_insurance_policy: boolean;
  gaps: string[];
  overpayments: string[];
  summary: string;
  recommendations: RecommendationItem[];
  coverage_analysis: CoverageAnalysisItem[];
  overallScore: number;
  riskLevel: "Low" | "Medium" | "High";
  risk_assessment?: {
    overall_risk_level: "Low" | "Medium" | "High";
    risk_factors: string[];
    mitigation_strategies: string[];
  };
}

export interface PolicyComparisonResult {
  success: boolean;
  error?: string;
  policy1: {
    name: string;
    provider?: string;
    type?: string;
    premium?: {
      annual: number;
      monthly?: number;
      currency: string;
    };
    overallScore: number;
    riskLevel: string;
    strengths: string[];
    weaknesses: string[];
    coverages: Array<{
      type: string;
      limit?: string;
      status: string;
      deductible?: string;
    }>;
    exclusions: string[];
  };
  policy2: {
    name: string;
    provider?: string;
    type?: string;
    premium?: {
      annual: number;
      monthly?: number;
      currency: string;
    };
    overallScore: number;
    riskLevel: string;
    strengths: string[];
    weaknesses: string[];
    coverages: Array<{
      type: string;
      limit?: string;
      status: string;
      deductible?: string;
    }>;
    exclusions: string[];
  };
  comparison: {
    winner: "policy1" | "policy2" | "tie";
    winnerName: string;
    scoreDifference: number;
    summary: string;
    detailedAnalysis: string;
    coverageComparison: Array<{
      type: string;
      policy1: { status: string; limit?: string; notes?: string };
      policy2: { status: string; limit?: string; notes?: string };
      betterPolicy: "policy1" | "policy2" | "equal";
    }>;
    recommendations: Array<{
      priority: "High" | "Medium" | "Low";
      advice: string;
    }>;
    costAnalysis: {
      priceDifference: string;
      valueForMoney: string;
    };
  };
}

/**
 * Analyze a policy document using Lovable AI (Gemini)
 */
export const analyzePolicy = async (document: PolicyDocument): Promise<AnalysisResult> => {
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

    console.log("Sending document to AI analysis...");

    const { data, error } = await supabase.functions.invoke('analyze-policy', {
      body: {
        document_content: documentContent,
        document_name: document.name,
        analysis_type: "comprehensive"
      }
    });

    if (error) {
      console.error("Policy analysis error:", error);
      throw new Error(`Analysis failed: ${error.message}`);
    }

    if (!data || !data.success) {
      console.error("Policy analysis failed:", data);
      throw new Error(data?.error || "Analysis failed - no success response");
    }

    console.log("Analysis completed successfully");

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
    
    return analysisResult;
  } catch (error) {
    console.error("Error analyzing document:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("fetch") || error.message.includes("network")) {
        throw new Error("Network error: Unable to connect to analysis service. Please check your internet connection.");
      }
      throw error;
    }
    throw new Error("An unexpected error occurred during document analysis.");
  }
};

/**
 * Compare two policies side by side using Lovable AI (Gemini)
 */
export const comparePolicies = async (
  policy1: { name: string; content: string },
  policy2: { name: string; content: string }
): Promise<PolicyComparisonResult> => {
  try {
    console.log(`Comparing policies: ${policy1.name} vs ${policy2.name}`);

    const { data, error } = await supabase.functions.invoke('compare-policies', {
      body: {
        policy1,
        policy2
      }
    });

    if (error) {
      console.error("Policy comparison error:", error);
      throw new Error(`Comparison failed: ${error.message}`);
    }

    if (!data || !data.success) {
      console.error("Policy comparison failed:", data);
      throw new Error(data?.error || "Comparison failed - no success response");
    }

    console.log("Comparison completed successfully");
    return data as PolicyComparisonResult;
  } catch (error) {
    console.error("Error comparing policies:", error);
    
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred during policy comparison.");
  }
};
