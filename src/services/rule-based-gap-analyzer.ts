
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

// Updated gap output format as specified
export interface CoverageGap {
  category: string;
  covered: boolean;
  status: 'Missing' | 'Underinsured' | 'Adequate';
  coverageName: string;
  coverageLimit: number;
  recommendedMinimum: number;
  severity: string;
  estimatedExposure: number;
  complianceRisk: boolean;
  recommendation: string;
  colorCode: string;
}

export interface GapAnalysisResult {
  coverageGaps: CoverageGap[];
  overallRiskScore: number;
  criticalGaps: number;
  totalGaps: number;
  adequateCoverages: number;
}

// Rule-based framework from the image
const RISK_RULES: RiskRule[] = [
  {
    riskCategory: "General Liability",
    requiredCondition: "Always required",
    requiredCoverage: "General Liability",
    minLimit: 1000000,
    severity: "High",
    conditionCheck: () => true
  },
  {
    riskCategory: "Cyber Risk",
    requiredCondition: "If handlesPII = true",
    requiredCoverage: "Cyber Liability",
    minLimit: 2000000,
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
    riskCategory: "Environmental Risk",
    requiredCondition: "If industry = Manufacturing/Construction",
    requiredCoverage: "Pollution Liability",
    minLimit: 1000000,
    severity: "High",
    conditionCheck: (data: CompanyData) => 
      ['Manufacturing', 'Construction'].includes(data.industry)
  }
];

export const analyzeGaps = (companyData: CompanyData): GapAnalysisResult => {
  const coverageGaps: CoverageGap[] = [];

  // Check each rule against the company data
  RISK_RULES.forEach(rule => {
    if (rule.conditionCheck(companyData)) {
      const existingCoverage = companyData.coverages.find(c => 
        normalizeCoverage(c.name) === normalizeRequiredCoverage(rule.requiredCoverage)
      );

      if (!existingCoverage) {
        // Missing coverage
        coverageGaps.push({
          category: rule.riskCategory,
          covered: false,
          status: 'Missing',
          coverageName: rule.requiredCoverage,
          coverageLimit: 0,
          recommendedMinimum: rule.minLimit,
          severity: rule.severity,
          estimatedExposure: calculateEstimatedExposure(rule.riskCategory, companyData),
          complianceRisk: rule.severity === 'Critical' || rule.severity === 'High',
          recommendation: `Add ${rule.requiredCoverage} with minimum limit of ${formatCurrency(rule.minLimit)} due to ${rule.requiredCondition.toLowerCase()}.`,
          colorCode: getSeverityColorCode(rule.severity)
        });
      } else if (existingCoverage.limit < rule.minLimit && rule.minLimit > 0) {
        // Underinsured coverage
        coverageGaps.push({
          category: rule.riskCategory,
          covered: true,
          status: 'Underinsured',
          coverageName: rule.requiredCoverage,
          coverageLimit: existingCoverage.limit,
          recommendedMinimum: rule.minLimit,
          severity: rule.severity,
          estimatedExposure: calculateEstimatedExposure(rule.riskCategory, companyData),
          complianceRisk: rule.severity === 'Critical' || rule.severity === 'High',
          recommendation: `Increase ${rule.requiredCoverage} coverage from ${formatCurrency(existingCoverage.limit)} to at least ${formatCurrency(rule.minLimit)}.`,
          colorCode: getSeverityColorCode(rule.severity)
        });
      } else if (existingCoverage && existingCoverage.limit >= rule.minLimit) {
        // Adequate coverage
        coverageGaps.push({
          category: rule.riskCategory,
          covered: true,
          status: 'Adequate',
          coverageName: rule.requiredCoverage,
          coverageLimit: existingCoverage.limit,
          recommendedMinimum: rule.minLimit,
          severity: 'Low',
          estimatedExposure: 0,
          complianceRisk: false,
          recommendation: `Current ${rule.requiredCoverage} coverage is adequate.`,
          colorCode: '#10B981'
        });
      }
    }
  });

  const criticalGaps = coverageGaps.filter(gap => 
    gap.severity === 'Critical' && gap.status !== 'Adequate'
  ).length;

  const totalGaps = coverageGaps.filter(gap => gap.status !== 'Adequate').length;
  const adequateCoverages = coverageGaps.filter(gap => gap.status === 'Adequate').length;

  const overallRiskScore = calculateRiskScore(coverageGaps);

  return {
    coverageGaps,
    overallRiskScore,
    criticalGaps,
    totalGaps,
    adequateCoverages
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
    'Pollution Liability': 'environmental liability'
  };
  
  return mapping[coverage] || coverage.toLowerCase();
};

const calculateEstimatedExposure = (riskCategory: string, companyData: CompanyData): number => {
  // Calculate estimated exposure based on company profile
  const { annualRevenue, employeeCount, fleetVehicles } = companyData;
  
  switch (riskCategory) {
    case 'Cyber Risk':
      return Math.min(annualRevenue * 0.05, 500000); // 5% of revenue or max $500K
    case 'General Liability':
      return Math.min(annualRevenue * 0.02, 250000); // 2% of revenue or max $250K
    case 'Employment Risk':
      return employeeCount * 5000; // $5K per employee
    case 'Auto/Fleet':
      return fleetVehicles * 50000; // $50K per vehicle
    case 'Professional Risk':
      return Math.min(annualRevenue * 0.03, 300000); // 3% of revenue or max $300K
    case 'Premises Risk':
      return Math.min(annualRevenue * 0.01, 200000); // 1% of revenue or max $200K
    case 'Executive Risk':
      return Math.min(annualRevenue * 0.02, 400000); // 2% of revenue or max $400K
    case 'Environmental Risk':
      return Math.min(annualRevenue * 0.04, 600000); // 4% of revenue or max $600K
    default:
      return 100000; // Default exposure
  }
};

