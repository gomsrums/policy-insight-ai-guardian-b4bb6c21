
import { GapAnalysisResult, CoverageGap, CompanyData } from "./rule-based-gap-analyzer";

export interface InfographicCompanyData {
  companyId: string;
  companyName: string;
  overallRiskScore: number;
  estimatedTotalExposure: number;
  gapSummary: {
    totalGaps: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  coverageStatusByCategory: Array<{
    category: string;
    status: "Covered" | "Underinsured" | "Missing";
    color: string;
  }>;
  topGaps: Array<{
    category: string;
    severity: string;
    coverageLimit: number;
    recommendedMinimum: number;
    estimatedExposure: number;
    recommendation: string;
  }>;
}

export interface DetailedReportData {
  companyId: string;
  companyName: string;
  generatedDate: string;
  executiveSummary: {
    overallRiskScore: number;
    totalGaps: number;
    criticalIssues: number;
    estimatedTotalExposure: number;
    complianceStatus: "Compliant" | "Non-Compliant" | "Partial";
  };
  riskBreakdown: Array<{
    category: string;
    riskLevel: "Critical" | "High" | "Medium" | "Low";
    status: "Covered" | "Underinsured" | "Missing";
    currentCoverage: number;
    recommendedCoverage: number;
    gapAmount: number;
    estimatedExposure: number;
    priority: number;
    actionRequired: string;
    timeline: "Immediate" | "30 Days" | "90 Days" | "Annual Review";
  }>;
  recommendations: Array<{
    priority: number;
    category: string;
    action: string;
    justification: string;
    estimatedCost: string;
    timeline: string;
    complianceImpact: boolean;
  }>;
  companyProfile: {
    industry: string;
    location: string;
    employeeCount: number;
    annualRevenue: number;
    riskFactors: string[];
  };
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case "Covered": return "#4CAF50";
    case "Underinsured": return "#FFA500";
    case "Missing": return "#FF5252";
    default: return "#9E9E9E";
  }
};

const getSeverityWeight = (severity: string): number => {
  switch (severity.toLowerCase()) {
    case "critical": return 4;
    case "high": return 3;
    case "medium": return 2;
    case "low": return 1;
    default: return 1;
  }
};

const getTimelineFromSeverity = (severity: string): "Immediate" | "30 Days" | "90 Days" | "Annual Review" => {
  switch (severity.toLowerCase()) {
    case "critical": return "Immediate";
    case "high": return "30 Days";
    case "medium": return "90 Days";
    case "low": return "Annual Review";
    default: return "Annual Review";
  }
};

const estimateCostRange = (recommendedMinimum: number, category: string): string => {
  // Simple cost estimation based on coverage amount and type
  const basePremiumRate = {
    "General Liability": 0.002,
    "Cyber Risk": 0.008,
    "Professional Risk": 0.004,
    "Auto/Fleet": 0.015,
    "Employment Risk": 0.003,
    "Executive Risk": 0.005,
    "Premises Risk": 0.001,
    "Environmental Risk": 0.006
  };

  const rate = basePremiumRate[category as keyof typeof basePremiumRate] || 0.003;
  const estimatedAnnualPremium = recommendedMinimum * rate;
  
  if (estimatedAnnualPremium < 1000) return "$500-$1,000";
  if (estimatedAnnualPremium < 5000) return "$1,000-$5,000";
  if (estimatedAnnualPremium < 10000) return "$5,000-$10,000";
  if (estimatedAnnualPremium < 25000) return "$10,000-$25,000";
  return "$25,000+";
};

export const transformToInfographicData = (
  gapAnalysis: GapAnalysisResult,
  companyData: CompanyData,
  companyName?: string
): InfographicCompanyData => {
  // Calculate gap summary by severity
  const gapSummary = {
    totalGaps: gapAnalysis.totalGaps,
    critical: gapAnalysis.coverageGaps.filter(gap => 
      gap.severity === "Critical" && gap.status !== "Adequate"
    ).length,
    high: gapAnalysis.coverageGaps.filter(gap => 
      gap.severity === "High" && gap.status !== "Adequate"
    ).length,
    medium: gapAnalysis.coverageGaps.filter(gap => 
      gap.severity === "Medium" && gap.status !== "Adequate"
    ).length,
    low: gapAnalysis.coverageGaps.filter(gap => 
      gap.severity === "Low" && gap.status !== "Adequate"
    ).length,
  };

  // Create coverage status by category
  const coverageStatusByCategory = gapAnalysis.coverageGaps.map(gap => ({
    category: gap.category,
    status: gap.status === "Adequate" ? "Covered" as const : 
           gap.status === "Missing" ? "Missing" as const : "Underinsured" as const,
    color: getStatusColor(gap.status === "Adequate" ? "Covered" : gap.status)
  }));

  // Get top gaps (highest severity and exposure)
  const topGaps = gapAnalysis.coverageGaps
    .filter(gap => gap.status !== "Adequate")
    .sort((a, b) => {
      const severityDiff = getSeverityWeight(b.severity) - getSeverityWeight(a.severity);
      if (severityDiff !== 0) return severityDiff;
      return b.estimatedExposure - a.estimatedExposure;
    })
    .slice(0, 5)
    .map(gap => ({
      category: gap.category,
      severity: gap.severity,
      coverageLimit: gap.coverageLimit,
      recommendedMinimum: gap.recommendedMinimum,
      estimatedExposure: gap.estimatedExposure,
      recommendation: gap.recommendation
    }));

  // Calculate total estimated exposure
  const estimatedTotalExposure = gapAnalysis.coverageGaps
    .filter(gap => gap.status !== "Adequate")
    .reduce((sum, gap) => sum + gap.estimatedExposure, 0);

  return {
    companyId: companyData.companyId,
    companyName: companyName || `${companyData.industry} Company`,
    overallRiskScore: gapAnalysis.overallRiskScore,
    estimatedTotalExposure,
    gapSummary,
    coverageStatusByCategory,
    topGaps
  };
};

