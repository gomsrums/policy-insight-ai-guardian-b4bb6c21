
// UK Insurance Coverage Benchmarks
const UK_INSURANCE_BENCHMARKS = {
  car: {
    category: "Car Insurance",
    required: [
      "Third-party liability",
      "Fire and theft protection",
      "Comprehensive coverage",
      "Breakdown cover",
      "Legal expenses",
      "Personal injury protection",
      "Windscreen cover"
    ],
    limits: {
      "Third-party liability": "£20,000,000",
      "Fire and theft": "Market value",
      "Personal injury": "£100,000"
    }
  },
  home: {
    category: "Home Insurance",
    required: [
      "Buildings insurance",
      "Contents insurance",
      "Flood coverage",
      "Theft protection",
      "Accidental damage",
      "Public liability",
      "Alternative accommodation",
      "Emergency repairs"
    ],
    limits: {
      "Buildings insurance": "Full rebuild cost",
      "Contents insurance": "Full replacement value",
      "Public liability": "£2,000,000"
    }
  },
  life: {
    category: "Life Insurance",
    required: [
      "Death benefit",
      "Critical illness cover",
      "Income protection",
      "Terminal illness benefit",
      "Accidental death benefit"
    ],
    limits: {
      "Death benefit": "10x annual income",
      "Critical illness": "Full sum assured",
      "Income protection": "75% of income"
    }
  },
  business: {
    category: "Business Insurance",
    required: [
      "Public liability",
      "Employers liability",
      "Professional indemnity",
      "Product liability",
      "Cyber liability",
      "Business interruption",
      "Directors and officers",
      "Key person insurance"
    ],
    limits: {
      "Public liability": "£6,000,000",
      "Employers liability": "£10,000,000",
      "Professional indemnity": "£1,000,000"
    }
  }
};

interface CoverageGap {
  category: string;
  missing: string[];
  insufficient: string[];
  recommendations: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  coverageScore: number;
}

export const analyzeCoverageGaps = async (
  policySummary: string,
  policyType: string = "general",
  region: string = "UK"
): Promise<CoverageGap[]> => {
  try {
    // Determine policy type from summary if not specified
    const detectedType = detectPolicyType(policySummary);
    const actualType = policyType === "general" ? detectedType : policyType;
    
    const gaps: CoverageGap[] = [];
    
    // Analyze against relevant benchmarks
    if (actualType === "car" || policySummary.toLowerCase().includes("vehicle") || policySummary.toLowerCase().includes("motor")) {
      gaps.push(analyzeCarInsurance(policySummary));
    }
    
    if (actualType === "home" || policySummary.toLowerCase().includes("property") || policySummary.toLowerCase().includes("building")) {
      gaps.push(analyzeHomeInsurance(policySummary));
    }
    
    if (actualType === "life" || policySummary.toLowerCase().includes("life insurance")) {
      gaps.push(analyzeLifeInsurance(policySummary));
    }
    
    if (actualType === "business" || policySummary.toLowerCase().includes("commercial") || policySummary.toLowerCase().includes("liability")) {
      gaps.push(analyzeBusinessInsurance(policySummary));
    }
    
    // If no specific type detected, provide general analysis
    if (gaps.length === 0) {
      gaps.push(analyzeGeneralInsurance(policySummary));
    }
    
    return gaps.filter(gap => gap !== null);
  } catch (error) {
    console.error("Error in coverage gap analysis:", error);
    return [getDefaultGapAnalysis()];
  }
};

const detectPolicyType = (summary: string): string => {
  const lowerSummary = summary.toLowerCase();
  
  if (lowerSummary.includes("vehicle") || lowerSummary.includes("motor") || lowerSummary.includes("car")) {
    return "car";
  }
  if (lowerSummary.includes("property") || lowerSummary.includes("building") || lowerSummary.includes("home")) {
    return "home";
  }
  if (lowerSummary.includes("life insurance") || lowerSummary.includes("death benefit")) {
    return "life";
  }
  if (lowerSummary.includes("commercial") || lowerSummary.includes("business") || lowerSummary.includes("liability")) {
    return "business";
  }
  
  return "general";
};