const getSeverityColorCode = (severity: string): string => {
  switch (severity) {
    case 'Critical': return '#DC2626'; // Red
    case 'High': return '#FFA500'; // Orange
    case 'Medium': return '#F59E0B'; // Amber
    case 'Low': return '#10B981'; // Green
    default: return '#6B7280'; // Gray
  }
};

const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount}`;
};

const calculateRiskScore = (gaps: CoverageGap[]): number => {
  if (gaps.length === 0) return 100;
  
  const severityWeights = { Critical: 4, High: 3, Medium: 2, Low: 1 };
  
  const totalWeightedScore = gaps.reduce((sum, gap) => {
    const weight = severityWeights[gap.severity as keyof typeof severityWeights] || 1;
    if (gap.status === 'Missing') return sum + weight;
    if (gap.status === 'Underinsured') return sum + (weight * 0.5);
    return sum; // Adequate coverage doesn't reduce score
  }, 0);
  
  const maxPossibleScore = gaps.length * 4; // All gaps as critical
  const scoreReduction = (totalWeightedScore / maxPossibleScore) * 100;
  
  return Math.max(0, Math.round(100 - scoreReduction));
};

// Convert ChatPDF analysis to company data format
export const convertAnalysisToCompanyData = (analysis: AnalysisResult): CompanyData => {
  const summary = analysis.summary.toLowerCase();
  
  const extractEmployeeCount = (): number => {
    const match = summary.match(/(\d+)\s*employees?/i);
    return match ? parseInt(match[1]) : 15; // Default assumption
  };

  const extractIndustry = (): string => {
    if (summary.includes('technology') || summary.includes('software')) return 'Technology';
    if (summary.includes('manufacturing')) return 'Manufacturing';
    if (summary.includes('construction')) return 'Construction';
    if (summary.includes('finance') || summary.includes('financial')) return 'Finance';
    if (summary.includes('consulting')) return 'Consulting';
    if (summary.includes('service')) return 'Service';
    return 'General Business';
  };

  const extractFleetVehicles = (): number => {
    const match = summary.match(/(\d+)\s*vehicles?/i);
    return match ? parseInt(match[1]) : 0;
  };

  const extractRevenue = (): number => {
    const match = summary.match(/\$?([\d,]+)(?:k|m|million|thousand)/i);
    if (match) {
      const value = parseInt(match[1].replace(/,/g, ''));
      if (match[0].toLowerCase().includes('m')) return value * 1000000;
      if (match[0].toLowerCase().includes('k')) return value * 1000;
    }
    return 5000000; // Default $5M
  };

  // Extract existing coverages from the analysis
  const coverages: Coverage[] = [];
  
  if (analysis.risk_assessment?.risk_factors) {
    analysis.risk_assessment.risk_factors.forEach(risk => {
      const coverage = mapRiskToCoverage(risk);
      if (coverage) {
        coverages.push({
          name: coverage,
          limit: extractCoverageLimit(summary, coverage),
          status: 'Active'
        });
      }
    });
  }

  return {
    companyId: `C${Date.now()}`,
    industry: extractIndustry(),
    location: 'Unknown',
    employeeCount: extractEmployeeCount(),
    annualRevenue: extractRevenue(),
    fleetVehicles: extractFleetVehicles(),
    hasPremises: summary.includes('property') || summary.includes('building') || summary.includes('premises'),
    handlesPII: summary.includes('data') || summary.includes('personal information') || summary.includes('cyber'),
    coverages
  };
};

const mapRiskToCoverage = (risk: string): string | null => {
  const riskLower = risk.toLowerCase();
  if (riskLower.includes('liability') && !riskLower.includes('cyber')) return 'General Liability';
  if (riskLower.includes('cyber') || riskLower.includes('data')) return 'Cyber Liability';
  if (riskLower.includes('auto') || riskLower.includes('vehicle')) return 'Commercial Auto';
  if (riskLower.includes('property') || riskLower.includes('building')) return 'Property Insurance';
  if (riskLower.includes('professional') || riskLower.includes('e&o')) return 'E&O Insurance';
  if (riskLower.includes('employment') || riskLower.includes('epli')) return 'EPLI';
  if (riskLower.includes('directors') || riskLower.includes('d&o')) return 'D&O Liability';
  return null;
};

const extractCoverageLimit = (summary: string, coverageType: string): number => {
  // Try to extract coverage limits from summary text
  const patterns = [
    /\$?([\d,]+)(?:k|m|million|thousand)/gi,
    /limit[s]?\s*[of]?\s*\$?([\d,]+)/gi
  ];
  
  for (const pattern of patterns) {
    const matches = summary.match(pattern);
    if (matches && matches.length > 0) {
      const match = matches[0];
      const value = parseInt(match.replace(/[^\d]/g, ''));
      if (match.toLowerCase().includes('m')) return value * 1000000;
      if (match.toLowerCase().includes('k')) return value * 1000;
      return value;
    }
  }
  
  // Default limits based on coverage type
  switch (coverageType) {
    case 'General Liability': return 1000000;
    case 'Cyber Liability': return 500000;
    case 'Commercial Auto': return 1000000;
    case 'Property Insurance': return 1000000;
    case 'E&O Insurance': return 1000000;
    case 'EPLI': return 500000;
    case 'D&O Liability': return 1000000;
    default: return 500000;
  }
};
