
import { InsurancePolicy, UserCriteria, ComparisonResult, PolicyComparisonCriteria } from '@/types/comparison';

export class InsurancePolicyComparator {
  private policies: InsurancePolicy[] = [];
  
  // Success metrics tracking
  private metrics = {
    totalComparisons: 0,
    userSatisfactionScore: 0,
    biasDetectionScore: 0,
    accuracyScore: 0,
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
    
    // Calculate scores for each policy
    const results = eligiblePolicies.map(policy => 
      this.calculatePolicyScore(policy, userCriteria)
    );
    
    // Sort by score (highest first) without bias
    const sortedResults = results.sort((a, b) => b.score - a.score);
    
    // Track metrics
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
      
      return true;
    });
  }

  /**
   * Calculate weighted score for a policy based on user priorities
   * Uses normalized scoring to prevent bias
   */
  private calculatePolicyScore(policy: InsurancePolicy, userCriteria: UserCriteria): ComparisonResult {
    const priorities = userCriteria.priorities;
    
    // Normalize all scores to 0-100 scale
    const scores = {
      premium: this.calculatePremiumScore(policy, userCriteria),
      coverage: this.calculateCoverageScore(policy),
      deductible: this.calculateDeductibleScore(policy),
      exclusions: this.calculateExclusionsScore(policy),
      customerService: this.normalizeRating(policy.ratings.customerService),
      claimProcessing: this.normalizeRating(policy.ratings.claimProcessing),
    };

    // Calculate weighted total score
    const totalWeight = Object.values(priorities).reduce((sum, weight) => sum + weight, 0);
    
    const weightedScore = (
      (scores.premium * priorities.premium) +
      (scores.coverage * priorities.coverage) +
      (scores.deductible * priorities.deductible) +
      (scores.exclusions * priorities.exclusions) +
      (scores.customerService * priorities.customerService) +
      (scores.claimProcessing * priorities.claimProcessing)
    ) / totalWeight;

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
    const totalCoverage = coverage.liability + coverage.comprehensive + coverage.collision + coverage.personalInjury;
    
    // Normalize based on typical coverage amounts (this would be refined with market data)
    const maxExpectedCoverage = 2000000; // $2M total coverage as reference
    return Math.min(100, (totalCoverage / maxExpectedCoverage) * 100);
  }

  /**
   * Calculate deductible score (lower deductible = higher score)
   */
  private calculateDeductibleScore(policy: InsurancePolicy): number {
    const avgDeductible = (policy.deductible.comprehensive + policy.deductible.collision) / 2;
    const maxDeductible = 2000; // $2000 as reference max
    
    return Math.max(0, ((maxDeductible - avgDeductible) / maxDeductible) * 100);
  }

  /**
   * Calculate exclusions score (fewer exclusions = higher score)
   */
  private calculateExclusionsScore(policy: InsurancePolicy): number {
    const numExclusions = policy.exclusions.length;
    const maxExclusions = 20; // Reference max
    
    return Math.max(0, ((maxExclusions - numExclusions) / maxExclusions) * 100);
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
    
    if (scores.premium >= 75) strengths.push("Competitive premium pricing");
    if (scores.coverage >= 80) strengths.push("Comprehensive coverage limits");
    if (scores.deductible >= 70) strengths.push("Low deductibles");
    if (scores.exclusions >= 75) strengths.push("Minimal exclusions");
    if (scores.customerService >= 80) strengths.push("Excellent customer service");
    if (scores.claimProcessing >= 80) strengths.push("Fast claim processing");
    
    return strengths;
  }

  /**
   * Identify policy weaknesses based on scores
   */
  private identifyWeaknesses(policy: InsurancePolicy, scores: any): string[] {
    const weaknesses: string[] = [];
    
    if (scores.premium < 50) weaknesses.push("Higher premium cost");
    if (scores.coverage < 60) weaknesses.push("Limited coverage amounts");
    if (scores.deductible < 50) weaknesses.push("High deductibles");
    if (scores.exclusions < 60) weaknesses.push("Many exclusions");
    if (scores.customerService < 60) weaknesses.push("Average customer service");
    if (scores.claimProcessing < 60) weaknesses.push("Slower claim processing");
    
    return weaknesses;
  }

  /**
   * Generate personalized recommendation
   */
  private generateRecommendation(policy: InsurancePolicy, scores: any, criteria: UserCriteria): string {
    const topPriority = Object.entries(criteria.priorities)
      .sort(([,a], [,b]) => b - a)[0][0];
    
    if (topPriority === 'premium' && scores.premium >= 70) {
      return "Great choice for budget-conscious buyers";
    } else if (topPriority === 'coverage' && scores.coverage >= 75) {
      return "Excellent for comprehensive protection needs";
    } else if (topPriority === 'customerService' && scores.customerService >= 75) {
      return "Ideal for those prioritizing customer experience";
    }
    
    return "Balanced option with good overall value";
  }

  /**
   * Get success metrics for monitoring
   */
  public getMetrics() {
    return { ...this.metrics };
  }

  /**
   * Add policies to the comparison database
   */
  public addPolicies(policies: InsurancePolicy[]) {
    this.policies = [...this.policies, ...policies];
  }
}

// Export singleton instance
export const policyComparator = new InsurancePolicyComparator();
