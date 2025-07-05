
import { PolicyDocument, AnalysisResult } from "@/lib/chatpdf-types";
import { uploadDocumentForAnalysis, sendChatMessage } from "@/services/chatpdf-api";
import { ExtractedPolicyData, PolicyExtractionRequest, PolicyExtractionResult, MARKET_TEMPLATES, CHATPDF_QUERIES } from "@/types/policyExtraction";

export class PolicyDataExtractor {
  
  /**
   * Main extraction method using ChatPDF AI
   */
  public async extractPolicyData(request: PolicyExtractionRequest, document: PolicyDocument): Promise<PolicyExtractionResult> {
    try {
      console.log("Starting policy data extraction for:", request.documentName);
      
      // Step 1: Upload document to ChatPDF and get basic analysis
      const analysis = await uploadDocumentForAnalysis(document);
      
      // Step 2: Extract structured data using targeted queries
      const extractedData = await this.performStructuredExtraction(analysis.document_id, request);
      
      // Step 3: Validate and standardize the data
      const validationResult = this.validateExtractedData(extractedData, request.market);
      
      return {
        success: true,
        data: extractedData,
        validationWarnings: validationResult.warnings
      };
      
    } catch (error) {
      console.error("Policy extraction failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown extraction error",
        validationWarnings: []
      };
    }
  }
  
  /**
   * Perform structured data extraction using ChatPDF queries
   */
  private async performStructuredExtraction(documentId: string, request: PolicyExtractionRequest): Promise<ExtractedPolicyData> {
    const template = MARKET_TEMPLATES[request.market];
    
    // Extract basic information
    const basicInfoPrompt = `
    Extract the following information from this ${request.market} ${request.policyType} insurance policy:
    1. Policy number
    2. Insurance company name
    3. Policy type and coverage period
    4. Currency used for all amounts
    
    Format your response as JSON with keys: policyNumber, insurerName, policyType, policyPeriod, currency
    `;
    
    const basicInfo = await sendChatMessage(documentId, basicInfoPrompt);
    
    // Extract premium information
    const premiumPrompt = `
    Extract all premium and cost information from this policy:
    1. Annual premium amount
    2. Monthly premium (if available)
    3. Payment frequency
    4. Any discounts applied
    5. Premium breakdown if available
    
    Format as JSON with keys: annual, monthly, currency, paymentFrequency, discounts
    Return amounts as numbers without currency symbols.
    `;
    
    const premiumInfo = await sendChatMessage(documentId, premiumPrompt);
    
    // Extract coverage details
    const coveragePrompt = `
    Extract all coverage limits and types from this ${request.market} ${request.policyType} policy:
    1. Liability coverage limits
    2. Comprehensive coverage
    3. Collision coverage
    4. Personal injury protection
    5. Property damage coverage
    6. Medical payments coverage
    7. Uninsured/Underinsured motorist coverage
    
    Format as JSON with coverage type as key and limit amount as value.
    Return amounts as numbers without currency symbols.
    `;
    
    const coverageInfo = await sendChatMessage(documentId, coveragePrompt);
    
    // Extract deductibles
    const deductiblePrompt = `
    Extract all deductible amounts from this policy:
    1. Comprehensive deductible
    2. Collision deductible
    3. Overall deductible
    4. Any other specific deductibles
    
    Format as JSON with deductible type as key and amount as value.
    `;
    
    const deductibleInfo = await sendChatMessage(documentId, deductiblePrompt);
    
    // Extract exclusions and limitations
    const exclusionsPrompt = `
    List all exclusions, limitations, and conditions mentioned in this policy.
    What is NOT covered by this insurance policy?
    Format as a JSON array of strings.
    `;
    
    const exclusionsInfo = await sendChatMessage(documentId, exclusionsPrompt);
    
    // Extract additional features
    const featuresPrompt = `
    List all additional features, benefits, services, and special programs included:
    1. Roadside assistance
    2. Rental car coverage
    3. Special discounts or programs
    4. Additional services
    5. Membership benefits
    
    Format as JSON array of strings.
    `;
    
    const featuresInfo = await sendChatMessage(documentId, featuresPrompt);
    
    // Parse and combine all extracted information
    const extractedData: ExtractedPolicyData = {
      policyNumber: this.extractJsonValue(basicInfo, 'policyNumber') || 'UNKNOWN',
      insurerName: this.extractJsonValue(basicInfo, 'insurerName') || 'UNKNOWN',
      policyType: request.policyType,
      market: request.market,
      
      premium: {
        annual: this.extractJsonValue(premiumInfo, 'annual') || 0,
        monthly: this.extractJsonValue(premiumInfo, 'monthly'),
        currency: template.currency,
        paymentFrequency: this.extractJsonValue(premiumInfo, 'paymentFrequency') || 'annual'
      },
      
      coverage: this.parseCoverageData(coverageInfo),
      deductibles: this.parseDeductibleData(deductibleInfo),
      
      terms: {
        policyPeriod: {
          startDate: this.extractJsonValue(basicInfo, 'startDate') || new Date().toISOString(),
          endDate: this.extractJsonValue(basicInfo, 'endDate') || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 12
        },
        renewalType: 'automatic'
      },
      
      exclusions: this.parseArrayData(exclusionsInfo),
      limitations: [],
      features: this.parseArrayData(featuresInfo),
      discounts: this.extractJsonValue(premiumInfo, 'discounts') || [],
      
      extractionMetadata: {
        extractedAt: new Date().toISOString(),
        confidence: 0.85, // Default confidence score
        source: 'chatpdf',
        documentId: documentId,
        validationStatus: 'pending',
        missingFields: []
      }
    };
    
    return extractedData;
  }
  
