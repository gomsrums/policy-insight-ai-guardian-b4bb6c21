
import { AnalysisResult } from "@/lib/chatpdf-types";

export interface CoverageGap {
  category: string;
  coverage: string;
  status: 'missing' | 'insufficient' | 'adequate';
  severity: 'critical' | 'moderate' | 'low';
  description: string;
  recommendation: string;
  estimatedCost?: string;
  riskLevel: 'High' | 'Medium' | 'Low';
}

export interface GapAnalysisResult {
  overallScore: number;
  totalGaps: number;
  criticalGaps: number;
  gaps: CoverageGap[];
  completeness: {
    covered: number;
    gaps: number;
    percentage: number;
  };
}

// Synonym mappings for ambiguous policy terms
const COVERAGE_SYNONYMS = {
  'public liability': ['general liability', 'third party liability', 'liability coverage'],
  'professional indemnity': ['errors and omissions', 'professional liability', 'PI coverage'],
  'cyber liability': ['data breach', 'cyber security', 'cyber protection', 'data protection'],
  'business interruption': ['loss of income', 'business income', 'lost revenue'],
  'accidental damage': ['accident cover', 'accidental loss', 'damage protection'],
  'flood coverage': ['flood insurance', 'water damage', 'flooding protection'],
  'theft protection': ['burglary cover', 'theft insurance', 'security coverage']
};

// UK Insurance Benchmarks with severity classifications
const UK_COVERAGE_BENCHMARKS = {
  car: {
    critical: [
      { coverage: 'Third-party liability', limit: '£20,000,000', cost: '£200-400/year' },
      { coverage: 'Motor legal protection', limit: '£100,000', cost: '£15-30/year' }
    ],
    moderate: [
      { coverage: 'Breakdown cover', limit: 'Roadside & Recovery', cost: '£40-80/year' },
      { coverage: 'Windscreen cover', limit: 'Full replacement', cost: '£10-25/year' },
      { coverage: 'Personal injury protection', limit: '£100,000', cost: '£20-40/year' }
    ],
    optional: [
      { coverage: 'Key replacement', limit: '£1,500', cost: '£10-20/year' },
      { coverage: 'Courtesy car', limit: '21 days', cost: '£25-50/year' }
    ]
  },
  home: {
    critical: [
      { coverage: 'Buildings insurance', limit: 'Full rebuild cost', cost: '£150-300/year' },
      { coverage: 'Contents insurance', limit: 'Full replacement', cost: '£100-200/year' },
      { coverage: 'Public liability', limit: '£2,000,000', cost: '£20-40/year' }
    ],
    moderate: [
      { coverage: 'Flood coverage', limit: 'Full property value', cost: '£50-150/year' },
      { coverage: 'Accidental damage', limit: 'Full coverage', cost: '£30-60/year' },
      { coverage: 'Alternative accommodation', limit: '£25,000', cost: '£25-50/year' }
    ],
    optional: [
      { coverage: 'Garden cover', limit: '£5,000', cost: '£15-30/year' },
      { coverage: 'Home emergency', limit: '24/7 callout', cost: '£40-80/year' }
    ]
  },
  business: {
    critical: [
      { coverage: 'Public liability', limit: '£6,000,000', cost: '£100-300/year' },
      { coverage: 'Employers liability', limit: '£10,000,000', cost: '£150-400/year' },
      { coverage: 'Professional indemnity', limit: '£1,000,000', cost: '£200-600/year' }
    ],
    moderate: [
      { coverage: 'Cyber liability', limit: '£1,000,000', cost: '£300-800/year' },
      { coverage: 'Business interruption', limit: '12 months revenue', cost: '£200-500/year' },
      { coverage: 'Product liability', limit: '£2,000,000', cost: '£100-250/year' }
    ],
    optional: [
      { coverage: 'Directors and officers', limit: '£5,000,000', cost: '£500-1500/year' },
      { coverage: 'Key person insurance', limit: '£1,000,000', cost: '£300-800/year' }
    ]
  }
};

export const analyzePolicy = async (
  policyText: string, 
  policyType: string = 'general'
): Promise<GapAnalysisResult> => {
  try {
    const detectedType = detectPolicyType(policyText);
    const actualType = policyType === 'general' ? detectedType : policyType;
    
    console.log(`Analyzing ${actualType} policy with advanced NLP logic`);
    
    const gaps: CoverageGap[] = [];
    let totalCoverages = 0;
    
    // Get relevant benchmarks
    const benchmarks = UK_COVERAGE_BENCHMARKS[actualType as keyof typeof UK_COVERAGE_BENCHMARKS];
    
    if (benchmarks) {
      // Analyze critical coverages
      benchmarks.critical.forEach(benchmark => {
        const analysis = analyzeCoverage(policyText, benchmark, 'critical');
        gaps.push(analysis);
        totalCoverages++;
      });
      
      // Analyze moderate coverages
      benchmarks.moderate.forEach(benchmark => {
        const analysis = analyzeCoverage(policyText, benchmark, 'moderate');
        gaps.push(analysis);
        totalCoverages++;
      });
      
      // Analyze optional coverages
      benchmarks.optional.forEach(benchmark => {
        const analysis = analyzeCoverage(policyText, benchmark, 'low');
        gaps.push(analysis);
        totalCoverages++;
      });
    } else {
      // Fallback general analysis
      return analyzeGeneralPolicy(policyText);
    }
    
    // Calculate metrics
    const adequateCount = gaps.filter(gap => gap.status === 'adequate').length;
    const criticalGaps = gaps.filter(gap => gap.severity === 'critical' && gap.status !== 'adequate').length;
    const overallScore = Math.round((adequateCount / totalCoverages) * 100);
    
    return {
      overallScore,
      totalGaps: gaps.filter(gap => gap.status !== 'adequate').length,
      criticalGaps,
      gaps,
      completeness: {
        covered: adequateCount,
        gaps: totalCoverages - adequateCount,
        percentage: overallScore
      }
    };
  } catch (error) {
    console.error('Error in policy analysis:', error);
    throw new Error('Failed to analyze policy coverage');
  }
};

