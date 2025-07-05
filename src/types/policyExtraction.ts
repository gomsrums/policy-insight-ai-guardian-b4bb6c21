
// Policy data extraction types for ChatPDF AI integration

export interface ExtractedPolicyData {
  // Basic Policy Information
  policyNumber: string;
  insurerName: string;
  policyType: 'auto' | 'health' | 'home';
  market: 'US' | 'UK' | 'India';
  
  // Premium Information
  premium: {
    annual: number;
    monthly?: number;
    currency: 'USD' | 'GBP' | 'INR';
    paymentFrequency: 'annual' | 'monthly' | 'quarterly';
  };
  
  // Coverage Details
  coverage: {
    liability?: number;
    comprehensive?: number;
    collision?: number;
    personalInjury?: number;
    propertyDamage?: number;
    medicalPayments?: number;
    underinsuredMotorist?: number;
    uninsuredMotorist?: number;
  };
  
  // Deductibles
  deductibles: {
    comprehensive?: number;
    collision?: number;
    overall?: number;
  };
  
  // Policy Terms
  terms: {
    policyPeriod: {
      startDate: string;
      endDate: string;
      duration: number; // in months
    };
    renewalType: 'automatic' | 'manual';
  };
  
  // Exclusions and Limitations
  exclusions: string[];
  limitations: string[];
  
  // Additional Features
  features: string[];
  discounts: string[];
  
  // Ratings and Reviews (if available)
  ratings?: {
    customerService?: number;
    claimProcessing?: number;
    overall?: number;
  };
  
  // Extraction Metadata
  extractionMetadata: {
    extractedAt: string;
    confidence: number; // 0-1 scale
    source: 'chatpdf' | 'manual';
    documentId?: string;
    validationStatus: 'pending' | 'validated' | 'flagged';
    missingFields: string[];
  };
}

export interface PolicyExtractionRequest {
  documentId: string;
  documentName: string;
  market: 'US' | 'UK' | 'India';
  policyType: 'auto' | 'health' | 'home';
}

export interface PolicyExtractionResult {
  success: boolean;
  data?: ExtractedPolicyData;
  error?: string;
  validationWarnings: string[];
}

// Market-specific templates for different regions
export const MARKET_TEMPLATES = {
  US: {
    currency: 'USD' as const,
    commonCoverageTypes: ['liability', 'comprehensive', 'collision', 'personalInjury'],
    requiredFields: ['premium.annual', 'coverage.liability', 'deductibles.comprehensive'],
    regulatoryRequirements: ['minimum_liability_coverage', 'pip_coverage']
  },
  UK: {
    currency: 'GBP' as const,
    commonCoverageTypes: ['comprehensive', 'thirdParty', 'fire_theft', 'personalAccident'],
    requiredFields: ['premium.annual', 'coverage.comprehensive'],
    regulatoryRequirements: ['motor_insurance_database', 'continuous_insurance']
  },
  India: {
    currency: 'INR' as const,
    commonCoverageTypes: ['comprehensive', 'thirdParty', 'ownDamage', 'personalAccident'],
    requiredFields: ['premium.annual', 'coverage.thirdParty'],
    regulatoryRequirements: ['motor_third_party_act', 'personal_accident_cover']
  }
};

// Query templates for ChatPDF AI
export const CHATPDF_QUERIES = {
  basicInfo: [
    "Extract the policy number, insurance company name, and policy type from this document.",
    "What is the policy period (start date and end date)?",
    "Identify the insured vehicle details including make, model, and year."
  ],
  premium: [
    "Extract the total annual premium amount and currency.",
    "What is the monthly premium if mentioned?",
    "List all premium components and breakdown if available.",
    "Identify any discounts applied to the premium."
  ],
  coverage: [
    "List all coverage types included in this policy with their limits.",
    "What is the liability coverage limit?",
    "Extract comprehensive and collision coverage amounts.",
    "Identify personal injury protection or medical payments coverage."
  ],
  deductibles: [
    "What are the deductible amounts for comprehensive and collision coverage?",
    "List all deductibles mentioned in the policy.",
    "Are there different deductibles for different coverage types?"
  ],
  exclusions: [
    "List all exclusions mentioned in the policy.",
    "What activities or situations are not covered?",
    "Identify any limitations on coverage."
  ],
  features: [
    "List additional features, benefits, or riders included.",
    "What roadside assistance or additional services are covered?",
    "Identify any special programs or membership benefits."
  ]
};
