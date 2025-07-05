
import { ExtractedPolicyData, PolicyExtractionRequest, PolicyExtractionResult } from "@/types/policyExtraction";
import { PolicyDocument } from "@/lib/chatpdf-types";
import { policyExtractor } from "./policyExtractor";

/**
 * Manages policy data extraction, validation, and standardization
 */
export class PolicyDataManager {
  private extractedPolicies: Map<string, ExtractedPolicyData> = new Map();
  
  /**
   * Extract and store policy data from a document
   */
  public async processPolicy(document: PolicyDocument, market: 'US' | 'UK' | 'India', policyType: 'auto' | 'health' | 'home'): Promise<PolicyExtractionResult> {
    const request: PolicyExtractionRequest = {
      documentId: document.id,
      documentName: document.name,
      market,
      policyType
    };
    
    console.log("Processing policy:", request);
    
    try {
      const result = await policyExtractor.extractPolicyData(request, document);
      
      if (result.success && result.data) {
        // Store the extracted data
        this.extractedPolicies.set(document.id, result.data);
        
        console.log("Policy extraction successful:", {
          policyNumber: result.data.policyNumber,
          insurer: result.data.insurerName,
          premium: result.data.premium.annual,
          coverage: Object.keys(result.data.coverage).length,
          warnings: result.validationWarnings.length
        });
      }
      
      return result;
    } catch (error) {
      console.error("Policy processing failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        validationWarnings: []
      };
    }
  }
  
  /**
   * Get extracted policy data by document ID
   */
  public getExtractedPolicy(documentId: string): ExtractedPolicyData | null {
    return this.extractedPolicies.get(documentId) || null;
  }
  
  /**
   * Get all extracted policies for a specific market
   */
  public getPoliciesByMarket(market: 'US' | 'UK' | 'India'): ExtractedPolicyData[] {
    return Array.from(this.extractedPolicies.values())
      .filter(policy => policy.market === market);
  }
  
