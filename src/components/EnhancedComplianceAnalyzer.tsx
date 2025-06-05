import { supabase } from "@/integrations/supabase/client";
import { uploadDocumentForAnalysis } from "@/services/insurance-api";
import { PolicyDocument } from "@/lib/chatpdf-types";

interface ComplianceAnalysisResult {
  complianceScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  flaggedIssues: Array<{
    type: 'missing_coverage' | 'non_compliant_clause' | 'ambiguous_term';
    description: string;
    regulation: string;
    severity: 'low' | 'medium' | 'high';
    recommendation?: string;
  }>;
  recommendations: string[];
  totalRegulations: number;
  passedRegulations: number;
  detailedAnalysis: {
    coverageAnalysis: string[];
    clauseAnalysis: string[];
    termAnalysis: string[];
    regulatoryGaps: string[];
  };
}

export class EnhancedComplianceAnalyzer {
  static async analyzeDocument(document: PolicyDocument | File, region: string, policyName: string): Promise<ComplianceAnalysisResult> {
    console.log("Starting enhanced compliance analysis for:", document instanceof File ? document.name : document.name);
    
    // Step 1: Extract and analyze document content
    let documentToAnalyze: PolicyDocument;
    
    if (document instanceof File) {
      // Convert File to PolicyDocument
      documentToAnalyze = {
        id: crypto.randomUUID(),
        name: document.name,
        type: "file",
        file: document,
        status: "ready"
      };
    } else {
      documentToAnalyze = document;
    }
    
    const documentAnalysis = await uploadDocumentForAnalysis(documentToAnalyze);
    console.log("Document analysis completed:", documentAnalysis);
    
    // Step 2: Fetch all regulations for the region
    const { data: regulations, error: regError } = await supabase
      .from('regulations')
      .select('*')
      .eq('region', region);

    if (regError) {
      console.error("Error fetching regulations:", regError);
      throw new Error("Failed to fetch regulations for " + region);
    }

    console.log(`Found ${regulations?.length || 0} regulations for ${region}`);

    // Step 3: Enhanced analysis with better document parsing
    const analysisResult = this.performDetailedAnalysis(documentAnalysis, regulations || [], region);
    
    return analysisResult;
  }

  private static performDetailedAnalysis(
    documentAnalysis: any,
    regulations: any[],
    region: string
  ): ComplianceAnalysisResult {
    const summary = documentAnalysis.summary.toLowerCase();
    const flaggedIssues: any[] = [];
    const detailedAnalysis = {
      coverageAnalysis: [],
      clauseAnalysis: [],
      termAnalysis: [],
      regulatoryGaps: []
    };

    // Enhanced keyword-based analysis
    const coverageKeywords = ['liability', 'property', 'health', 'auto', 'fire', 'flood', 'earthquake', 'mental health', 'dental', 'vision'];
    const clauseKeywords = ['deductible', 'premium', 'exclusion', 'limitation', 'cancellation', 'renewal'];
    const termKeywords = ['policy period', 'coverage limit', 'waiting period', 'grace period', 'notice requirement'];

    // Analyze regulations
    regulations.forEach((regulation) => {
      const regText = regulation.regulation_text.toLowerCase();
      const category = regulation.category.toLowerCase();
      const isMandatory = regulation.mandatory;

      if (category === 'coverage') {
        // Check coverage requirements
        coverageKeywords.forEach(keyword => {
          if (regText.includes(keyword)) {
            if (!summary.includes(keyword)) {
              flaggedIssues.push({
                type: 'missing_coverage',
                description: `Missing required ${keyword} coverage as mandated by ${region} regulations`,
                regulation: regulation.regulation_text,
                severity: isMandatory ? 'high' : 'medium',
                recommendation: `Add ${keyword} coverage to comply with regional requirements`
              });
              detailedAnalysis.coverageAnalysis.push(`❌ Missing ${keyword} coverage`);
            } else {
              detailedAnalysis.coverageAnalysis.push(`✅ ${keyword} coverage found`);
            }
          }
        });
      } else if (category === 'premiums') {
        // Check premium-related compliance
        if (regText.includes('increase') && summary.includes('increase')) {
          flaggedIssues.push({
            type: 'non_compliant_clause',
            description: 'Premium increase terms may not comply with rate regulation limits',
            regulation: regulation.regulation_text,
            severity: 'medium',
            recommendation: 'Review premium increase clauses against rate regulations'
          });
          detailedAnalysis.clauseAnalysis.push('⚠️ Premium increase clause needs review');
        }
      } else if (category === 'claims') {
        // Check claims processing compliance
        if (regText.includes('processing time') && !summary.includes('claim')) {
          flaggedIssues.push({
            type: 'ambiguous_term',
            description: 'Claims processing timeframes are not clearly defined',
            regulation: regulation.regulation_text,
            severity: 'medium',
            recommendation: 'Define specific claims processing timeframes'
          });
          detailedAnalysis.termAnalysis.push('⚠️ Claims processing terms unclear');
        }
      }
    });

    // Add analysis for document gaps
    documentAnalysis.gaps.forEach((gap: string, index: number) => {
      if (index < 3) { // Limit to first 3 gaps
        flaggedIssues.push({
          type: 'missing_coverage',
          description: gap,
          regulation: 'Industry best practice',
          severity: index === 0 ? 'high' : 'medium',
          recommendation: `Consider adding coverage for: ${gap}`
        });
        detailedAnalysis.regulatoryGaps.push(`📋 ${gap}`);
      }
    });

    // Calculate compliance metrics
    const totalRegulations = regulations.length;
    const passedRegulations = Math.max(0, totalRegulations - flaggedIssues.length);
    const complianceScore = totalRegulations > 0 ? Math.round((passedRegulations / totalRegulations) * 100) : 0;
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (complianceScore < 60) riskLevel = 'high';
    else if (complianceScore < 80) riskLevel = 'medium';

    // Enhanced recommendations
    const recommendations = [
      ...documentAnalysis.recommendations.slice(0, 3),
      `Review and update policy to address ${flaggedIssues.length} compliance issues`,
      `Ensure all mandatory ${region} regulations are met`,
      'Consider regular compliance audits to maintain regulatory adherence'
    ];

    return {
      complianceScore,
      riskLevel,
      flaggedIssues,
      recommendations,
      totalRegulations,
      passedRegulations,
      detailedAnalysis
    };
  }
}
