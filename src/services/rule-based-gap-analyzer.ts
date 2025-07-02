
import { AnalysisResult } from "@/lib/chatpdf-types";

export interface CompanyData {
  companyId: string;
  industry: string;
  location: string;
  employeeCount: number;
  annualRevenue: number;
  fleetVehicles: number;
  hasPremises: boolean;
  handlesPII: boolean;
  coverages: Coverage[];
}

export interface Coverage {
  name: string;
  limit: number;
  status: 'Active' | 'Inactive' | 'Expired';
}

export interface RiskRule {
  riskCategory: string;
  requiredCondition: string;
  requiredCoverage: string;
  minLimit: number;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  conditionCheck: (data: CompanyData) => boolean;
}

export interface GapAnalysisResult {
  missingCoverages: Gap[];
  underinsuredCoverages: Gap[];
  adequateCoverages: Coverage[];
  overallRiskScore: number;
  criticalGaps: number;
  recommendations: string[];
}

export interface Gap {
  riskCategory: string;
  requiredCoverage: string;
  currentLimit: number;
  recommendedLimit: number;
  severity: string;
  reason: string;
}

// Rule-based framework from the image
const RISK_RULES: RiskRule[] = [
  {
    riskCategory: "General Liability",
    requiredCondition: "Always required",
    requiredCoverage: "General Liability",
    minLimit: 1000000,
    severity: "High",
    conditionCheck: () => true // Always required
  },
  {
    riskCategory: "Cyber Risk",
    requiredCondition: "If handlesPII = true",
    requiredCoverage: "Cyber Liability",
    minLimit: 1000000,
    severity: "Critical",
    conditionCheck: (data: CompanyData) => data.handlesPII
  },
  {
    riskCategory: "Auto/Fleet",
    requiredCondition: "If fleetVehicles > 0",
    requiredCoverage: "Commercial Auto",
    minLimit: 1000000,
    severity: "High",
    conditionCheck: (data: CompanyData) => data.fleetVehicles > 0
  },
  {
    riskCategory: "Professional Risk",
    requiredCondition: "If industry = Service/Tech/Consulting",
    requiredCoverage: "E&O Insurance",
    minLimit: 1000000,
    severity: "Medium",
    conditionCheck: (data: CompanyData) => 
      ['Technology', 'Service', 'Consulting', 'Professional Services'].includes(data.industry)
  },
  {
    riskCategory: "Premises Risk",
    requiredCondition: "If hasPremises = true",
    requiredCoverage: "Property Insurance",
    minLimit: 1000000,
    severity: "High",
    conditionCheck: (data: CompanyData) => data.hasPremises
  },
  {
    riskCategory: "Employment Risk",
    requiredCondition: "If employeeCount > 10",
    requiredCoverage: "EPLI",
    minLimit: 500000,
    severity: "Medium",
    conditionCheck: (data: CompanyData) => data.employeeCount > 10
  },
  {
    riskCategory: "Executive Risk",
    requiredCondition: "If employeeCount > 25 or industry = Finance",
    requiredCoverage: "D&O Liability",
    minLimit: 1000000,
    severity: "Medium",
    conditionCheck: (data: CompanyData) => 
      data.employeeCount > 25 || data.industry === 'Finance'
  },
  {
    riskCategory: "Legal Defense",
    requiredCondition: "Optional",
    requiredCoverage: "Legal Expense",
    minLimit: 0,
    severity: "Low",
    conditionCheck: () => false // Optional, not required
  },
  {
    riskCategory: "Environmental",
    requiredCondition: "If industry = Manufacturing/Construction",
    requiredCoverage: "Pollution Liability",
    minLimit: 1000000,
    severity: "High",
    conditionCheck: (data: CompanyData) => 
      ['Manufacturing', 'Construction'].includes(data.industry)
  }
];

export const analyzeGaps = (companyData: CompanyData): GapAnalysisResult => {
  const missingCoverages: Gap[] = [];
  const underinsuredCoverages: Gap[] = [];
  const adequateCoverages: Coverage[] = [];
  const recommendations: string[] = [];

  // Check each rule against the company data
  RISK_RULES.forEach(rule => {
    if (rule.conditionCheck(companyData)) {
      const existingCoverage = companyData.coverages.find(c => 
        normalizeCoverage(c.name) === normalizeRequiredCoverage(rule.requiredCoverage)
      );

      if (!existingCoverage) {
        // Missing coverage
        missingCoverages.push({
          riskCategory: rule.riskCategory,
          requiredCoverage: rule.requiredCoverage,
          currentLimit: 0,
          recommendedLimit: rule.minLimit,
          severity: rule.severity,
          reason: `Required based on condition: ${rule.requiredCondition}`
        });
        
        recommendations.push(
          `Add ${rule.requiredCoverage} with minimum limit of $${formatCurrency(rule.minLimit)} due to ${rule.requiredCondition.toLowerCase()}`
        );
      } else if (existingCoverage.limit < rule.minLimit && rule.minLimit > 0) {
        // Underinsured coverage
        underinsuredCoverages.push({
          riskCategory: rule.riskCategory,
          requiredCoverage: rule.requiredCoverage,
          currentLimit: existingCoverage.limit,
          recommendedLimit: rule.minLimit,
          severity: rule.severity,
          reason: `Current limit of $${formatCurrency(existingCoverage.limit)} is below recommended minimum of $${formatCurrency(rule.minLimit)}`
        });
        
        recommendations.push(
          `Increase ${rule.requiredCoverage} limit from $${formatCurrency(existingCoverage.limit)} to at least $${formatCurrency(rule.minLimit)}`
        );
      } else if (existingCoverage) {
        // Adequate coverage
        adequateCoverages.push(existingCoverage);
      }
    }
  });

  const criticalGaps = [...missingCoverages, ...underinsuredCoverages]
    .filter(gap => gap.severity === 'Critical').length;

  const overallRiskScore = calculateRiskScore(missingCoverages, underinsuredCoverages);

  return {
    missingCoverages,
    underinsuredCoverages,
    adequateCoverages,
    overallRiskScore,
    criticalGaps,
    recommendations
  };
};

