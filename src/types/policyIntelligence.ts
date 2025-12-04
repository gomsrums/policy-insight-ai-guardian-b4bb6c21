// True Policy Intelligence Types

export interface UserProfile {
  // Personal Details
  name: string;
  location: string;
  floodZone?: string;
  
  // Property Details
  propertyType: 'house' | 'flat' | 'bungalow' | 'other';
  propertyValue: number;
  contentsValue: number;
  
  // High Value Items
  highValueItems: HighValueItem[];
  
  // Work Situation
  workFromHome: boolean;
  workFromHomeDays?: number;
  businessEquipmentValue?: number;
  
  // Outdoor Structures
  hasGardenStructures: boolean;
  gardenStructuresValue?: number;
  
  // Additional Factors
  hasPets: boolean;
  petTypes?: string[];
  hasLodgers: boolean;
  runsBusinessFromHome: boolean;
  hasSecuritySystem: boolean;
  securityType?: string[];
}

export interface HighValueItem {
  id: string;
  name: string;
  value: number;
  category: 'jewelry' | 'electronics' | 'art' | 'collectibles' | 'other';
}

export interface ExtractedPolicyIntelligence {
  // Basic Info
  policyNumber: string;
  insurer: string;
  policyType: string;
  
  // Coverage Limits
  coverage: {
    buildings?: number;
    contents?: number;
    personalLiability?: number;
    legalExpenses?: number;
  };
  
  // Excess/Deductibles
  excess: {
    standard?: number;
    escapeOfWater?: number;
    subsidence?: number;
    accidentalDamage?: number;
  };
  
  // Item Limits
  itemLimits: {
    singleItemLimit?: number;
    valuablesLimit?: number;
    cashLimit?: number;
    gardenStructures?: number;
    bicycles?: number;
    businessEquipment?: number;
  };
  
  // Exclusions
  exclusions: string[];
  
  // Special Conditions
  conditions: string[];
  
  // What's Covered
  coveredPerils: string[];
  
  // Optional Add-ons Present
  addOns: string[];
  
  // Extraction Metadata
  extractionConfidence: number;
  extractedAt: string;
  rawDataPoints: number;
}

export interface PolicyGap {
  id: string;
  category: string;
  userSituation: string;
  policyReality: string;
  gapIdentified: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  financialExposure?: number;
  percentageCovered?: number;
  recommendation: string;
}

export interface PolicyIntelligenceReport {
  userProfile: UserProfile;
  extractedPolicy: ExtractedPolicyIntelligence;
  gaps: PolicyGap[];
  overallRiskScore: number;
  totalExposure: number;
  criticalGapsCount: number;
  recommendations: string[];
  generatedAt: string;
}
