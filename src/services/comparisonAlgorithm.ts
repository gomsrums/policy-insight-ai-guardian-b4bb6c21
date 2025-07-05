
import { InsurancePolicy, UserCriteria, ComparisonResult, PolicyComparisonCriteria, InsurerRating, ClaimsProcessMetrics } from '@/types/comparison';

export class InsurancePolicyComparator {
  private policies: InsurancePolicy[] = [];
  
  // Success metrics tracking
  private metrics = {
    totalComparisons: 0,
    userSatisfactionScore: 0,
    biasDetectionScore: 0,
    accuracyScore: 0,
    parameterWeightUsage: {} as Record<string, number>
  };

  constructor(policies: InsurancePolicy[] = []) {
    this.policies = policies;
  }

  /**
   * Main comparison method that evaluates policies based on user criteria
   * Ensures no bias towards any specific insurer
   */
  public comparePolicies(userCriteria: UserCriteria): ComparisonResult[] {
    // Filter policies by type and market
    const eligiblePolicies = this.filterEligiblePolicies(userCriteria);
    
    if (eligiblePolicies.length === 0) {
      return [];
    }
    
    // Calculate scores for each policy
    const results = eligiblePolicies.map((policy, index) => 
      this.calculatePolicyScore(policy, userCriteria, index)
    );
    
    // Sort by score (highest first) without bias
    const sortedResults = results
      .sort((a, b) => b.score - a.score)
      .map((result, index) => ({
        ...result,
        rankPosition: index + 1
      }));
    
    // Track metrics
    this.trackParameterUsage(userCriteria.priorities);
    this.metrics.totalComparisons++;
    
    return sortedResults;
  }

  /**
   * Filter policies based on user criteria
   */
  private filterEligiblePolicies(userCriteria: UserCriteria): InsurancePolicy[] {
    return this.policies.filter(policy => {
      // Filter by insurance type
      if (policy.type !== userCriteria.insuranceType) return false;
      
      // Filter by market
      if (policy.market !== userCriteria.market) return false;
      
      // Filter by budget (annual premium)
      const annualPremium = policy.premium.annual;
      if (annualPremium < userCriteria.budget.min || annualPremium > userCriteria.budget.max) {
        return false;
      }
      
      // Filter by must-have features
      if (userCriteria.mustHaveFeatures) {
        const hasAllRequiredFeatures = userCriteria.mustHaveFeatures.every(feature =>
          policy.features.some(policyFeature => 
            policyFeature.toLowerCase().includes(feature.toLowerCase())
          )
        );
        if (!hasAllRequiredFeatures) return false;
      }
      
      // Filter out deal breakers
      if (userCriteria.dealBreakers) {
        const hasAnyDealBreaker = userCriteria.dealBreakers.some(dealBreaker =>
          policy.exclusions.some(exclusion =>
            exclusion.toLowerCase().includes(dealBreaker.toLowerCase())
          )
        );
        if (hasAnyDealBreaker) return false;
      }
      
      return true;
    });
  }

  /**
   * Calculate weighted score for a policy based on user priorities
   * Uses normalized scoring to prevent bias
   */
  private calculatePolicyScore(policy: InsurancePolicy, userCriteria: UserCriteria, policyIndex: number): ComparisonResult {
    const priorities = userCriteria.priorities;
    
    // Normalize all scores to 0-100 scale
    const scores = {
      premium: this.calculatePremiumScore(policy, userCriteria),
      coverage: this.calculateCoverageScore(policy),
      deductible: this.calculateDeductibleScore(policy),
      exclusions: this.calculateExclusionsScore(policy),
      insurerRating: this.calculateInsurerRatingScore(policy.insurerRating),
      claimsProcess: this.calculateClaimsProcessScore(policy.claimsProcess),
      customerService: this.normalizeRating(policy.ratings.customerService),
    };

    // Calculate weighted total score
    const totalWeight = Object.values(priorities).reduce((sum, weight) => sum + weight, 0);
    
    const weightedScore = (
      (scores.premium * priorities.premium) +
      (scores.coverage * priorities.coverage) +
      (scores.deductible * priorities.deductible) +
      (scores.exclusions * priorities.exclusions) +
      (scores.insurerRating * priorities.insurerRating) +
      (scores.claimsProcess * priorities.claimsProcess) +
      (scores.customerService * priorities.customerService)
    ) / Math.max(totalWeight, 1); // Prevent division by zero

    // Generate insights
    const strengths = this.identifyStrengths(policy, scores);
    const weaknesses = this.identifyWeaknesses(policy, scores);
    const recommendation = this.generateRecommendation(policy, scores, userCriteria);

    return {
      policy,
      score: Math.round(weightedScore * 100) / 100,
      breakdown: scores,
      strengths,
      weaknesses,
      recommendation,
      rankPosition: 0 // Will be set after sorting
    };
  }