const detectPolicyType = (policyText: string): string => {
  const lowerText = policyText.toLowerCase();
  
  // Enhanced detection with more keywords
  const typeIndicators = {
    car: ['vehicle', 'motor', 'car', 'automobile', 'driving', 'road traffic'],
    home: ['property', 'building', 'house', 'home', 'contents', 'dwelling'],
    business: ['commercial', 'business', 'company', 'enterprise', 'trade', 'professional'],
    life: ['life insurance', 'death benefit', 'life cover', 'term life', 'whole life']
  };
  
  let maxScore = 0;
  let detectedType = 'general';
  
  Object.entries(typeIndicators).forEach(([type, keywords]) => {
    const score = keywords.reduce((acc, keyword) => {
      return acc + (lowerText.includes(keyword) ? 1 : 0);
    }, 0);
    
    if (score > maxScore) {
      maxScore = score;
      detectedType = type;
    }
  });
  
  return detectedType;
};

const analyzeCoverage = (
  policyText: string, 
  benchmark: any, 
  severity: 'critical' | 'moderate' | 'low'
): CoverageGap => {
  const lowerText = policyText.toLowerCase();
  const coverage = benchmark.coverage;
  
  // Check for coverage using synonyms
  const hasCoverage = checkCoveragePresence(lowerText, coverage);
  const hasAdequateLimit = checkCoverageLimit(lowerText, coverage, benchmark.limit);
  
  let status: 'missing' | 'insufficient' | 'adequate';
  let recommendation: string;
  let description: string;
  
  if (!hasCoverage) {
    status = 'missing';
    description = `${coverage} is not mentioned in your policy`;
    recommendation = `Add ${coverage} coverage (${benchmark.limit}). Estimated cost: ${benchmark.cost}`;
  } else if (!hasAdequateLimit) {
    status = 'insufficient';
    description = `${coverage} is present but may have insufficient limits`;
    recommendation = `Review ${coverage} limits to ensure they meet ${benchmark.limit} standard`;
  } else {
    status = 'adequate';
    description = `${coverage} appears to be adequately covered`;
    recommendation = `Maintain current ${coverage} coverage`;
  }
  
  return {
    category: getCategoryFromCoverage(coverage),
    coverage,
    status,
    severity,
    description,
    recommendation,
    estimatedCost: benchmark.cost,
    riskLevel: severity === 'critical' ? 'High' : severity === 'moderate' ? 'Medium' : 'Low'
  };
};

const checkCoveragePresence = (policyText: string, coverage: string): boolean => {
  const coverageLower = coverage.toLowerCase();
  
  // Direct match
  if (policyText.includes(coverageLower)) {
    return true;
  }
  
  // Check synonyms
  const synonyms = COVERAGE_SYNONYMS[coverageLower] || [];
  return synonyms.some(synonym => policyText.includes(synonym.toLowerCase()));
};

const checkCoverageLimit = (policyText: string, coverage: string, expectedLimit: string): boolean => {
  // This is a simplified limit check - in a real implementation, you'd parse monetary amounts
  const hasMonetaryAmount = /£[\d,]+/.test(policyText);
  const hasPercentage = /\d+%/.test(policyText);
  const hasLimitKeywords = ['limit', 'maximum', 'up to', 'cover'].some(keyword => 
    policyText.includes(keyword)
  );
  
  return hasMonetaryAmount || hasPercentage || hasLimitKeywords;
};

const getCategoryFromCoverage = (coverage: string): string => {
  const categoryMap: { [key: string]: string } = {
    'third-party liability': 'Liability',
    'public liability': 'Liability',
    'professional indemnity': 'Professional',
    'cyber liability': 'Cyber Security',
    'buildings insurance': 'Property',
    'contents insurance': 'Property',
    'flood coverage': 'Property',
    'business interruption': 'Business Operations',
    'motor legal protection': 'Legal',
    'breakdown cover': 'Vehicle Services'
  };
  
  return categoryMap[coverage.toLowerCase()] || 'General';
};

const analyzeGeneralPolicy = (policyText: string): GapAnalysisResult => {
  const commonCoverages = [
    'liability protection',
    'property damage',
    'theft coverage',
    'accidental damage',
    'legal expenses'
  ];
  
  const gaps: CoverageGap[] = commonCoverages.map(coverage => ({
    category: 'General',
    coverage,
    status: policyText.toLowerCase().includes(coverage.toLowerCase()) ? 'adequate' : 'missing',
    severity: 'moderate' as const,
    description: `${coverage} analysis`,
    recommendation: `Review ${coverage} in your policy`,
    riskLevel: 'Medium' as const
  }));
  
  const adequateCount = gaps.filter(gap => gap.status === 'adequate').length;
  const overallScore = Math.round((adequateCount / commonCoverages.length) * 100);
  
  return {
    overallScore,
    totalGaps: gaps.filter(gap => gap.status !== 'adequate').length,
    criticalGaps: 0,
    gaps,
    completeness: {
      covered: adequateCount,
      gaps: commonCoverages.length - adequateCount,
      percentage: overallScore
    }
  };
};
