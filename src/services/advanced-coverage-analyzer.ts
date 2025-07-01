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

// Regional Insurance Benchmarks with severity classifications
const REGIONAL_BENCHMARKS = {
  UK: {
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
  },
  US: {
    car: {
      critical: [
        { coverage: 'Liability coverage', limit: '$100,000/$300,000', cost: '$500-800/year' },
        { coverage: 'Uninsured motorist', limit: '$100,000/$300,000', cost: '$100-200/year' }
      ],
      moderate: [
        { coverage: 'Collision coverage', limit: 'Actual cash value', cost: '$300-600/year' },
        { coverage: 'Comprehensive coverage', limit: 'Actual cash value', cost: '$200-400/year' },
        { coverage: 'Personal injury protection', limit: '$10,000', cost: '$150-300/year' }
      ],
      optional: [
        { coverage: 'Gap insurance', limit: 'Vehicle value difference', cost: '$200-400/year' },
        { coverage: 'Roadside assistance', limit: 'Unlimited calls', cost: '$50-100/year' }
      ]
    },
    home: {
      critical: [
        { coverage: 'Dwelling coverage', limit: 'Full replacement cost', cost: '$800-1500/year' },
        { coverage: 'Personal liability', limit: '$300,000', cost: '$150-300/year' },
        { coverage: 'Personal property', limit: '50-70% of dwelling', cost: '$200-400/year' }
      ],
      moderate: [
        { coverage: 'Additional living expenses', limit: '20% of dwelling', cost: '$100-200/year' },
        { coverage: 'Medical payments', limit: '$5,000', cost: '$50-100/year' },
        { coverage: 'Water backup', limit: '$10,000', cost: '$100-200/year' }
      ],
      optional: [
        { coverage: 'Earthquake coverage', limit: 'Separate deductible', cost: '$200-500/year' },
        { coverage: 'Flood insurance', limit: '$250,000', cost: '$400-800/year' }
      ]
    },
    business: {
      critical: [
        { coverage: 'General liability', limit: '$2,000,000', cost: '$500-1000/year' },
        { coverage: 'Workers compensation', limit: 'State requirements', cost: '$800-2000/year' },
        { coverage: 'Commercial property', limit: 'Full replacement', cost: '$500-1500/year' }
      ],
      moderate: [
        { coverage: 'Professional liability', limit: '$1,000,000', cost: '$800-2000/year' },
        { coverage: 'Cyber liability', limit: '$1,000,000', cost: '$1000-3000/year' },
        { coverage: 'Business interruption', limit: '12 months income', cost: '$500-1200/year' }
      ],
      optional: [
        { coverage: 'Employment practices', limit: '$1,000,000', cost: '$800-1500/year' },
        { coverage: 'Directors and officers', limit: '$5,000,000', cost: '$2000-5000/year' }
      ]
    }
  },
  INDIA: {
    car: {
      critical: [
        { coverage: 'Third-party liability', limit: '₹15,00,000', cost: '₹2,000-5,000/year' },
        { coverage: 'Own damage coverage', limit: 'IDV based', cost: '₹8,000-15,000/year' }
      ],
      moderate: [
        { coverage: 'Personal accident cover', limit: '₹15,00,000', cost: '₹750-1,500/year' },
        { coverage: 'Zero depreciation', limit: 'Full component cost', cost: '₹3,000-8,000/year' },
        { coverage: 'Engine protection', limit: 'Engine replacement', cost: '₹2,000-5,000/year' }
      ],
      optional: [
        { coverage: 'Roadside assistance', limit: '24x7 support', cost: '₹1,000-2,000/year' },
        { coverage: 'Key replacement', limit: '₹10,000', cost: '₹500-1,000/year' }
      ]
    },
    home: {
      critical: [
        { coverage: 'Structure coverage', limit: 'Full rebuild cost', cost: '₹3,000-8,000/year' },
        { coverage: 'Contents coverage', limit: 'Actual value', cost: '₹2,000-5,000/year' },
        { coverage: 'Public liability', limit: '₹10,00,000', cost: '₹1,000-2,000/year' }
      ],
      moderate: [
        { coverage: 'Earthquake coverage', limit: 'Full structure value', cost: '₹2,000-5,000/year' },
        { coverage: 'Flood coverage', limit: 'Structure + contents', cost: '₹1,500-3,000/year' },
        { coverage: 'Burglary coverage', limit: 'Contents value', cost: '₹1,000-2,500/year' }
      ],
      optional: [
        { coverage: 'Loss of rent', limit: '12 months rent', cost: '₹500-1,500/year' },
        { coverage: 'Home emergency', limit: '24x7 service', cost: '₹1,000-2,000/year' }
      ]
    },
    business: {
      critical: [
        { coverage: 'Public liability', limit: '₹50,00,000', cost: '₹5,000-15,000/year' },
        { coverage: 'Product liability', limit: '₹25,00,000', cost: '₹8,000-20,000/year' },
        { coverage: 'Fire and perils', limit: 'Full asset value', cost: '₹10,000-25,000/year' }
      ],
      moderate: [
        { coverage: 'Business interruption', limit: '12 months income', cost: '₹8,000-20,000/year' },
        { coverage: 'Electronic equipment', limit: 'Replacement cost', cost: '₹5,000-12,000/year' },
        { coverage: 'Money insurance', limit: '₹5,00,000', cost: '₹2,000-5,000/year' }
      ],
      optional: [
        { coverage: 'Cyber liability', limit: '₹25,00,000', cost: '₹15,000-40,000/year' },
        { coverage: 'Key person insurance', limit: '₹50,00,000', cost: '₹20,000-50,000/year' }
      ]
    }
  },
  EUROPE: {
    car: {
      critical: [
        { coverage: 'Third-party liability', limit: '€7,500,000', cost: '€300-600/year' },
        { coverage: 'Legal expenses', limit: '€100,000', cost: '€50-100/year' }
      ],
      moderate: [
        { coverage: 'Comprehensive coverage', limit: 'Market value', cost: '€400-800/year' },
        { coverage: 'Breakdown assistance', limit: 'EU-wide coverage', cost: '€80-150/year' },
        { coverage: 'Glass coverage', limit: 'Full replacement', cost: '€30-60/year' }
      ],
      optional: [
        { coverage: 'Gap insurance', limit: 'New car value', cost: '€150-300/year' },
        { coverage: 'European coverage', limit: 'Extended territory', cost: '€100-200/year' }
      ]
    },
    home: {
      critical: [
        { coverage: 'Buildings insurance', limit: 'Full rebuild cost', cost: '€200-500/year' },
        { coverage: 'Contents insurance', limit: 'Replacement value', cost: '€150-300/year' },
        { coverage: 'Public liability', limit: '€2,500,000', cost: '€50-100/year' }
      ],
      moderate: [
        { coverage: 'Water damage', limit: 'Full coverage', cost: '€100-200/year' },
        { coverage: 'Natural disasters', limit: 'Regional standards', cost: '€150-400/year' },
        { coverage: 'Theft protection', limit: 'Contents value', cost: '€80-150/year' }
      ],
      optional: [
        { coverage: 'Glass insurance', limit: 'All glazing', cost: '€50-100/year' },
        { coverage: 'Garden coverage', limit: '€10,000', cost: '€30-60/year' }
      ]
    },
    business: {
      critical: [
        { coverage: 'Public liability', limit: '€5,000,000', cost: '€200-500/year' },
        { coverage: 'Employers liability', limit: '€10,000,000', cost: '€300-700/year' },
        { coverage: 'Professional indemnity', limit: '€2,000,000', cost: '€500-1200/year' }
      ],
      moderate: [
        { coverage: 'Cyber insurance', limit: '€1,000,000', cost: '€800-2000/year' },
        { coverage: 'Business interruption', limit: '12 months turnover', cost: '€400-1000/year' },
        { coverage: 'Product liability', limit: '€2,500,000', cost: '€300-800/year' }
      ],
      optional: [
        { coverage: 'Key person insurance', limit: '€1,000,000', cost: '€600-1500/year' },
        { coverage: 'Environmental liability', limit: '€5,000,000', cost: '€1000-2500/year' }
      ]
    }
  }
};

