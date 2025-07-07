
import { QuickAnalysisData } from '@/components/QuickAnalysisForm';

export interface QuickAnalysisResult {
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  scores: {
    affordability: number;
    coverage: number;
    deductible: number;
    value: number;
  };
  insights: string[];
  recommendations: string[];
  benchmarks: {
    averagePremium: number;
    recommendedCoverage: number;
    optimalDeductible: number;
  };
}

// Country-specific benchmarks and standards
const COUNTRY_BENCHMARKS = {
  US: {
    auto: { averagePremium: 1500, recommendedCoverage: 100000, optimalDeductible: 500, currency: 'USD' },
    home: { averagePremium: 1200, recommendedCoverage: 250000, optimalDeductible: 1000, currency: 'USD' },
    health: { averagePremium: 4800, recommendedCoverage: 1000000, optimalDeductible: 2000, currency: 'USD' },
    life: { averagePremium: 600, recommendedCoverage: 500000, optimalDeductible: 0, currency: 'USD' }
  },
  UK: {
    auto: { averagePremium: 800, recommendedCoverage: 50000, optimalDeductible: 300, currency: 'GBP' },
    home: { averagePremium: 600, recommendedCoverage: 150000, optimalDeductible: 500, currency: 'GBP' },
    health: { averagePremium: 0, recommendedCoverage: 0, optimalDeductible: 0, currency: 'GBP' }, // NHS coverage
    life: { averagePremium: 400, recommendedCoverage: 300000, optimalDeductible: 0, currency: 'GBP' }
  },
  CA: {
    auto: { averagePremium: 1200, recommendedCoverage: 200000, optimalDeductible: 500, currency: 'CAD' },
    home: { averagePremium: 1000, recommendedCoverage: 200000, optimalDeductible: 1000, currency: 'CAD' },
    health: { averagePremium: 800, recommendedCoverage: 500000, optimalDeductible: 500, currency: 'CAD' },
    life: { averagePremium: 500, recommendedCoverage: 400000, optimalDeductible: 0, currency: 'CAD' }
  },
  AU: {
    auto: { averagePremium: 1100, recommendedCoverage: 100000, optimalDeductible: 600, currency: 'AUD' },
    home: { averagePremium: 900, recommendedCoverage: 180000, optimalDeductible: 800, currency: 'AUD' },
    health: { averagePremium: 2000, recommendedCoverage: 500000, optimalDeductible: 750, currency: 'AUD' },
    life: { averagePremium: 450, recommendedCoverage: 350000, optimalDeductible: 0, currency: 'AUD' }
  },
  DE: {
    auto: { averagePremium: 900, recommendedCoverage: 50000000, optimalDeductible: 300, currency: 'EUR' },
    home: { averagePremium: 700, recommendedCoverage: 200000, optimalDeductible: 500, currency: 'EUR' },
    health: { averagePremium: 4500, recommendedCoverage: 1000000, optimalDeductible: 0, currency: 'EUR' },
    life: { averagePremium: 350, recommendedCoverage: 300000, optimalDeductible: 0, currency: 'EUR' }
  },
  FR: {
    auto: { averagePremium: 850, recommendedCoverage: 1000000, optimalDeductible: 400, currency: 'EUR' },
    home: { averagePremium: 650, recommendedCoverage: 150000, optimalDeductible: 400, currency: 'EUR' },
    health: { averagePremium: 1200, recommendedCoverage: 300000, optimalDeductible: 0, currency: 'EUR' },
    life: { averagePremium: 300, recommendedCoverage: 250000, optimalDeductible: 0, currency: 'EUR' }
  },
  IN: {
    auto: { averagePremium: 300, recommendedCoverage: 50000, optimalDeductible: 200, currency: 'INR' },
    home: { averagePremium: 200, recommendedCoverage: 100000, optimalDeductible: 500, currency: 'INR' },
    health: { averagePremium: 600, recommendedCoverage: 300000, optimalDeductible: 1000, currency: 'INR' },
    life: { averagePremium: 150, recommendedCoverage: 200000, optimalDeductible: 0, currency: 'INR' }
  },
  JP: {
    auto: { averagePremium: 6000, recommendedCoverage: 10000000, optimalDeductible: 30000, currency: 'JPY' },
    home: { averagePremium: 5000, recommendedCoverage: 20000000, optimalDeductible: 50000, currency: 'JPY' },
    health: { averagePremium: 36000, recommendedCoverage: 5000000, optimalDeductible: 10000, currency: 'JPY' },
    life: { averagePremium: 2400, recommendedCoverage: 10000000, optimalDeductible: 0, currency: 'JPY' }
  },
  SG: {
    auto: { averagePremium: 1000, recommendedCoverage: 100000, optimalDeductible: 1000, currency: 'SGD' },
    home: { averagePremium: 800, recommendedCoverage: 200000, optimalDeductible: 1000, currency: 'SGD' },
    health: { averagePremium: 2400, recommendedCoverage: 500000, optimalDeductible: 2000, currency: 'SGD' },
    life: { averagePremium: 600, recommendedCoverage: 400000, optimalDeductible: 0, currency: 'SGD' }
  }
};