  /**
   * Calculate premium score (lower is better, so invert)
   */
  private calculatePremiumScore(policy: InsurancePolicy, userCriteria: UserCriteria): number {
    const { min, max } = userCriteria.budget;
    const premium = policy.premium.annual;
    
    // Normalize to 0-100 scale (lower premium = higher score)
    const normalizedScore = ((max - premium) / (max - min)) * 100;
    return Math.max(0, Math.min(100, normalizedScore));
  }

  /**
   * Calculate coverage score based on coverage amounts
   */
  private calculateCoverageScore(policy: InsurancePolicy): number {
    const coverage = policy.coverage;
    const coverageTypes = Object.keys(coverage);
    
    // Calculate coverage breadth (number of coverage types)
    const breadthScore = (coverageTypes.length / 8) * 50; // Max 8 coverage types
    
    // Calculate coverage depth (average coverage amounts)
    const totalCoverage = Object.values(coverage).reduce((sum, amount) => sum + (amount || 0), 0);
    const maxExpectedCoverage = 2000000; // Reference max coverage
    const depthScore = Math.min(50, (totalCoverage / maxExpectedCoverage) * 50);
    
    return Math.min(100, breadthScore + depthScore);
  }

  /**
   * Calculate deductible score (lower deductible = higher score)
   */
  private calculateDeductibleScore(policy: InsurancePolicy): number {
    const deductibles = Object.values(policy.deductible).filter(d => d > 0);
    if (deductibles.length === 0) return 100;
    
    const avgDeductible = deductibles.reduce((sum, d) => sum + d, 0) / deductibles.length;
    const maxDeductible = 5000; // Reference max deductible
    
    return Math.max(0, ((maxDeductible - avgDeductible) / maxDeductible) * 100);
  }

  /**
   * Calculate exclusions score (fewer exclusions = higher score)
   */
  private calculateExclusionsScore(policy: InsurancePolicy): number {
    const numExclusions = policy.exclusions.length;
    const maxExclusions = 25; // Reference max
    
    return Math.max(0, ((maxExclusions - numExclusions) / maxExclusions) * 100);
  }

  /**
   * Calculate insurer rating score based on financial strength
   */
  private calculateInsurerRatingScore(rating: InsurerRating): number {
    // Convert letter grades to numeric scores
    const amBestScore = this.convertAmBestRating(rating.amBest);
    const spScore = this.convertSPRating(rating.standardPoors);
    
    // Use the highest available rating or financial strength
    const scores = [amBestScore, spScore, rating.financialStrength * 10].filter(s => s > 0);
    return scores.length > 0 ? Math.max(...scores) : 50; // Default to 50 if no ratings
  }

  /**
   * Calculate claims process score
   */
  private calculateClaimsProcessScore(claimsProcess: ClaimsProcessMetrics): number {
    // Settlement speed (faster = better)
    const speedScore = Math.max(0, (60 - claimsProcess.averageSettlementDays) / 60 * 30);
    
    // Customer satisfaction
    const satisfactionScore = (claimsProcess.customerSatisfactionScore / 5) * 30;
    
    // Approval rate
    const approvalScore = (claimsProcess.claimApprovalRate / 100) * 25;
    
    // Digital support bonus
    const digitalBonus = claimsProcess.digitalClaimsSupport ? 15 : 0;
    
    return Math.min(100, speedScore + satisfactionScore + approvalScore + digitalBonus);
  }

  /**
   * Convert AM Best rating to numeric score
   */
  private convertAmBestRating(rating?: string): number {
    if (!rating) return 0;
    const ratingMap: Record<string, number> = {
      'A++': 100, 'A+': 95, 'A': 90, 'A-': 85,
      'B++': 80, 'B+': 75, 'B': 70, 'B-': 65,
      'C++': 60, 'C+': 55, 'C': 50, 'C-': 45,
      'D': 30, 'E': 15, 'F': 0
    };
    return ratingMap[rating] || 50;
  }

  /**
   * Convert S&P rating to numeric score
   */
  private convertSPRating(rating?: string): number {
    if (!rating) return 0;
    const ratingMap: Record<string, number> = {
      'AAA': 100, 'AA+': 95, 'AA': 90, 'AA-': 85,
      'A+': 80, 'A': 75, 'A-': 70,
      'BBB+': 65, 'BBB': 60, 'BBB-': 55,
      'BB+': 50, 'BB': 45, 'BB-': 40,
      'B+': 35, 'B': 30, 'B-': 25,
      'CCC': 15, 'CC': 10, 'C': 5, 'D': 0
    };
    return ratingMap[rating] || 50;
  }

  /**
   * Normalize 1-5 rating to 0-100 scale
   */
  private normalizeRating(rating: number): number {
    return ((rating - 1) / 4) * 100;
  }