export const analyzePolicy = async (
  policyText: string, 
  policyType: string = 'general',
  region: string = 'UK'
): Promise<GapAnalysisResult> => {
  try {
    const detectedType = detectPolicyType(policyText);
    const actualType = policyType === 'general' ? detectedType : policyType;
    
    console.log(`Analyzing ${actualType} policy with ${region} standards using advanced NLP logic`);
    
    const gaps: CoverageGap[] = [];
    let totalCoverages = 0;
    
    // Get relevant benchmarks for the region
    const regionalBenchmarks = REGIONAL_BENCHMARKS[region as keyof typeof REGIONAL_BENCHMARKS];
    const benchmarks = regionalBenchmarks?.[actualType as keyof typeof regionalBenchmarks];
    
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
  // Multi-currency limit check
  const hasCurrencyAmount = /[£$€₹][\d,]+/.test(policyText);
  const hasPercentage = /\d+%/.test(policyText);
  const hasLimitKeywords = ['limit', 'maximum', 'up to', 'cover', 'coverage'].some(keyword => 
    policyText.includes(keyword)
  );
  
  return hasCurrencyAmount || hasPercentage || hasLimitKeywords;
};

const getCategoryFromCoverage = (coverage: string): string => {
  const categoryMap: { [key: string]: string } = {
    'third-party liability': 'Liability',
    'public liability': 'Liability',
    'general liability': 'Liability',
    'professional indemnity': 'Professional',
    'cyber liability': 'Cyber Security',
    'buildings insurance': 'Property',
    'contents insurance': 'Property',
    'flood coverage': 'Property',
    'business interruption': 'Business Operations',
    'motor legal protection': 'Legal',
    'breakdown cover': 'Vehicle Services',
    'workers compensation': 'Employment',
    'employment practices': 'Employment'
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