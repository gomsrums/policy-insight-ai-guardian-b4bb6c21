
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
  recommendations: string[];
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
}