// Country-specific regulatory requirements and insights
const COUNTRY_REGULATIONS = {
  US: {
    auto: ['Liability insurance is mandatory in most states', 'Consider uninsured motorist coverage'],
    home: ['Flood insurance typically requires separate policy', 'Earthquake coverage often excluded'],
    health: ['Essential health benefits must be covered', 'Annual out-of-pocket maximums apply'],
    life: ['No federal regulations, but state oversight applies']
  },
  UK: {
    auto: ['Third-party liability is mandatory', 'Comprehensive coverage recommended'],
    home: ['Buildings insurance required for mortgages', 'Contents insurance is optional but recommended'],
    health: ['Private health insurance supplements NHS', 'Consider critical illness cover'],
    life: ['No mandatory requirements', 'Consider income protection alongside life cover']
  },
  CA: {
    auto: ['Varies by province - check local requirements', 'No-fault insurance in some provinces'],
    home: ['Flood coverage often excluded', 'Overland water coverage increasingly important'],
    health: ['Provincial health plans provide basic coverage', 'Private insurance for additional benefits'],
    life: ['No mandatory requirements', 'Consider tax implications of policy structure']
  },
  AU: {
    auto: ['Compulsory Third Party (CTP) insurance mandatory', 'Comprehensive coverage recommended'],
    home: ['Natural disaster coverage varies by state', 'Flood coverage often requires separate policy'],
    health: ['Private health insurance rebates available', 'Medicare levy surcharge may apply'],
    life: ['Superannuation often includes basic life cover', 'Consider additional coverage needs']
  },
  DE: {
    auto: ['Third-party liability mandatory', 'High coverage limits required'],
    home: ['Household contents insurance recommended', 'Natural disaster coverage varies'],
    health: ['Statutory health insurance mandatory', 'Private insurance for higher earners'],
    life: ['No mandatory requirements', 'Tax advantages for certain policy types']
  },
  FR: {
    auto: ['Third-party liability mandatory', 'Comprehensive coverage recommended'],
    home: ['Home insurance mandatory for tenants', 'Natural disaster coverage included'],
    health: ['Social security provides basic coverage', 'Complementary insurance recommended'],
    life: ['Tax advantages for life insurance savings', 'Consider French succession laws']
  },
  IN: {
    auto: ['Third-party liability mandatory', 'Own damage coverage recommended'],
    home: ['Home insurance not mandatory but recommended', 'Natural disaster coverage important'],
    health: ['Health insurance increasingly important', 'Government schemes available for low income'],
    life: ['Life insurance encouraged through tax benefits', 'Term life often most cost-effective']
  },
  JP: {
    auto: ['Compulsory Automobile Liability Insurance mandatory', 'Optional insurance for comprehensive coverage'],
    home: ['Earthquake insurance available but separate', 'Fire insurance often required by lenders'],
    health: ['National Health Insurance provides basic coverage', 'Private insurance for additional benefits'],
    life: ['Life insurance very popular in Japan', 'Consider Japanese tax implications']
  },
  SG: {
    auto: ['Third-party liability mandatory', 'Comprehensive coverage recommended'],
    home: ['Home insurance not mandatory but recommended', 'Consider flood coverage due to climate'],
    health: ['Medisave provides basic coverage', 'Private insurance for comprehensive coverage'],
    life: ['CPF provides basic life coverage', 'Additional private coverage often needed']
  }
};