const analyzeCarInsurance = (summary: string): CoverageGap => {
  const benchmark = UK_INSURANCE_BENCHMARKS.car;
  const missing: string[] = [];
  const insufficient: string[] = [];
  const recommendations: string[] = [];
  
  const lowerSummary = summary.toLowerCase();
  
  // Check for missing coverages
  benchmark.required.forEach(coverage => {
    const coverageTerms = getCoverageTerms(coverage);
    const hasCoverage = coverageTerms.some(term => lowerSummary.includes(term));
    
    if (!hasCoverage) {
      missing.push(coverage);
      recommendations.push(`Add ${coverage} to meet UK insurance standards`);
    }
  });
  
  // Check for insufficient limits
  if (lowerSummary.includes("third party") && !lowerSummary.includes("comprehensive")) {
    insufficient.push("Third-party only coverage may be insufficient");
    recommendations.push("Consider upgrading to comprehensive coverage for better protection");
  }
  
  const coverageScore = Math.max(0, Math.round(((benchmark.required.length - missing.length) / benchmark.required.length) * 100));
  const riskLevel = missing.length > 3 ? 'High' : missing.length > 1 ? 'Medium' : 'Low';
  
  return {
    category: "Car Insurance",
    missing,
    insufficient,
    recommendations,
    riskLevel,
    coverageScore
  };
};

const analyzeHomeInsurance = (summary: string): CoverageGap => {
  const benchmark = UK_INSURANCE_BENCHMARKS.home;
  const missing: string[] = [];
  const insufficient: string[] = [];
  const recommendations: string[] = [];
  
  const lowerSummary = summary.toLowerCase();
  
  benchmark.required.forEach(coverage => {
    const coverageTerms = getCoverageTerms(coverage);
    const hasCoverage = coverageTerms.some(term => lowerSummary.includes(term));
    
    if (!hasCoverage) {
      missing.push(coverage);
      recommendations.push(`Add ${coverage} - essential for UK home insurance`);
    }
  });
  
  // Special checks for UK home insurance
  if (!lowerSummary.includes("flood") && !lowerSummary.includes("water damage")) {
    missing.push("Flood coverage");
    recommendations.push("Add flood coverage - important due to UK weather patterns");
  }
  
  const coverageScore = Math.max(0, Math.round(((benchmark.required.length - missing.length) / benchmark.required.length) * 100));
  const riskLevel = missing.length > 4 ? 'High' : missing.length > 2 ? 'Medium' : 'Low';
  
  return {
    category: "Home Insurance",
    missing,
    insufficient,
    recommendations,
    riskLevel,
    coverageScore
  };
};

const analyzeLifeInsurance = (summary: string): CoverageGap => {
  const benchmark = UK_INSURANCE_BENCHMARKS.life;
  const missing: string[] = [];
  const insufficient: string[] = [];
  const recommendations: string[] = [];
  
  const lowerSummary = summary.toLowerCase();
  
  benchmark.required.forEach(coverage => {
    const coverageTerms = getCoverageTerms(coverage);
    const hasCoverage = coverageTerms.some(term => lowerSummary.includes(term));
    
    if (!hasCoverage) {
      missing.push(coverage);
      recommendations.push(`Consider adding ${coverage} for comprehensive life protection`);
    }
  });
  
  const coverageScore = Math.max(0, Math.round(((benchmark.required.length - missing.length) / benchmark.required.length) * 100));
  const riskLevel = missing.length > 2 ? 'High' : missing.length > 1 ? 'Medium' : 'Low';
  
  return {
    category: "Life Insurance",
    missing,
    insufficient,
    recommendations,
    riskLevel,
    coverageScore
  };
};

