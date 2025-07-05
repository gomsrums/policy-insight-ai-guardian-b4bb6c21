import { InsurancePolicy, UserCriteria, ComparisonResult, PolicyComparisonCriteria, InsurerRating, ClaimsProcessMetrics } from '@/types/comparison';
import { scoringEngine } from './scoringEngine';

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
   * Now uses the transparent scoring engine for bias-free comparisons
   */
  public comparePolicies(userCriteria: UserCriteria): ComparisonResult[] {
    // Filter policies by type and market
    const eligiblePolicies = this.filterEligiblePolicies(userCriteria);
    
    if (eligiblePolicies.length === 0) {
      return [];
    }
    
    console.log('Comparing', eligiblePolicies.length, 'eligible policies');
    
    // Use the new transparent scoring engine
    const scoredPolicies = scoringEngine.scorePolicies(eligiblePolicies, userCriteria.priorities);
    
    // Convert to ComparisonResult format and sort
    const results = scoredPolicies
      .map(result => ({
        policy: result.policy,
        score: result.scores.total,
        breakdown: {
          premium: result.scores.premium,
          coverage: result.scores.coverage,
          deductible: result.scores.deductible,
          exclusions: result.scores.exclusions,
          insurerRating: result.scores.insurerRating,
          claimsProcess: result.scores.claimsProcess,
          customerService: result.scores.customerService
        },
        strengths: this.identifyStrengths(result.policy, result.scores),
        weaknesses: this.identifyWeaknesses(result.policy, result.scores),
        recommendation: this.generateRecommendation(result.policy, result.scores, userCriteria),
        rankPosition: 0 // Will be set after sorting
      }))
      .sort((a, b) => b.score - a.score)
      .map((result, index) => ({
        ...result,
        rankPosition: index + 1
      }));
    
    // Track metrics
    this.trackParameterUsage(userCriteria.priorities);
    this.metrics.totalComparisons++;
    
    console.log('Comparison complete. Top policy score:', results[0]?.score);
    
    return results;
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
   * Identify policy strengths based on scores
   */
  private identifyStrengths(policy: InsurancePolicy, scores: { [key: string]: number }): string[] {
    const strengths: string[] = [];
    
    if (scores.premium >= 8) strengths.push("Highly competitive premium pricing");
    if (scores.coverage >= 8) strengths.push("Comprehensive coverage with high limits");
    if (scores.deductible >= 7) strengths.push("Low deductibles reduce out-of-pocket costs");
    if (scores.exclusions >= 7) strengths.push("Minimal exclusions provide broad protection");
    if (scores.insurerRating >= 8) strengths.push("Excellent financial stability rating");
    if (scores.claimsProcess >= 8) strengths.push("Fast and efficient claims processing");
    if (scores.customerService >= 8) strengths.push("Outstanding customer service ratings");
    
    return strengths;
  }

  /**
   * Identify policy weaknesses based on scores
   */
  private identifyWeaknesses(policy: InsurancePolicy, scores: { [key: string]: number }): string[] {
    const weaknesses: string[] = [];
    
    if (scores.premium < 4) weaknesses.push("Higher premium costs compared to alternatives");
    if (scores.coverage < 5) weaknesses.push("Limited coverage types or lower limits");
    if (scores.deductible < 4) weaknesses.push("High deductibles increase claim costs");
    if (scores.exclusions < 5) weaknesses.push("Numerous exclusions limit coverage scope");
    if (scores.insurerRating < 6) weaknesses.push("Lower financial stability ratings");
    if (scores.claimsProcess < 5) weaknesses.push("Slower claims processing reported");
    if (scores.customerService < 5) weaknesses.push("Below-average customer service ratings");
    
    return weaknesses;
  }

  /**
   * Generate personalized recommendation
   */
  private generateRecommendation(policy: InsurancePolicy, scores: { [key: string]: number }, userCriteria: UserCriteria): string {
    const topPriority = Object.entries(userCriteria.priorities)
      .sort(([,a], [,b]) => b - a)[0][0];
    
    const overallScore = Object.values(scores).reduce((sum: number, score: number) => sum + score, 0) / Object.keys(scores).length;
    
    if (topPriority === 'premium' && scores.premium >= 7) {
      return "Excellent choice for budget-conscious buyers seeking value";
    } else if (topPriority === 'coverage' && scores.coverage >= 7) {
      return "Ideal for comprehensive protection with extensive coverage";
    } else if (topPriority === 'insurerRating' && scores.insurerRating >= 7) {
      return "Great option for those prioritizing financial security";
    } else if (overallScore >= 8) {
      return "Outstanding overall value with balanced strengths";
    } else if (overallScore >= 6) {
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
    const base = { 
      premium: 40,
      coverage: 30,
      deductible: 15,
      exclusions: 5,
      insurerRating: 5,
      claimsProcess: 3,
      customerService: 2
    };
    
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
