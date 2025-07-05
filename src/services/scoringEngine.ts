import { InsurancePolicy, PolicyComparisonCriteria } from '@/types/comparison';

export interface ScoringContext {
  maxPremium: number;
  minPremium: number;
  maxDeductible: number;
  minDeductible: number;
  maxExclusions: number;
  maxCoverage: number;
}

export interface PolicyScore {
  premium: number;
  coverage: number;
  deductible: number;
  exclusions: number;
  insurerRating: number;
  claimsProcess: number;
  customerService: number;
  total: number;
}

export class TransparentScoringEngine {
  
  /**
   * Calculate scores for all policies using transparent, bias-free methodology
   */
  public scorePolicies(policies: InsurancePolicy[], weights: PolicyComparisonCriteria): Array<{
    policy: InsurancePolicy;
    scores: PolicyScore;
    breakdown: string[];
  }> {
    if (policies.length === 0) return [];
    
    // Establish scoring context from all policies
    const context = this.buildScoringContext(policies);
    
    console.log('Scoring context:', context);
    
    return policies.map(policy => {
      const individualScores = this.calculatePolicyScore(policy, context);
      const weightedTotal = this.calculateWeightedTotal(individualScores, weights);
      const breakdown = this.generateScoringBreakdown(policy, individualScores, context);
      
      const scores: PolicyScore = {
        ...individualScores,
        total: weightedTotal
      };
      
      return {
        policy,
        scores,
        breakdown
      };
    });
  }
  
  /**
   * Build scoring context from all policies for normalization
   */
  private buildScoringContext(policies: InsurancePolicy[]): ScoringContext {
    const premiums = policies.map(p => p.premium.annual).filter(p => p > 0);
    const deductibles = policies.flatMap(p => Object.values(p.deductible)).filter(d => d > 0);
    const exclusionCounts = policies.map(p => p.exclusions.length);
    const coverageCounts = policies.map(p => Object.keys(p.coverage).length);
    
    return {
      maxPremium: Math.max(...premiums),
      minPremium: Math.min(...premiums),
      maxDeductible: Math.max(...deductibles),
      minDeductible: Math.min(...deductibles),
      maxExclusions: Math.max(...exclusionCounts),
      maxCoverage: Math.max(...coverageCounts)
    };
  }
  
  /**
   * Calculate individual parameter scores (0-10 scale)
   */
  private calculatePolicyScore(policy: InsurancePolicy, context: ScoringContext): Omit<PolicyScore, 'total'> {
    console.log('Calculating scores for policy:', policy.name, 'Premium:', policy.premium.annual);
    
    const scores = {
      premium: this.scorePremium(policy.premium.annual, context),
      coverage: this.scoreCoverage(policy.coverage, context),
      deductible: this.scoreDeductible(policy.deductible, context),
      exclusions: this.scoreExclusions(policy.exclusions, context),
      insurerRating: this.scoreInsurerRating(policy.insurerRating),
      claimsProcess: this.scoreClaimsProcess(policy.claimsProcess),
      customerService: this.scoreCustomerService(policy.ratings.customerService)
    };
    
    console.log('Individual scores:', scores);
    return scores;
  }
  
  /**
   * Score premium (lower is better): 0-10 scale
   */
  private scorePremium(premium: number, context: ScoringContext): number {
    console.log('Scoring premium:', premium, 'Context:', context.minPremium, '-', context.maxPremium);
    
    if (!premium || premium <= 0) {
      console.log('Invalid premium, returning 0');
      return 0;
    }
    
    if (context.maxPremium === context.minPremium) return 10;
    
    // Invert: lower premium = higher score
    const normalizedScore = (context.maxPremium - premium) / (context.maxPremium - context.minPremium);
    const score = Math.round(Math.max(0, Math.min(1, normalizedScore)) * 10 * 100) / 100;
    console.log('Premium score calculated:', score);
    return score;
  }
  
  /**
   * Score coverage (more comprehensive = better): 0-10 scale
   */
  private scoreCoverage(coverage: InsurancePolicy['coverage'], context: ScoringContext): number {
    const coverageTypes = Object.keys(coverage).filter(key => {
      const value = coverage[key as keyof typeof coverage];
      return value && value > 0;
    });
    const coverageCount = coverageTypes.length;
    
    console.log('Coverage types found:', coverageCount, 'Max coverage:', context.maxCoverage);
    
    if (context.maxCoverage === 0) return 0;
    
    // More coverage types = higher score
    const normalizedScore = coverageCount / context.maxCoverage;
    const score = Math.round(Math.min(normalizedScore, 1) * 10 * 100) / 100;
    console.log('Coverage score calculated:', score);
    return score;
  }
  
  /**
   * Score deductible (lower is better): 0-10 scale
   */
  private scoreDeductible(deductibles: InsurancePolicy['deductible'], context: ScoringContext): number {
    const deductibleValues = Object.values(deductibles).filter(d => d > 0);
    if (deductibleValues.length === 0) return 10; // No deductible = best score
    
    const avgDeductible = deductibleValues.reduce((sum, d) => sum + d, 0) / deductibleValues.length;
    
    if (context.maxDeductible === context.minDeductible) return 10;
    
    // Lower deductible = higher score
    const normalizedScore = (context.maxDeductible - avgDeductible) / (context.maxDeductible - context.minDeductible);
    return Math.round(Math.max(normalizedScore, 0) * 10 * 100) / 100;
  }
  