  /**
   * Compare multiple policies
   */
  public comparePolicies(policyIds: string[]): {
    policies: ExtractedPolicyData[];
    comparison: {
      premiumRange: { min: number; max: number; currency: string };
      coverageComparison: Record<string, number[]>;
      deductibleComparison: Record<string, number[]>;
      commonFeatures: string[];
      uniqueFeatures: Record<string, string[]>;
    };
  } {
    const policies = policyIds
      .map(id => this.extractedPolicies.get(id))
      .filter(Boolean) as ExtractedPolicyData[];
    
    if (policies.length === 0) {
      throw new Error("No policies found for comparison");
    }
    
    // Calculate comparison metrics
    const premiums = policies.map(p => p.premium.annual);
    const premiumRange = {
      min: Math.min(...premiums),
      max: Math.max(...premiums),
      currency: policies[0].premium.currency
    };
    
    // Coverage comparison
    const allCoverageTypes = new Set<string>();
    policies.forEach(policy => {
      Object.keys(policy.coverage).forEach(type => allCoverageTypes.add(type));
    });
    
    const coverageComparison: Record<string, number[]> = {};
    allCoverageTypes.forEach(type => {
      coverageComparison[type] = policies.map(policy => 
        policy.coverage[type as keyof typeof policy.coverage] || 0
      );
    });
    
    // Deductible comparison
    const allDeductibleTypes = new Set<string>();
    policies.forEach(policy => {
      Object.keys(policy.deductibles).forEach(type => allDeductibleTypes.add(type));
    });
    
    const deductibleComparison: Record<string, number[]> = {};
    allDeductibleTypes.forEach(type => {
      deductibleComparison[type] = policies.map(policy => 
        policy.deductibles[type as keyof typeof policy.deductibles] || 0
      );
    });
    
    // Feature analysis
    const allFeatures = policies.flatMap(p => p.features);
    const featureCounts = allFeatures.reduce((acc, feature) => {
      acc[feature] = (acc[feature] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const commonFeatures = Object.entries(featureCounts)
      .filter(([, count]) => count === policies.length)
      .map(([feature]) => feature);
    
    const uniqueFeatures: Record<string, string[]> = {};
    policies.forEach((policy, index) => {
      uniqueFeatures[`Policy ${index + 1}`] = policy.features.filter(
        feature => featureCounts[feature] === 1
      );
    });
    
    return {
      policies,
      comparison: {
        premiumRange,
        coverageComparison,
        deductibleComparison,
        commonFeatures,
        uniqueFeatures
      }
    };
  }
  
  /**
   * Generate standardized JSON template for testing
   */
  public generateTestTemplate(market: 'US' | 'UK' | 'India', policyType: 'auto' | 'health' | 'home'): ExtractedPolicyData {
    const template: ExtractedPolicyData = {
      policyNumber: "TEST-001",
      insurerName: "Test Insurance Co.",
      policyType,
      market,
      
      premium: {
        annual: market === 'US' ? 1200 : market === 'UK' ? 800 : 15000,
        monthly: market === 'US' ? 100 : market === 'UK' ? 67 : 1250,
        currency: market === 'US' ? 'USD' : market === 'UK' ? 'GBP' : 'INR',
        paymentFrequency: 'monthly'
      },
      
      coverage: {
        liability: market === 'US' ? 100000 : market === 'UK' ? 50000 : 1000000,
        comprehensive: market === 'US' ? 50000 : market === 'UK' ? 25000 : 500000,
        collision: market === 'US' ? 50000 : market === 'UK' ? 25000 : 500000,
        personalInjury: market === 'US' ? 10000 : market === 'UK' ? 5000 : 100000
      },
      
      deductibles: {
        comprehensive: market === 'US' ? 500 : market === 'UK' ? 250 : 2000,
        collision: market === 'US' ? 500 : market === 'UK' ? 250 : 2000
      },
      
      terms: {
        policyPeriod: {
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 12
        },
        renewalType: 'automatic'
      },
      
      exclusions: [
        "Racing or competitive events",
        "Commercial use",
        "Intentional damage"
      ],
      
      limitations: [
        "Age limit: 18-75 years",
        "Clean driving record required"
      ],
      
      features: [
        "24/7 roadside assistance",
        "Rental car coverage",
        "Glass repair coverage"
      ],
      
      discounts: [
        "Safe driver discount: 10%",
        "Multi-policy discount: 5%"
      ],
      
      extractionMetadata: {
        extractedAt: new Date().toISOString(),
        confidence: 1.0,
        source: 'manual',
        validationStatus: 'validated',
        missingFields: []
      }
    };
    
    return template;
  }
  
  /**
   * Validate extraction accuracy (for testing)
   */
  public validateExtractionAccuracy(extracted: ExtractedPolicyData, expected: Partial<ExtractedPolicyData>): {
    accuracy: number;
    matches: string[];
    mismatches: string[];
  } {
    const matches: string[] = [];
    const mismatches: string[] = [];
    
    // Check premium accuracy
    if (expected.premium?.annual && Math.abs(extracted.premium.annual - expected.premium.annual) < 100) {
      matches.push('premium.annual');
    } else if (expected.premium?.annual) {
      mismatches.push('premium.annual');
    }
    
    // Check coverage accuracy
    if (expected.coverage) {
      Object.entries(expected.coverage).forEach(([key, value]) => {
        const extractedValue = extracted.coverage[key as keyof typeof extracted.coverage];
        if (extractedValue && Math.abs(extractedValue - value) < value * 0.1) {
          matches.push(`coverage.${key}`);
        } else {
          mismatches.push(`coverage.${key}`);
        }
      });
    }
    
    const totalChecks = matches.length + mismatches.length;
    const accuracy = totalChecks > 0 ? matches.length / totalChecks : 0;
    
    return { accuracy, matches, mismatches };
  }
}

// Export singleton instance
export const policyDataManager = new PolicyDataManager();
