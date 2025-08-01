
export interface ChatPDFResponse {
  content: string;
  role: string;
  sourceId?: string;
  sourceType?: string;
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

export interface PolicyBenchmark {
  coverageLimits: string;
  deductibles: string;
  missingCoverages: string[];
  premiumComparison: string;
  benchmarkScore: number;
}

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

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface BusinessProfile {
  type: string;
  size: string;
  industry: string;
  employees: number;
  revenue: string;
  policyType: "business" | "individual";
  individualDetails?: {
    age: number;
    location: string;
    familySize: number;
  };
}