class QuickAnalysisEngine {
  
  /**
   * Main analysis function that processes form data and returns insights
   */
  public analyzePolicy(data: QuickAnalysisData): QuickAnalysisResult {
    console.log('Analyzing policy data:', data);
    
    const scores = this.calculateScores(data);
    const benchmarks = this.getBenchmarks(data.policyType, data.country);
    const insights = this.generateInsights(data, scores, benchmarks);
    const recommendations = this.generateRecommendations(data, scores, benchmarks);
    
    const overallScore = this.calculateOverallScore(scores);
    const riskLevel = this.determineRiskLevel(overallScore, scores);
    
    return {
      overallScore,
      riskLevel,
      scores,
      insights,
      recommendations,
      benchmarks
    };
  }
  
  /**
   * Calculate individual scores for different aspects
   */
  private calculateScores(data: QuickAnalysisData) {
    const affordabilityScore = this.calculateAffordabilityScore(data);
    const coverageScore = this.calculateCoverageScore(data);
    const deductibleScore = this.calculateDeductibleScore(data);
    const valueScore = this.calculateValueScore(data);
    
    return {
      affordability: affordabilityScore,
      coverage: coverageScore,
      deductible: deductibleScore,
      value: valueScore
    };
  }
  
  /**
   * Calculate affordability score based on premium vs recommended ratios
   */
  private calculateAffordabilityScore(data: QuickAnalysisData): number {
    const annualPremium = data.monthlyPremium * 12;
    const benchmarks = this.getBenchmarks(data.policyType, data.country);
    
    // Compare to average premium for policy type and country
    const ratio = annualPremium / benchmarks.averagePremium;
    
    if (ratio <= 0.8) return 10; // Excellent - below average
    if (ratio <= 1.0) return 8;  // Good - at average
    if (ratio <= 1.2) return 6;  // Fair - slightly above average
    if (ratio <= 1.5) return 4;  // Poor - significantly above average
    return 2; // Very poor - way above average
  }
  
  /**
   * Calculate coverage adequacy score
   */
  private calculateCoverageScore(data: QuickAnalysisData): number {
    const benchmarks = this.getBenchmarks(data.policyType, data.country);
    
    // Special handling for UK health insurance (NHS coverage)
    if (data.country === 'UK' && data.policyType === 'health') {
      return 8; // Good score as NHS provides basic coverage
    }
    
    const coverageRatio = data.coverageAmount / benchmarks.recommendedCoverage;
    
    if (coverageRatio >= 1.0) return 10; // Adequate or above
    if (coverageRatio >= 0.8) return 7;  // Mostly adequate
    if (coverageRatio >= 0.6) return 5;  // Somewhat inadequate
    if (coverageRatio >= 0.4) return 3;  // Significantly inadequate
    return 1; // Severely inadequate
  }
  
