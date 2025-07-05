

import { ExtractedPolicyData } from '@/types/policyExtraction';
import { InsurancePolicy, UserCriteria, ComparisonResult } from '@/types/comparison';
import { policyDataManager } from './policyDataManager';
import { scoringEngine, PolicyScore } from './scoringEngine';
import { PolicyDocument } from '@/lib/chatpdf-types';

export interface ComparisonPipelineResult {
  success: boolean;
  results?: ComparisonResult[];
  error?: string;
  extractionSummary?: {
    totalPolicies: number;
    successfulExtractions: number;
    failedExtractions: number;
    warnings: string[];
  };
}

export class ComparisonDataPipeline {
  
  /**
   * Complete pipeline: Extract data from documents and run comparison
   */
  public async processDocumentsAndCompare(
    documents: PolicyDocument[],
    userCriteria: UserCriteria
  ): Promise<ComparisonPipelineResult> {
    try {
      console.log('Starting comparison pipeline for', documents.length, 'documents');
      
      // Step 1: Extract data from all documents
      const extractionResults = await this.extractPolicyDataFromDocuments(
        documents,
        userCriteria.market,
        userCriteria.insuranceType
      );
      
      if (extractionResults.successfulExtractions === 0) {
        return {
          success: false,
          error: 'No policies could be extracted from the provided documents',
          extractionSummary: extractionResults
        };
      }
      
      // Step 2: Convert extracted data to InsurancePolicy format
      const policies = this.convertExtractedDataToPolicies(extractionResults.extractedPolicies);
      
      if (policies.length === 0) {
        return {
          success: false,
          error: 'No valid policies after data conversion',
          extractionSummary: extractionResults
        };
      }
      
      // Step 3: Run comparison algorithm
      const comparisonResults = this.runComparison(policies, userCriteria);
      
      return {
        success: true,
        results: comparisonResults,
        extractionSummary: extractionResults
      };
      
    } catch (error) {
      console.error('Comparison pipeline failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown pipeline error'
      };
    }
  }
  