  /**
   * Validate extracted data against market requirements
   */
  private validateExtractedData(data: ExtractedPolicyData, market: string): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    const template = MARKET_TEMPLATES[market as keyof typeof MARKET_TEMPLATES];
    
    // Check required fields
    template.requiredFields.forEach(field => {
      const fieldPath = field.split('.');
      let value = data as any;
      
      for (const path of fieldPath) {
        value = value?.[path];
      }
      
      if (!value || value === 0) {
        warnings.push(`Missing required field: ${field}`);
        data.extractionMetadata.missingFields.push(field);
      }
    });
    
    // Validate premium amounts
    if (data.premium.annual <= 0) {
      warnings.push("Invalid annual premium amount");
    }
    
    // Validate coverage amounts
    const coverageValues = Object.values(data.coverage).filter(v => v !== undefined);
    if (coverageValues.length === 0) {
      warnings.push("No coverage information found");
    }
    
    // Update validation status
    if (warnings.length === 0) {
      data.extractionMetadata.validationStatus = 'validated';
    } else if (warnings.length > 3) {
      data.extractionMetadata.validationStatus = 'flagged';
    }
    
    return {
      isValid: warnings.length < 3,
      warnings
    };
  }
  
  /**
   * Helper method to extract JSON values from ChatPDF responses
   */
  private extractJsonValue(response: string, key: string): any {
    try {
      // Try to parse the entire response as JSON first
      const parsed = JSON.parse(response);
      return parsed[key];
    } catch {
      // Fallback: extract using regex patterns
      const patterns = {
        policyNumber: /policy\s*(?:number|no)[\s:]*([A-Z0-9\-]+)/i,
        insurerName: /(?:insurer|company)[\s:]*([^,\n]+)/i,
        annual: /annual[\s:]*(?:premium)?[\s:]*(?:\$|£|₹)?[\d,]+/i,
        monthly: /monthly[\s:]*(?:premium)?[\s:]*(?:\$|£|₹)?[\d,]+/i
      };
      
      const pattern = patterns[key as keyof typeof patterns];
      if (pattern) {
        const match = response.match(pattern);
        if (match) {
          if (key === 'annual' || key === 'monthly') {
            return parseInt(match[0].replace(/[^\d]/g, ''));
          }
          return match[1]?.trim();
        }
      }
      
      return null;
    }
  }
  
  /**
   * Parse coverage data from ChatPDF response
   */
  private parseCoverageData(response: string): ExtractedPolicyData['coverage'] {
    try {
      return JSON.parse(response);
    } catch {
      // Fallback parsing logic
      const coverage: ExtractedPolicyData['coverage'] = {};
      
      const patterns = {
        liability: /liability[\s:]*(?:\$|£|₹)?([\d,]+)/i,
        comprehensive: /comprehensive[\s:]*(?:\$|£|₹)?([\d,]+)/i,
        collision: /collision[\s:]*(?:\$|£|₹)?([\d,]+)/i,
        personalInjury: /personal[\s\w]*injury[\s:]*(?:\$|£|₹)?([\d,]+)/i
      };
      
      Object.entries(patterns).forEach(([key, pattern]) => {
        const match = response.match(pattern);
        if (match) {
          coverage[key as keyof typeof coverage] = parseInt(match[1].replace(/,/g, ''));
        }
      });
      
      return coverage;
    }
  }
  
  /**
   * Parse deductible data from ChatPDF response
   */
  private parseDeductibleData(response: string): ExtractedPolicyData['deductibles'] {
    try {
      return JSON.parse(response);
    } catch {
      const deductibles: ExtractedPolicyData['deductibles'] = {};
      
      const patterns = {
        comprehensive: /comprehensive[\s\w]*deductible[\s:]*(?:\$|£|₹)?([\d,]+)/i,
        collision: /collision[\s\w]*deductible[\s:]*(?:\$|£|₹)?([\d,]+)/i,
        overall: /deductible[\s:]*(?:\$|£|₹)?([\d,]+)/i
      };
      
      Object.entries(patterns).forEach(([key, pattern]) => {
        const match = response.match(pattern);
        if (match) {
          deductibles[key as keyof typeof deductibles] = parseInt(match[1].replace(/,/g, ''));
        }
      });
      
      return deductibles;
    }
  }
  
  /**
   * Parse array data from ChatPDF response
   */
  private parseArrayData(response: string): string[] {
    try {
      const parsed = JSON.parse(response);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // Split by lines and clean up
      return response
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.match(/^[\d\.\-\*]+\s*$/))
        .slice(0, 10); // Limit to 10 items
    }
  }
}

// Export singleton instance
export const policyExtractor = new PolicyDataExtractor();
