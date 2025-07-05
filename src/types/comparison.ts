
// Types for the insurance comparison system

export interface PolicyComparisonCriteria {
  premium: number;
  coverage: number;
  deductible: number;
  exclusions: number;
  customerService: number;
  claimProcessing: number;
}

export interface InsurancePolicy {
  id: string;
  name: string;
  provider: string;
  type: 'auto' | 'health' | 'home';
  premium: {
    monthly: number;
    annual: number;
  };
  coverage: {
    liability: number;
    comprehensive: number;
    collision: number;
    personalInjury: number;
  };
  deductible: {
    comprehensive: number;
    collision: number;
  };
  exclusions: string[];
  features: string[];
  ratings: {
    customerService: number; // 1-5 scale
    claimProcessing: number; // 1-5 scale
    overall: number; // 1-5 scale
  };
  market: 'US' | 'EU' | 'UK';
}

export interface ComparisonResult {
  policy: InsurancePolicy;
  score: number;
  breakdown: {
    premium: number;
    coverage: number;
    deductible: number;
    exclusions: number;
    customerService: number;
    claimProcessing: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

export interface UserCriteria {
  budget: {
    min: number;
    max: number;
  };
  priorities: PolicyComparisonCriteria;
  insuranceType: 'auto' | 'health' | 'home';
  market: 'US' | 'EU' | 'UK';
}