  /**
   * Score exclusions (fewer is better): 0-10 scale
   */
  private scoreExclusions(exclusions: string[], context: ScoringContext): number {
    if (context.maxExclusions === 0) return 10;
    
    // Fewer exclusions = higher score
    const normalizedScore = (context.maxExclusions - exclusions.length) / context.maxExclusions;
    return Math.round(Math.max(normalizedScore, 0) * 10 * 100) / 100;
  }
  
  /**
   * Score insurer rating based on standard rating scales: 0-10 scale
   */
  private scoreInsurerRating(rating: InsurancePolicy['insurerRating']): number {
    // AM Best ratings
    const amBestMap: Record<string, number> = {
      'A++': 10, 'A+': 9.5, 'A': 9, 'A-': 8.5,
      'B++': 8, 'B+': 7.5, 'B': 7, 'B-': 6.5,
      'C++': 6, 'C+': 5.5, 'C': 5, 'C-': 4.5,
      'D': 3, 'E': 2, 'F': 1
    };
    
    // S&P ratings
    const spMap: Record<string, number> = {
      'AAA': 10, 'AA+': 9.5, 'AA': 9, 'AA-': 8.5,
      'A+': 8, 'A': 7.5, 'A-': 7,
      'BBB+': 6.5, 'BBB': 6, 'BBB-': 5.5,
      'BB+': 5, 'BB': 4.5, 'BB-': 4,
      'B+': 3.5, 'B': 3, 'B-': 2.5,
      'CCC': 2, 'CC': 1.5, 'C': 1, 'D': 0
    };
    
    // Use highest available rating
    const scores = [
      rating.amBest ? amBestMap[rating.amBest] : 0,
      rating.standardPoors ? spMap[rating.standardPoors] : 0,
      rating.financialStrength ? rating.financialStrength : 0
    ].filter(s => s > 0);
    
    return scores.length > 0 ? Math.max(...scores) : 5; // Default to middle score
  }
  
  /**
   * Score claims process efficiency: 0-10 scale
   */
  private scoreClaimsProcess(claimsProcess: InsurancePolicy['claimsProcess']): number {
    let score = 0;
    
    // Settlement speed (faster = better)
    const speedScore = Math.max(0, (60 - claimsProcess.averageSettlementDays) / 60 * 3);
    
    // Customer satisfaction (1-5 scale to 0-3 points)
    const satisfactionScore = ((claimsProcess.customerSatisfactionScore - 1) / 4) * 3;
    
    // Approval rate (0-100% to 0-2 points)
    const approvalScore = (claimsProcess.claimApprovalRate / 100) * 2;
    
    // Digital support bonus (0-2 points)
    const digitalScore = claimsProcess.digitalClaimsSupport ? 2 : 0;
    
    score = speedScore + satisfactionScore + approvalScore + digitalScore;
    return Math.round(Math.min(score, 10) * 100) / 100;
  }
  
  /**
   * Score customer service: 0-10 scale
   */
  private scoreCustomerService(rating: number): number {
    // Convert 1-5 scale to 0-10 scale
    return Math.round(((rating - 1) / 4) * 10 * 100) / 100;
  }
  
  /**
   * Calculate weighted total score
   */
  private calculateWeightedTotal(scores: Omit<PolicyScore, 'total'>, weights: PolicyComparisonCriteria): number {
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    
    if (totalWeight === 0) return 0;
    
    const weightedSum = (
      (scores.premium * weights.premium) +
      (scores.coverage * weights.coverage) +
      (scores.deductible * weights.deductible) +
      (scores.exclusions * weights.exclusions) +
      (scores.insurerRating * weights.insurerRating) +
      (scores.claimsProcess * weights.claimsProcess) +
      (scores.customerService * weights.customerService)
    ) / totalWeight;
    
    const total = Math.round(weightedSum * 100) / 100;
    console.log('Weighted total calculated:', total);
    return total;
  }
  
  /**
   * Generate transparent scoring breakdown for user understanding
   */
  private generateScoringBreakdown(policy: InsurancePolicy, scores: Omit<PolicyScore, 'total'>, context: ScoringContext): string[] {
    const breakdown: string[] = [];
    
    breakdown.push(`Premium Score: ${scores.premium}/10 (Annual: $${policy.premium.annual.toLocaleString()})`);
    breakdown.push(`Coverage Score: ${scores.coverage}/10 (${Object.keys(policy.coverage).length} coverage types)`);
    
    const avgDeductible = Object.values(policy.deductible).filter(d => d > 0).reduce((sum, d) => sum + d, 0) / Object.values(policy.deductible).filter(d => d > 0).length;
    breakdown.push(`Deductible Score: ${scores.deductible}/10 (Avg: $${avgDeductible.toLocaleString()})`);
    
    breakdown.push(`Exclusions Score: ${scores.exclusions}/10 (${policy.exclusions.length} exclusions)`);
    breakdown.push(`Insurer Rating Score: ${scores.insurerRating}/10 (${policy.insurerRating.amBest || policy.insurerRating.standardPoors || 'N/A'})`);
    breakdown.push(`Claims Process Score: ${scores.claimsProcess}/10 (${policy.claimsProcess.averageSettlementDays} days avg)`);
    breakdown.push(`Customer Service Score: ${scores.customerService}/10 (${policy.ratings.customerService}/5 rating)`);
    
    return breakdown;
  }
}

// Export singleton instance
export const scoringEngine = new TransparentScoringEngine();