  /**
   * Calculate deductible optimization score
   */
  private calculateDeductibleScore(data: QuickAnalysisData): number {
    const benchmarks = this.getBenchmarks(data.policyType, data.country);
    
    // Handle cases where deductible is not applicable (e.g., some life insurance)
    if (benchmarks.optimalDeductible === 0) {
      return data.deductible === 0 ? 10 : 7;
    }
    
    const deductibleRatio = data.deductible / benchmarks.optimalDeductible;
    
    // Optimal range is 0.5 to 1.5 of recommended deductible
    if (deductibleRatio >= 0.5 && deductibleRatio <= 1.5) return 10;
    if (deductibleRatio >= 0.3 && deductibleRatio <= 2.0) return 7;
    if (deductibleRatio >= 0.1 && deductibleRatio <= 3.0) return 5;
    return 3;
  }
  
  /**
   * Calculate value score (premium efficiency)
   */
  private calculateValueScore(data: QuickAnalysisData): number {
    const annualPremium = data.monthlyPremium * 12;
    const coveragePerDollar = data.coverageAmount / annualPremium;
    
    // Policy type and country specific value thresholds
    const valueThresholds = this.getValueThresholds(data.policyType, data.country);
    
    if (coveragePerDollar >= valueThresholds.excellent) return 10;
    if (coveragePerDollar >= valueThresholds.good) return 8;
    if (coveragePerDollar >= valueThresholds.fair) return 6;
    if (coveragePerDollar >= valueThresholds.poor) return 4;
    return 2;
  }
  
  /**
   * Get benchmarks for different policy types and countries
   */
  private getBenchmarks(policyType: string, country: string) {
    const countryData = COUNTRY_BENCHMARKS[country as keyof typeof COUNTRY_BENCHMARKS];
    if (!countryData) {
      // Default to US benchmarks if country not found
      return COUNTRY_BENCHMARKS.US[policyType as keyof typeof COUNTRY_BENCHMARKS.US] || COUNTRY_BENCHMARKS.US.auto;
    }
    
    return countryData[policyType as keyof typeof countryData] || countryData.auto;
  }
  
  /**
   * Get value thresholds for coverage per dollar spent
   */
  private getValueThresholds(policyType: string, country: string) {
    // Base thresholds adjusted by country economic factors
    const baseThresholds = {
      auto: { excellent: 80, good: 60, fair: 40, poor: 20 },
      home: { excellent: 250, good: 200, fair: 150, poor: 100 },
      health: { excellent: 250, good: 200, fair: 150, poor: 100 },
      life: { excellent: 1000, good: 800, fair: 600, poor: 400 }
    };
    
    // Country multipliers based on economic factors
    const countryMultipliers = {
      US: 1.0, UK: 1.2, CA: 1.1, AU: 1.1, DE: 1.3, FR: 1.2, IN: 0.3, JP: 0.1, SG: 1.0
    };
    
    const multiplier = countryMultipliers[country as keyof typeof countryMultipliers] || 1.0;
    const baseThreshold = baseThresholds[policyType as keyof typeof baseThresholds] || baseThresholds.auto;
    
    return {
      excellent: baseThreshold.excellent * multiplier,
      good: baseThreshold.good * multiplier,
      fair: baseThreshold.fair * multiplier,
      poor: baseThreshold.poor * multiplier
    };
  }
  
  /**
   * Calculate overall score from individual scores
   */
  private calculateOverallScore(scores: any): number {
    const weights = {
      affordability: 0.3,
      coverage: 0.3,
      deductible: 0.2,
      value: 0.2
    };
    
    return Math.round(
      (scores.affordability * weights.affordability +
       scores.coverage * weights.coverage +
       scores.deductible * weights.deductible +
       scores.value * weights.value) * 100
    ) / 100;
  }
  
  /**
   * Determine risk level based on scores
   */
  private determineRiskLevel(overallScore: number, scores: any): 'low' | 'medium' | 'high' {
    if (overallScore >= 8 && scores.coverage >= 7) return 'low';
    if (overallScore >= 6 && scores.coverage >= 5) return 'medium';
    return 'high';
  }
  
