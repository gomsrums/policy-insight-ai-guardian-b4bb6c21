
// Types for the insurance comparison system

export interface PolicyComparisonCriteria {
  premium: number;
  coverage: number;
  deductible: number;
  exclusions: number;
  insurerRating: number;
  claimsProcess: number;
  customerService: number;
}

export interface InsurerRating {
  amBest?: string; // e.g., "A+", "A", "B+"
  standardPoors?: string; // e.g., "AA", "A+", "BBB"
  moodys?: string; // e.g., "Aa1", "A2", "Baa1"
  financialStrength: number; // 1-10 scale
}

export interface ClaimsProcessMetrics {
  averageSettlementDays: number;
  customerSatisfactionScore: number; // 1-5 scale
  claimApprovalRate: number; // percentage
  digitalClaimsSupport: boolean;
}

export interface InsurancePolicy {
  id: string;
  name: string;
  provider: string;
  type: 'auto' | 'health' | 'home';
  premium: {
    monthly: number;
    annual: number;
    currency: 'USD' | 'GBP' | 'INR';
  };
  coverage: {
    liability: number;
    comprehensive: number;
    collision: number;
    personalInjury: number;
    propertyDamage?: number;
    medicalPayments?: number;
    underinsuredMotorist?: number;
    uninsuredMotorist?: number;
  };
  deductible: {
    comprehensive: number;
    collision: number;
    overall?: number;
  };
  exclusions: string[];
  features: string[];
  insurerRating: InsurerRating;
  claimsProcess: ClaimsProcessMetrics;
  ratings: {
    customerService: number; // 1-5 scale
    claimProcessing: number; // 1-5 scale
    overall: number; // 1-5 scale
  };
  market: 'US' | 'UK' | 'India';
}

export interface ComparisonResult {
  policy: InsurancePolicy;
  score: number;
  breakdown: {
    premium: number;
    coverage: number;
    deductible: number;
    exclusions: number;
    insurerRating: number;
    claimsProcess: number;
    customerService: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  rankPosition: number;
}

export interface UserCriteria {
  budget: {
    min: number;
    max: number;
    currency: 'USD' | 'GBP' | 'INR';
  };
  priorities: PolicyComparisonCriteria;
  insuranceType: 'auto' | 'health' | 'home';
  market: 'US' | 'UK' | 'India';
  mustHaveFeatures?: string[];
  dealBreakers?: string[];
}

// Default parameter weights based on user research and industry standards
export const DEFAULT_PARAMETER_WEIGHTS: PolicyComparisonCriteria = {
  premium: 40,        // Cost is typically the primary concern
  coverage: 30,       // Extent of protection is crucial
  deductible: 15,     // Out-of-pocket costs matter significantly
  exclusions: 5,      // What's not covered affects value
  insurerRating: 5,   // Financial stability provides confidence
  claimsProcess: 3,   // Efficiency in claims handling
  customerService: 2  // Overall service experience
};

// Parameter definitions for user interface
export const COMPARISON_PARAMETERS = {
  premium: {
    name: "Premium Cost",
    description: "Annual or monthly insurance cost",
    weight: 40,
    importance: "Critical - Primary cost factor",
    dataSource: "Policy documents, ChatPDF extraction"
  },
  coverage: {
    name: "Coverage Extent",
    description: "Types and limits of coverage provided",
    weight: 30,
    importance: "High - Protection scope",
    dataSource: "Policy terms, coverage schedules"
  },
  deductible: {
    name: "Deductible Amount",
    description: "Out-of-pocket cost before coverage applies",
    weight: 15,
    importance: "Medium-High - Affects claim costs",
    dataSource: "Policy documents"
  },
  exclusions: {
    name: "Policy Exclusions",
    description: "Events or conditions not covered",
    weight: 5,
    importance: "Medium - Limits coverage",
    dataSource: "Policy fine print, exclusions list"
  },
  insurerRating: {
    name: "Insurer Financial Rating",
    description: "Financial stability (AM Best, S&P ratings)",
    weight: 5,
    importance: "Medium - Claim payment ability",
    dataSource: "AM Best, S&P, Moody's ratings"
  },
  claimsProcess: {
    name: "Claims Processing",
    description: "Average settlement time and approval rates",
    weight: 3,
    importance: "Low-Medium - Service efficiency",
    dataSource: "Industry reports, customer feedback"
  },
  customerService: {
    name: "Customer Service",
    description: "Customer satisfaction and service quality",
    weight: 2,
    importance: "Low - Overall experience",
    dataSource: "Customer reviews, satisfaction surveys"
  }
} as const;

// Market-specific parameter adjustments
export const MARKET_PARAMETER_ADJUSTMENTS = {
  US: {
    premium: { multiplier: 1.0, notes: "Higher premiums due to litigation costs" },
    coverage: { multiplier: 1.1, notes: "Comprehensive coverage expectations" },
    insurerRating: { multiplier: 1.2, notes: "Strong regulatory oversight" }
  },
  UK: {
    premium: { multiplier: 0.8, notes: "Lower average premiums" },
    coverage: { multiplier: 1.0, notes: "Standardized coverage requirements" },
    insurerRating: { multiplier: 1.0, notes: "FCA regulation" }
  },
  India: {
    premium: { multiplier: 0.3, notes: "Lower cost of living adjustment" },
    coverage: { multiplier: 0.9, notes: "Developing insurance market" },
    insurerRating: { multiplier: 0.8, notes: "IRDAI oversight" }
  }
};

export type ParameterKey = keyof PolicyComparisonCriteria;