  /**
   * Extract policy data from multiple documents
   */
  private async extractPolicyDataFromDocuments(
    documents: PolicyDocument[],
    market: 'US' | 'UK' | 'India',
    policyType: 'auto' | 'health' | 'home'
  ): Promise<{
    totalPolicies: number;
    successfulExtractions: number;
    failedExtractions: number;
    warnings: string[];
    extractedPolicies: ExtractedPolicyData[];
  }> {
    const results = {
      totalPolicies: documents.length,
      successfulExtractions: 0,
      failedExtractions: 0,
      warnings: [] as string[],
      extractedPolicies: [] as ExtractedPolicyData[]
    };
    
    for (const document of documents) {
      try {
        const extractionResult = await policyDataManager.processPolicy(
          document,
          market,
          policyType
        );
        
        if (extractionResult.success && extractionResult.data) {
          results.successfulExtractions++;
          results.extractedPolicies.push(extractionResult.data);
          results.warnings.push(...extractionResult.validationWarnings);
        } else {
          results.failedExtractions++;
          results.warnings.push(`Failed to extract data from ${document.name}: ${extractionResult.error}`);
        }
      } catch (error) {
        results.failedExtractions++;
        results.warnings.push(`Error processing ${document.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    return results;
  }
  
  /**
   * Convert extracted policy data to InsurancePolicy format for comparison
   */
  private convertExtractedDataToPolicies(extractedPolicies: ExtractedPolicyData[]): InsurancePolicy[] {
    return extractedPolicies.map((extracted, index) => {
      const policy: InsurancePolicy = {
        id: `extracted-${index}`,
        name: `${extracted.insurerName} Policy`,
        provider: extracted.insurerName,
        type: extracted.policyType,
        premium: {
          monthly: extracted.premium.monthly || Math.round(extracted.premium.annual / 12),
          annual: extracted.premium.annual,
          currency: extracted.premium.currency
        },
        coverage: {
          liability: extracted.coverage.liability || 0,
          comprehensive: extracted.coverage.comprehensive || 0,
          collision: extracted.coverage.collision || 0,
          personalInjury: extracted.coverage.personalInjury || 0,
          propertyDamage: extracted.coverage.propertyDamage,
          medicalPayments: extracted.coverage.medicalPayments,
          underinsuredMotorist: extracted.coverage.underinsuredMotorist,
          uninsuredMotorist: extracted.coverage.uninsuredMotorist
        },
        deductible: {
          comprehensive: extracted.deductibles.comprehensive || 0,
          collision: extracted.deductibles.collision || 0,
          overall: extracted.deductibles.overall
        },
        exclusions: extracted.exclusions,
        features: extracted.features,
        insurerRating: {
          financialStrength: 7, // Default value, could be enhanced with actual rating data
          amBest: undefined,
          standardPoors: undefined,
          moodys: undefined
        },
        claimsProcess: {
          averageSettlementDays: 30, // Default values, could be enhanced
          customerSatisfactionScore: 4,
          claimApprovalRate: 85,
          digitalClaimsSupport: true
        },
        ratings: {
          customerService: extracted.ratings?.customerService || 4,
          claimProcessing: extracted.ratings?.claimProcessing || 4,
          overall: extracted.ratings?.overall || 4
        },
        market: extracted.market
      };
      
      return policy;
    });
  }
  
  /**
   * Run the comparison algorithm with scoring engine
   */
  private runComparison(policies: InsurancePolicy[], userCriteria: UserCriteria): ComparisonResult[] {
    console.log('Running comparison for', policies.length, 'policies');
    
    // Use the new transparent scoring engine
    const scoredPolicies = scoringEngine.scorePolicies(policies, userCriteria.priorities);
    
    // Sort by total score (highest first)
    const sortedResults = scoredPolicies
      .sort((a, b) => b.scores.total - a.scores.total)
      .map((result, index) => {
        const comparisonResult: ComparisonResult = {
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
          strengths: this.identifyStrengths(result.scores),
          weaknesses: this.identifyWeaknesses(result.scores),
          recommendation: this.generateRecommendation(result.scores, userCriteria),
          rankPosition: index + 1
        };
        
        return comparisonResult;
      });
    
    return sortedResults;
  }
  
  /**
   * Identify policy strengths based on scores
   */
  private identifyStrengths(scores: PolicyScore): string[] {
    const strengths: string[] = [];
    
    if (scores.premium >= 8) strengths.push("Excellent value for money");
    if (scores.coverage >= 8) strengths.push("Comprehensive coverage options");
    if (scores.deductible >= 8) strengths.push("Low out-of-pocket costs");
    if (scores.exclusions >= 8) strengths.push("Minimal policy exclusions");
    if (scores.insurerRating >= 8) strengths.push("Strong financial stability");
    if (scores.claimsProcess >= 8) strengths.push("Efficient claims handling");
    if (scores.customerService >= 8) strengths.push("Superior customer service");
    
    return strengths;
  }
  
  /**
   * Identify policy weaknesses based on scores
   */
  private identifyWeaknesses(scores: PolicyScore): string[] {
    const weaknesses: string[] = [];
    
    if (scores.premium < 5) weaknesses.push("Higher premium costs");
    if (scores.coverage < 5) weaknesses.push("Limited coverage options");
    if (scores.deductible < 5) weaknesses.push("High deductible amounts");
    if (scores.exclusions < 5) weaknesses.push("Many policy exclusions");
    if (scores.insurerRating < 5) weaknesses.push("Lower financial ratings");
    if (scores.claimsProcess < 5) weaknesses.push("Slower claims processing");
    if (scores.customerService < 5) weaknesses.push("Customer service concerns");
    
    return weaknesses;
  }
  
  /**
   * Generate recommendation based on scores and user criteria
   */
  private generateRecommendation(scores: PolicyScore, userCriteria: UserCriteria): string {
    const topPriority = Object.entries(userCriteria.priorities)
      .sort(([,a], [,b]) => b - a)[0][0];
    
    const overallScore = (scores.premium + scores.coverage + scores.deductible + scores.exclusions + scores.insurerRating + scores.claimsProcess + scores.customerService) / 7;
    
    if (topPriority === 'premium' && scores.premium >= 7) {
      return "Excellent choice for budget-conscious buyers";
    } else if (topPriority === 'coverage' && scores.coverage >= 7) {
      return "Great option for comprehensive protection";
    } else if (overallScore >= 8) {
      return "Outstanding overall value and performance";
    } else if (overallScore >= 6) {
      return "Solid choice with good overall balance";
    }
    
    return "Consider your specific needs and priorities";
  }
}

// Export singleton instance
export const comparisonPipeline = new ComparisonDataPipeline();
