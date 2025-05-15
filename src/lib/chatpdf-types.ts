
export interface ChatPDFResponse {
  content: string;
  role: string;
  sourceId?: string;
  sourceType?: string;
}

export interface AnalysisResult {
  gaps: string[];
  overpayments: string[];
  summary: string;
  recommendations: string[];
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