const analyzeBusinessInsurance = (summary: string): CoverageGap => {
  const benchmark = UK_INSURANCE_BENCHMARKS.business;
  const missing: string[] = [];
  const insufficient: string[] = [];
  const recommendations: string[] = [];
  
  const lowerSummary = summary.toLowerCase();
  
  benchmark.required.forEach(coverage => {
    const coverageTerms = getCoverageTerms(coverage);
    const hasCoverage = coverageTerms.some(term => lowerSummary.includes(term));
    
    if (!hasCoverage) {
      missing.push(coverage);
      recommendations.push(`${coverage} is essential for UK business operations`);
    }
  });
  
  // Check for cyber liability (increasingly important)
  if (!lowerSummary.includes("cyber") && !lowerSummary.includes("data breach")) {
    missing.push("Cyber liability insurance");
    recommendations.push("Add cyber liability coverage - increasingly important for all businesses");
  }
  
  const coverageScore = Math.max(0, Math.round(((benchmark.required.length - missing.length) / benchmark.required.length) * 100));
  const riskLevel = missing.length > 4 ? 'High' : missing.length > 2 ? 'Medium' : 'Low';
  
  return {
    category: "Business Insurance",
    missing,
    insufficient,
    recommendations,
    riskLevel,
    coverageScore
  };
};

const analyzeGeneralInsurance = (summary: string): CoverageGap => {
  const missing: string[] = [];
  const insufficient: string[] = [];
  const recommendations: string[] = [];
  
  const lowerSummary = summary.toLowerCase();
  
  // Check for common coverage gaps
  const commonCoverages = [
    "liability protection",
    "accidental damage",
    "theft coverage",
    "emergency expenses",
    "legal expenses"
  ];
  
  commonCoverages.forEach(coverage => {
    const coverageTerms = getCoverageTerms(coverage);
    const hasCoverage = coverageTerms.some(term => lowerSummary.includes(term));
    
    if (!hasCoverage) {
      missing.push(coverage);
    }
  });
  
  // General recommendations
  recommendations.push("Review policy annually to ensure adequate coverage");
  recommendations.push("Consider inflation protection for sum insured amounts");
  recommendations.push("Ensure all valuable items are properly covered");
  
  const coverageScore = Math.max(40, Math.round(((commonCoverages.length - missing.length) / commonCoverages.length) * 100));
  const riskLevel = missing.length > 3 ? 'Medium' : 'Low';
  
  return {
    category: "General Insurance",
    missing,
    insufficient,
    recommendations,
    riskLevel,
    coverageScore
  };
};

const getCoverageTerms = (coverage: string): string[] => {
  const termMap: { [key: string]: string[] } = {
    "Third-party liability": ["third party", "liability", "third-party"],
    "Fire and theft protection": ["fire", "theft", "stolen"],
    "Comprehensive coverage": ["comprehensive", "fully comp"],
    "Breakdown cover": ["breakdown", "recovery", "roadside"],
    "Legal expenses": ["legal", "legal expenses", "legal protection"],
    "Buildings insurance": ["buildings", "structure", "property"],
    "Contents insurance": ["contents", "personal belongings"],
    "Flood coverage": ["flood", "water damage", "flooding"],
    "Theft protection": ["theft", "burglary", "stolen"],
    "Accidental damage": ["accidental", "accident", "damage"],
    "Public liability": ["public liability", "third party liability"],
    "Death benefit": ["death", "death benefit", "life cover"],
    "Critical illness cover": ["critical illness", "serious illness"],
    "Income protection": ["income protection", "income replacement"],
    "Professional indemnity": ["professional indemnity", "PI", "errors and omissions"],
    "Cyber liability": ["cyber", "data breach", "cyber attack"],
    "Business interruption": ["business interruption", "loss of income"]
  };
  
  return termMap[coverage] || [coverage.toLowerCase()];
};

const getDefaultGapAnalysis = (): CoverageGap => {
  return {
    category: "General Coverage",
    missing: ["Unable to analyze specific gaps"],
    insufficient: [],
    recommendations: [
      "Review your policy document with an insurance professional",
      "Compare coverage against industry standards",
      "Consider annual policy reviews to ensure adequate protection"
    ],
    riskLevel: 'Medium',
    coverageScore: 60
  };
};
