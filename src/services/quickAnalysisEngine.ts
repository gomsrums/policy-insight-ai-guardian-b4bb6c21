
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

class QuickAnalysisEngine {
  
  /**
   * Main analysis function that processes form data and returns insights
   */
  public analyzePolicy(data: QuickAnalysisData): QuickAnalysisResult {
    console.log('Analyzing policy data:', data);
    
    const scores = this.calculateScores(data);
    const benchmarks = this.getBenchmarks(data.policyType);
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
    const benchmarks = this.getBenchmarks(data.policyType);
    
    // Compare to average premium for policy type
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
    const benchmarks = this.getBenchmarks(data.policyType);
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
    const benchmarks = this.getBenchmarks(data.policyType);
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
    
    // Policy type specific value thresholds
    const valueThresholds = this.getValueThresholds(data.policyType);
    
    if (coveragePerDollar >= valueThresholds.excellent) return 10;
    if (coveragePerDollar >= valueThresholds.good) return 8;
    if (coveragePerDollar >= valueThresholds.fair) return 6;
    if (coveragePerDollar >= valueThresholds.poor) return 4;
    return 2;
  }
  
  /**
   * Get benchmarks for different policy types
   */
  private getBenchmarks(policyType: string) {
    const benchmarks = {
      auto: {
        averagePremium: 1500,
        recommendedCoverage: 100000,
        optimalDeductible: 500
      },
      home: {
        averagePremium: 1200,
        recommendedCoverage: 250000,
        optimalDeductible: 1000
      },
      health: {
        averagePremium: 4800,
        recommendedCoverage: 1000000,
        optimalDeductible: 2000
      },
      life: {
        averagePremium: 600,
        recommendedCoverage: 500000,
        optimalDeductible: 0
      }
    };
    
    return benchmarks[policyType as keyof typeof benchmarks] || benchmarks.auto;
  }
  
  /**
   * Get value thresholds for coverage per dollar spent
   */
  private getValueThresholds(policyType: string) {
    const thresholds = {
      auto: { excellent: 80, good: 60, fair: 40, poor: 20 },
      home: { excellent: 250, good: 200, fair: 150, poor: 100 },
      health: { excellent: 250, good: 200, fair: 150, poor: 100 },
      life: { excellent: 1000, good: 800, fair: 600, poor: 400 }
    };
    
    return thresholds[policyType as keyof typeof thresholds] || thresholds.auto;
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
    
    // Premium insights
    if (scores.affordability >= 8) {
      insights.push(`✅ Your premium ($${annualPremium}/year) is competitive compared to market average.`);
    } else if (scores.affordability <= 4) {
      insights.push(`⚠️ Your premium ($${annualPremium}/year) is ${Math.round((annualPremium / benchmarks.averagePremium - 1) * 100)}% above market average.`);
    }
    
    // Coverage insights
    if (scores.coverage >= 8) {
      insights.push(`✅ Your coverage amount ($${data.coverageAmount.toLocaleString()}) meets recommended levels.`);
    } else {
      insights.push(`⚠️ Your coverage may be insufficient. Consider increasing to at least $${benchmarks.recommendedCoverage.toLocaleString()}.`);
    }
    
    // Deductible insights
    if (scores.deductible >= 8) {
      insights.push(`✅ Your deductible ($${data.deductible}) is well-optimized for your policy type.`);
    } else {
      insights.push(`💡 Consider adjusting your deductible to around $${benchmarks.optimalDeductible} for better balance.`);
    }
    
    // Value insights
    if (scores.value >= 8) {
      insights.push(`✅ You're getting good value with $${Math.round(data.coverageAmount / annualPremium)} coverage per dollar spent.`);
    } else {
      insights.push(`💰 Your policy may not offer optimal value. Consider shopping around for better rates.`);
    }
    
    return insights;
  }
  
  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(data: QuickAnalysisData, scores: any, benchmarks: any): string[] {
    const recommendations: string[] = [];
    
    if (scores.affordability <= 5) {
      recommendations.push("Shop around with multiple insurers to compare rates");
      recommendations.push("Ask about available discounts (bundling, safe driver, etc.)");
    }
    
    if (scores.coverage <= 5) {
      recommendations.push(`Consider increasing coverage to at least $${benchmarks.recommendedCoverage.toLocaleString()}`);
      recommendations.push("Review your assets to ensure adequate protection");
    }
    
    if (scores.deductible <= 5) {
      recommendations.push(`Adjust deductible to $${benchmarks.optimalDeductible} for optimal cost-benefit balance`);
      recommendations.push("Consider your emergency fund when setting deductible amount");
    }
    
    if (scores.value <= 5) {
      recommendations.push("Get quotes from at least 3 different insurers");
      recommendations.push("Consider working with an independent insurance agent");
    }
    
    // General recommendations
    recommendations.push("Review your policy annually to ensure it meets your current needs");
    recommendations.push("Document your assets and keep records updated");
    
    return recommendations;
  }
}

// Export singleton instance
export const quickAnalysisEngine = new QuickAnalysisEngine();
