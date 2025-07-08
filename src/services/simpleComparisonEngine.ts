import { ComparisonData } from "@/components/SimpleComparisonForm";

interface PolicyScore {
  overall: number;
  affordability: number;
  coverage: number;
  deductible: number;
  value: number;
}

interface PolicyAnalysis {
  scores: PolicyScore;
  strengths: string[];
  weaknesses: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

interface ComparisonResult {
  policy1: PolicyAnalysis;
  policy2: PolicyAnalysis;
  winner: 1 | 2 | 'tie';
  summary: string;
  recommendations: string[];
}

export const simpleComparisonEngine = {
  comparePolicy: async (data: ComparisonData): Promise<ComparisonResult> => {
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Calculate scores for both policies
    const policy1Analysis = analyzePolicy(data.policy1, data.policyType, data.country);
    const policy2Analysis = analyzePolicy(data.policy2, data.policyType, data.country);
    
    // Determine winner
    const scoreDifference = policy1Analysis.scores.overall - policy2Analysis.scores.overall;
    let winner: 1 | 2 | 'tie';
    
    if (Math.abs(scoreDifference) < 0.5) {
      winner = 'tie';
    } else {
      winner = scoreDifference > 0 ? 1 : 2;
    }
    
    // Generate summary and recommendations
    const summary = generateSummary(data, policy1Analysis, policy2Analysis, winner);
    const recommendations = generateRecommendations(data, policy1Analysis, policy2Analysis, winner);
    
    return {
      policy1: policy1Analysis,
      policy2: policy2Analysis,
      winner,
      summary,
      recommendations
    };
  }
};

function analyzePolicy(policy: ComparisonData['policy1'], policyType: string, country: string): PolicyAnalysis {
  // Get market benchmarks
  const benchmarks = getMarketBenchmarks(policyType, country);
  
  // Calculate affordability score (lower premium = higher score)
  const premiumRatio = policy.monthlyPremium / benchmarks.averagePremium;
  const affordabilityScore = Math.max(1, Math.min(10, 11 - (premiumRatio * 5)));
  
  // Calculate coverage score (higher coverage = higher score)
  const coverageRatio = policy.coverageAmount / benchmarks.averageCoverage;
  const coverageScore = Math.max(1, Math.min(10, coverageRatio * 5));
  
  // Calculate deductible score (optimal deductible range = higher score)
  const deductibleRatio = policy.deductible / benchmarks.averageDeductible;
  const deductibleScore = Math.max(1, Math.min(10, 10 - Math.abs(deductibleRatio - 1) * 5));
  
  // Calculate value score (coverage per dollar)
  const valueRatio = (policy.coverageAmount / policy.monthlyPremium) / (benchmarks.averageCoverage / benchmarks.averagePremium);
  const valueScore = Math.max(1, Math.min(10, valueRatio * 3));
  
  // Calculate overall score
  const overallScore = (affordabilityScore * 0.3 + coverageScore * 0.3 + deductibleScore * 0.2 + valueScore * 0.2);
  
  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' = 'medium';
  if (overallScore >= 7.5) riskLevel = 'low';
  else if (overallScore <= 5) riskLevel = 'high';
  
  // Generate strengths and weaknesses
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  if (affordabilityScore >= 7) {
    strengths.push("Competitively priced premium");
  } else if (affordabilityScore <= 4) {
    weaknesses.push("Premium is above market average");
  }
  
  if (coverageScore >= 7) {
    strengths.push("Excellent coverage amount");
  } else if (coverageScore <= 4) {
    weaknesses.push("Coverage amount may be insufficient");
  }
  
  if (deductibleScore >= 7) {
    strengths.push("Well-balanced deductible");
  } else if (deductibleScore <= 4) {
    weaknesses.push("Deductible structure needs review");
  }
  
  if (valueScore >= 7) {
    strengths.push("Great value for money");
  } else if (valueScore <= 4) {
    weaknesses.push("Value proposition could be better");
  }
  
  // Add policy-specific insights
  if (policy.details.toLowerCase().includes('comprehensive')) {
    strengths.push("Includes comprehensive coverage");
  }
  
  if (policy.details.toLowerCase().includes('roadside')) {
    strengths.push("Roadside assistance included");
  }
  
  return {
    scores: {
      overall: Math.round(overallScore * 10) / 10,
      affordability: Math.round(affordabilityScore * 10) / 10,
      coverage: Math.round(coverageScore * 10) / 10,
      deductible: Math.round(deductibleScore * 10) / 10,
      value: Math.round(valueScore * 10) / 10
    },
    strengths,
    weaknesses,
    riskLevel
  };
}

function getMarketBenchmarks(policyType: string, country: string) {
  const benchmarks: Record<string, Record<string, any>> = {
    auto: {
      US: { averagePremium: 150, averageCoverage: 100000, averageDeductible: 500 },
      UK: { averagePremium: 120, averageCoverage: 80000, averageDeductible: 400 },
      CA: { averagePremium: 130, averageCoverage: 90000, averageDeductible: 450 },
      AU: { averagePremium: 140, averageCoverage: 95000, averageDeductible: 500 },
      DE: { averagePremium: 110, averageCoverage: 75000, averageDeductible: 350 },
      FR: { averagePremium: 115, averageCoverage: 78000, averageDeductible: 375 },
      IN: { averagePremium: 80, averageCoverage: 50000, averageDeductible: 250 },
      JP: { averagePremium: 160, averageCoverage: 110000, averageDeductible: 550 },
      SG: { averagePremium: 135, averageCoverage: 85000, averageDeductible: 425 }
    },
    home: {
      US: { averagePremium: 200, averageCoverage: 250000, averageDeductible: 1000 },
      UK: { averagePremium: 150, averageCoverage: 200000, averageDeductible: 800 },
      CA: { averagePremium: 180, averageCoverage: 220000, averageDeductible: 900 },
      AU: { averagePremium: 170, averageCoverage: 210000, averageDeductible: 850 },
      DE: { averagePremium: 140, averageCoverage: 180000, averageDeductible: 700 },
      FR: { averagePremium: 145, averageCoverage: 185000, averageDeductible: 725 },
      IN: { averagePremium: 100, averageCoverage: 120000, averageDeductible: 500 },
      JP: { averagePremium: 190, averageCoverage: 240000, averageDeductible: 950 },
      SG: { averagePremium: 165, averageCoverage: 195000, averageDeductible: 800 }
    },
    health: {
      US: { averagePremium: 400, averageCoverage: 500000, averageDeductible: 2000 },
      UK: { averagePremium: 80, averageCoverage: 200000, averageDeductible: 500 },
      CA: { averagePremium: 120, averageCoverage: 300000, averageDeductible: 800 },
      AU: { averagePremium: 150, averageCoverage: 350000, averageDeductible: 1000 },
      DE: { averagePremium: 100, averageCoverage: 250000, averageDeductible: 600 },
      FR: { averagePremium: 110, averageCoverage: 275000, averageDeductible: 650 },
      IN: { averagePremium: 50, averageCoverage: 100000, averageDeductible: 300 },
      JP: { averagePremium: 200, averageCoverage: 400000, averageDeductible: 1200 },
      SG: { averagePremium: 180, averageCoverage: 380000, averageDeductible: 1100 }
    },
    life: {
      US: { averagePremium: 300, averageCoverage: 500000, averageDeductible: 0 },
      UK: { averagePremium: 250, averageCoverage: 400000, averageDeductible: 0 },
      CA: { averagePremium: 280, averageCoverage: 450000, averageDeductible: 0 },
      AU: { averagePremium: 270, averageCoverage: 425000, averageDeductible: 0 },
      DE: { averagePremium: 230, averageCoverage: 350000, averageDeductible: 0 },
      FR: { averagePremium: 240, averageCoverage: 375000, averageDeductible: 0 },
      IN: { averagePremium: 150, averageCoverage: 200000, averageDeductible: 0 },
      JP: { averagePremium: 320, averageCoverage: 550000, averageDeductible: 0 },
      SG: { averagePremium: 290, averageCoverage: 475000, averageDeductible: 0 }
    }
  };
  
  return benchmarks[policyType]?.[country] || benchmarks[policyType]?.US || { averagePremium: 150, averageCoverage: 100000, averageDeductible: 500 };
}

function generateSummary(data: ComparisonData, policy1: PolicyAnalysis, policy2: PolicyAnalysis, winner: 1 | 2 | 'tie'): string {
  if (winner === 'tie') {
    return `Both ${data.policy1.provider} and ${data.policy2.provider} offer competitive ${data.policyType} insurance options with similar overall value propositions.`;
  }
  
  const winnerPolicy = winner === 1 ? data.policy1 : data.policy2;
  const winnerAnalysis = winner === 1 ? policy1 : policy2;
  const loserPolicy = winner === 1 ? data.policy2 : data.policy1;
  
  const scoreDiff = Math.abs(policy1.scores.overall - policy2.scores.overall);
  
  if (scoreDiff > 2) {
    return `${winnerPolicy.provider} significantly outperforms ${loserPolicy.provider} with superior coverage and value proposition.`;
  } else if (scoreDiff > 1) {
    return `${winnerPolicy.provider} has a moderate advantage over ${loserPolicy.provider}, particularly in key areas like affordability and coverage.`;
  } else {
    return `${winnerPolicy.provider} edges out ${loserPolicy.provider} by a narrow margin, making this a close comparison.`;
  }
}

function generateRecommendations(data: ComparisonData, policy1: PolicyAnalysis, policy2: PolicyAnalysis, winner: 1 | 2 | 'tie'): string[] {
  const recommendations: string[] = [];
  
  if (winner === 1) {
    recommendations.push(`Consider choosing ${data.policy1.provider} as it offers better overall value for your ${data.policyType} insurance needs.`);
  } else if (winner === 2) {
    recommendations.push(`Consider choosing ${data.policy2.provider} as it offers better overall value for your ${data.policyType} insurance needs.`);
  } else {
    recommendations.push(`Both policies offer similar value. Consider other factors like customer service, claims process, and additional benefits.`);
  }
  
  // Add specific recommendations based on scores
  const policy1Affordable = policy1.scores.affordability > policy2.scores.affordability;
  const policy1Coverage = policy1.scores.coverage > policy2.scores.coverage;
  
  if (policy1Affordable && !policy1Coverage) {
    recommendations.push(`If budget is your priority, ${data.policy1.provider} offers better affordability, though ${data.policy2.provider} provides superior coverage.`);
  } else if (!policy1Affordable && policy1Coverage) {
    recommendations.push(`If maximum protection is important, ${data.policy1.provider} offers better coverage, though ${data.policy2.provider} is more budget-friendly.`);
  }
  
  // Generic recommendations
  recommendations.push(`Review the policy details and exclusions carefully before making your final decision.`);
  recommendations.push(`Consider contacting both insurers to discuss potential discounts or customization options.`);
  
  if (data.policyType === 'auto') {
    recommendations.push(`Look into bundling opportunities if you need multiple types of insurance coverage.`);
  }
  
  return recommendations;
}