// Helper functions
const normalizeCoverage = (coverage: string): string => {
  const mapping: { [key: string]: string } = {
    'General Liability': 'general liability',
    'Cyber Liability': 'cyber liability',
    'Commercial Auto': 'commercial auto',
    'E&O Insurance': 'professional liability',
    'Property Insurance': 'property insurance',
    'EPLI': 'employment practices liability',
    'D&O Liability': 'directors and officers',
    'Legal Expense': 'legal expenses',
    'Pollution Liability': 'environmental liability'
  };
  
  return mapping[coverage] || coverage.toLowerCase();
};

const normalizeRequiredCoverage = (coverage: string): string => {
  const mapping: { [key: string]: string } = {
    'General Liability': 'general liability',
    'Cyber Liability': 'cyber liability', 
    'Commercial Auto': 'commercial auto',
    'E&O Insurance': 'professional liability',
    'Property Insurance': 'property insurance',
    'EPLI': 'employment practices liability',
    'D&O Liability': 'directors and officers',
    'Legal Expense': 'legal expenses',
    'Pollution Liability': 'environmental liability'
  };
  
  return mapping[coverage] || coverage.toLowerCase();
};

const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  }
  return amount.toString();
};

const calculateRiskScore = (missing: Gap[], underinsured: Gap[]): number => {
  const severityWeights = { Critical: 4, High: 3, Medium: 2, Low: 1 };
  
  const missingScore = missing.reduce((sum, gap) => 
    sum + severityWeights[gap.severity as keyof typeof severityWeights], 0);
  const underinsuredScore = underinsured.reduce((sum, gap) => 
    sum + (severityWeights[gap.severity as keyof typeof severityWeights] * 0.5), 0);
  
  const totalScore = missingScore + underinsuredScore;
  const maxPossibleScore = RISK_RULES.length * 4; // All critical gaps
  
  return Math.max(0, 100 - Math.round((totalScore / maxPossibleScore) * 100));
};

// Convert ChatPDF analysis to company data format
export const convertAnalysisToCompanyData = (analysis: AnalysisResult): CompanyData => {
  // Extract company information from the policy text/summary
  const summary = analysis.summary.toLowerCase();
  
  // Basic company data extraction (this would be enhanced with better NLP)
  const extractEmployeeCount = (): number => {
    const match = summary.match(/(\d+)\s*employees?/i);
    return match ? parseInt(match[1]) : 10; // Default assumption
  };

  const extractIndustry = (): string => {
    if (summary.includes('technology') || summary.includes('software')) return 'Technology';
    if (summary.includes('manufacturing')) return 'Manufacturing';
    if (summary.includes('construction')) return 'Construction';
    if (summary.includes('finance') || summary.includes('financial')) return 'Finance';
    return 'General Business';
  };

  const extractFleetVehicles = (): number => {
    const match = summary.match(/(\d+)\s*vehicles?/i);
    return match ? parseInt(match[1]) : 0;
  };

  // Extract existing coverages from the analysis
  const coverages: Coverage[] = [];
  
  // Parse covered risks into coverage format
  if (analysis.risk_assessment?.risk_factors) {
    analysis.risk_assessment.risk_factors.forEach(risk => {
      const coverage = mapRiskToCoverage(risk);
      if (coverage) {
        coverages.push({
          name: coverage,
          limit: 1000000, // Default limit - would need better extraction
          status: 'Active'
        });
      }
    });
  }

  return {
    companyId: `C${Date.now()}`,
    industry: extractIndustry(),
    location: 'Unknown', // Would need better extraction
    employeeCount: extractEmployeeCount(),
    annualRevenue: 5000000, // Default assumption
    fleetVehicles: extractFleetVehicles(),
    hasPremises: summary.includes('property') || summary.includes('building'),
    handlesPII: summary.includes('data') || summary.includes('personal information'),
    coverages
  };
};

const mapRiskToCoverage = (risk: string): string | null => {
  const riskLower = risk.toLowerCase();
  if (riskLower.includes('liability')) return 'General Liability';
  if (riskLower.includes('cyber') || riskLower.includes('data')) return 'Cyber Liability';
  if (riskLower.includes('auto') || riskLower.includes('vehicle')) return 'Commercial Auto';
  if (riskLower.includes('property') || riskLower.includes('building')) return 'Property Insurance';
  if (riskLower.includes('professional')) return 'E&O Insurance';
  return null;
};