  /**
   * Identify policy strengths based on scores
   */
  private identifyStrengths(policy: InsurancePolicy, scores: any): string[] {
    const strengths: string[] = [];
    
    if (scores.premium >= 75) strengths.push("Highly competitive premium pricing");
    if (scores.coverage >= 80) strengths.push("Comprehensive coverage with high limits");
    if (scores.deductible >= 70) strengths.push("Low deductibles reduce out-of-pocket costs");
    if (scores.exclusions >= 75) strengths.push("Minimal exclusions provide broad protection");
    if (scores.insurerRating >= 80) strengths.push("Excellent financial stability rating");
    if (scores.claimsProcess >= 80) strengths.push("Fast and efficient claims processing");
    if (scores.customerService >= 80) strengths.push("Outstanding customer service ratings");
    
    return strengths;
  }

  /**
   * Identify policy weaknesses based on scores
   */
  private identifyWeaknesses(policy: InsurancePolicy, scores: any): string[] {
    const weaknesses: string[] = [];
    
    if (scores.premium < 40) weaknesses.push("Higher premium costs compared to alternatives");
    if (scores.coverage < 50) weaknesses.push("Limited coverage types or lower limits");
    if (scores.deductible < 40) weaknesses.push("High deductibles increase claim costs");
    if (scores.exclusions < 50) weaknesses.push("Numerous exclusions limit coverage scope");
    if (scores.insurerRating < 60) weaknesses.push("Lower financial stability ratings");
    if (scores.claimsProcess < 50) weaknesses.push("Slower claims processing reported");
    if (scores.customerService < 50) weaknesses.push("Below-average customer service ratings");
    
    return weaknesses;
  }

  /**
   * Generate personalized recommendation
   */
  private generateRecommendation(policy: InsurancePolicy, scores: any, criteria: UserCriteria): string {
    const topPriority = Object.entries(criteria.priorities)
      .sort(([,a], [,b]) => b - a)[0][0];
    
    const overallScore = Object.values(scores).reduce((sum: number, score: number) => sum + score, 0) / Object.keys(scores).length;
    
    if (topPriority === 'premium' && scores.premium >= 70) {
      return "Excellent choice for budget-conscious buyers seeking value";
    } else if (topPriority === 'coverage' && scores.coverage >= 75) {
      return "Ideal for comprehensive protection with extensive coverage";
    } else if (topPriority === 'insurerRating' && scores.insurerRating >= 75) {
      return "Great option for those prioritizing financial security";
    } else if (overallScore >= 80) {
      return "Outstanding overall value with balanced strengths";
    } else if (overallScore >= 60) {
      return "Solid option with good overall performance";
    }
    
    return "Consider reviewing specific strengths against your priorities";
  }

  /**
   * Track parameter usage for analytics
   */
  private trackParameterUsage(priorities: PolicyComparisonCriteria) {
    Object.entries(priorities).forEach(([param, weight]) => {
      this.metrics.parameterWeightUsage[param] = 
        (this.metrics.parameterWeightUsage[param] || 0) + weight;
    });
  }

  /**
   * Get success metrics for monitoring
   */
  public getMetrics() {
    return { 
      ...this.metrics,
      averageParameterWeights: Object.fromEntries(
        Object.entries(this.metrics.parameterWeightUsage).map(([param, total]) => [
          param, 
          Math.round((total / Math.max(this.metrics.totalComparisons, 1)) * 100) / 100
        ])
      )
    };
  }

  /**
   * Add policies to the comparison database
   */
  public addPolicies(policies: InsurancePolicy[]) {
    this.policies = [...this.policies, ...policies];
  }

  /**
   * Get parameter recommendations based on user profile
   */
  public getParameterRecommendations(userProfile: {
    age: number;
    riskTolerance: 'low' | 'medium' | 'high';
    primaryConcern: 'cost' | 'coverage' | 'service';
  }): PolicyComparisonCriteria {
    const base = { ...criteria };
    
    // Adjust based on age
    if (userProfile.age < 30) {
      base.premium += 10; // Young adults more price sensitive
      base.coverage -= 5;
    } else if (userProfile.age > 50) {
      base.coverage += 10; // Older adults prefer comprehensive coverage
      base.insurerRating += 5;
    }
    
    // Adjust based on risk tolerance
    if (userProfile.riskTolerance === 'low') {
      base.coverage += 15;
      base.insurerRating += 10;
      base.premium -= 10;
    } else if (userProfile.riskTolerance === 'high') {
      base.premium += 15;
      base.deductible += 10;
      base.coverage -= 5;
    }
    
    // Adjust based on primary concern
    if (userProfile.primaryConcern === 'cost') {
      base.premium += 20;
    } else if (userProfile.primaryConcern === 'coverage') {
      base.coverage += 20;
    } else if (userProfile.primaryConcern === 'service') {
      base.customerService += 15;
      base.claimsProcess += 10;
    }
    
    // Normalize to ensure total is 100
    const total = Object.values(base).reduce((sum, weight) => sum + weight, 0);
    Object.keys(base).forEach(key => {
      base[key as keyof PolicyComparisonCriteria] = Math.round((base[key as keyof PolicyComparisonCriteria] / total) * 100);
    });
    
    return base;
  }
}

// Export singleton instance
export const policyComparator = new InsurancePolicyComparator();