export const transformToDetailedReport = (
  gapAnalysis: GapAnalysisResult,
  companyData: CompanyData,
  companyName?: string
): DetailedReportData => {
  const complianceStatus = gapAnalysis.criticalGaps > 0 ? "Non-Compliant" :
                          gapAnalysis.totalGaps > 0 ? "Partial" : "Compliant";

  // Create detailed risk breakdown
  const riskBreakdown = gapAnalysis.coverageGaps
    .map((gap, index) => ({
      category: gap.category,
      riskLevel: gap.severity as "Critical" | "High" | "Medium" | "Low",
      status: gap.status === "Adequate" ? "Covered" as const :
             gap.status === "Missing" ? "Missing" as const : "Underinsured" as const,
      currentCoverage: gap.coverageLimit,
      recommendedCoverage: gap.recommendedMinimum,
      gapAmount: Math.max(0, gap.recommendedMinimum - gap.coverageLimit),
      estimatedExposure: gap.estimatedExposure,
      priority: getSeverityWeight(gap.severity),
      actionRequired: gap.recommendation,
      timeline: getTimelineFromSeverity(gap.severity)
    }))
    .sort((a, b) => b.priority - a.priority);

  // Create prioritized recommendations
  const recommendations = gapAnalysis.coverageGaps
    .filter(gap => gap.status !== "Adequate")
    .map((gap, index) => ({
      priority: getSeverityWeight(gap.severity),
      category: gap.category,
      action: gap.recommendation,
      justification: `Current exposure of ${formatCurrency(gap.estimatedExposure)} exceeds coverage limits`,
      estimatedCost: estimateCostRange(gap.recommendedMinimum, gap.category),
      timeline: getTimelineFromSeverity(gap.severity),
      complianceImpact: gap.complianceRisk
    }))
    .sort((a, b) => b.priority - a.priority);

  // Identify risk factors
  const riskFactors: string[] = [];
  if (companyData.handlesPII) riskFactors.push("Handles Personal Data");
  if (companyData.fleetVehicles > 0) riskFactors.push(`Fleet of ${companyData.fleetVehicles} vehicles`);
  if (companyData.employeeCount > 50) riskFactors.push("Large workforce");
  if (companyData.hasPremises) riskFactors.push("Physical premises");
  if (companyData.annualRevenue > 5000000) riskFactors.push("High revenue operations");

  return {
    companyId: companyData.companyId,
    companyName: companyName || `${companyData.industry} Company`,
    generatedDate: new Date().toISOString(),
    executiveSummary: {
      overallRiskScore: gapAnalysis.overallRiskScore,
      totalGaps: gapAnalysis.totalGaps,
      criticalIssues: gapAnalysis.criticalGaps,
      estimatedTotalExposure: gapAnalysis.coverageGaps
        .filter(gap => gap.status !== "Adequate")
        .reduce((sum, gap) => sum + gap.estimatedExposure, 0),
      complianceStatus
    },
    riskBreakdown,
    recommendations,
    companyProfile: {
      industry: companyData.industry,
      location: companyData.location,
      employeeCount: companyData.employeeCount,
      annualRevenue: companyData.annualRevenue,
      riskFactors
    }
  };
};

const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount}`;
};

// Utility function to generate chart data for different visualization types
export const generateChartData = (infographicData: InfographicCompanyData) => {
  return {
    // Pie chart data for coverage status
    coverageStatusPieChart: infographicData.coverageStatusByCategory.map(item => ({
      name: item.status,
      value: 1,
      color: item.color,
      category: item.category
    })),

    // Bar chart data for gaps by severity
    gapsBySeverity: [
      { name: "Critical", value: infographicData.gapSummary.critical, color: "#FF5252" },
      { name: "High", value: infographicData.gapSummary.high, color: "#FFA500" },
      { name: "Medium", value: infographicData.gapSummary.medium, color: "#F59E0B" },
      { name: "Low", value: infographicData.gapSummary.low, color: "#10B981" }
    ],

    // Exposure by category
    exposureByCategory: infographicData.topGaps.map(gap => ({
      category: gap.category,
      exposure: gap.estimatedExposure,
      severity: gap.severity,
      color: gap.severity === "Critical" ? "#FF5252" :
             gap.severity === "High" ? "#FFA500" :
             gap.severity === "Medium" ? "#F59E0B" : "#10B981"
    })),

    // Risk score gauge data
    riskScoreGauge: {
      score: infographicData.overallRiskScore,
      label: infographicData.overallRiskScore >= 80 ? "Low Risk" :
             infographicData.overallRiskScore >= 60 ? "Medium Risk" : "High Risk",
      color: infographicData.overallRiskScore >= 80 ? "#10B981" :
             infographicData.overallRiskScore >= 60 ? "#F59E0B" : "#FF5252"
    }
  };
};