  /**
   * Generate insights based on analysis
   */
  private generateInsights(data: QuickAnalysisData, scores: any, benchmarks: any): string[] {
    const insights: string[] = [];
    const annualPremium = data.monthlyPremium * 12;
    const countryName = this.getCountryName(data.country);
    
    // Premium insights
    if (scores.affordability >= 8) {
      insights.push(`✅ Your premium ($${annualPremium}/year) is competitive for ${countryName} standards.`);
    } else if (scores.affordability <= 4) {
      insights.push(`⚠️ Your premium ($${annualPremium}/year) is ${Math.round((annualPremium / benchmarks.averagePremium - 1) * 100)}% above ${countryName} average.`);
    }
    
    // Coverage insights with country-specific context
    if (scores.coverage >= 8) {
      insights.push(`✅ Your coverage amount meets ${countryName} recommended levels.`);
    } else {
      insights.push(`⚠️ Your coverage may be insufficient for ${countryName}. Consider increasing coverage.`);
    }
    
    // Country-specific regulatory insights
    const regulations = COUNTRY_REGULATIONS[data.country as keyof typeof COUNTRY_REGULATIONS];
    if (regulations && regulations[data.policyType as keyof typeof regulations]) {
      const policyRegulations = regulations[data.policyType as keyof typeof regulations] as string[];
      insights.push(`💡 ${countryName} requirement: ${policyRegulations[0]}`);
    }
    
    // Deductible insights
    if (scores.deductible >= 8) {
      insights.push(`✅ Your deductible is well-optimized for ${countryName} standards.`);
    } else {
      insights.push(`💡 Consider adjusting your deductible based on ${countryName} practices.`);
    }
    
    // Value insights
    if (scores.value >= 8) {
      insights.push(`✅ You're getting good value compared to ${countryName} market rates.`);
    } else {
      insights.push(`💰 Your policy may not offer optimal value for the ${countryName} market.`);
    }
    
    return insights;
  }
  
  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(data: QuickAnalysisData, scores: any, benchmarks: any): string[] {
    const recommendations: string[] = [];
    const countryName = this.getCountryName(data.country);
    
    if (scores.affordability <= 5) {
      recommendations.push(`Shop around with ${countryName} insurers to compare rates`);
      recommendations.push(`Ask about country-specific discounts and programs`);
    }
    
    if (scores.coverage <= 5) {
      recommendations.push(`Consider increasing coverage to meet ${countryName} standards`);
      recommendations.push(`Review local regulations and mandatory coverage requirements`);
    }
    
    if (scores.deductible <= 5) {
      recommendations.push(`Adjust deductible based on ${countryName} economic conditions`);
      recommendations.push(`Consider local cost of living when setting deductible amounts`);
    }
    
    if (scores.value <= 5) {
      recommendations.push(`Compare quotes from multiple ${countryName} insurers`);
      recommendations.push(`Consider working with local insurance brokers familiar with ${countryName} market`);
    }
    
    // Country-specific recommendations
    const regulations = COUNTRY_REGULATIONS[data.country as keyof typeof COUNTRY_REGULATIONS];
    if (regulations && regulations[data.policyType as keyof typeof regulations]) {
      const policyRegulations = regulations[data.policyType as keyof typeof regulations] as string[];
      if (policyRegulations.length > 1) {
        recommendations.push(policyRegulations[1]);
      }
    }
    
    // General recommendations
    recommendations.push(`Review your policy annually to ensure it meets current ${countryName} standards`);
    recommendations.push(`Stay informed about regulatory changes in ${countryName}`);
    
    return recommendations;
  }
  
  /**
   * Get country display name
   */
  private getCountryName(countryCode: string): string {
    const countryNames = {
      US: 'United States',
      UK: 'United Kingdom',
      CA: 'Canada',
      AU: 'Australia',
      DE: 'Germany',
      FR: 'France',
      IN: 'India',
      JP: 'Japan',
      SG: 'Singapore'
    };
    
    return countryNames[countryCode as keyof typeof countryNames] || countryCode;
  }
}

// Export singleton instance
export const quickAnalysisEngine = new QuickAnalysisEngine();
