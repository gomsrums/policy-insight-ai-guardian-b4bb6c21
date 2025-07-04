
import { AnalysisResult } from "@/lib/chatpdf-types";

export interface RiskFactor {
  id: string;
  category: string;
  description: string;
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
  probability: 'Rare' | 'Unlikely' | 'Possible' | 'Likely' | 'Almost Certain';
  financialExposure: number;
  mitigationCost: number;
  regulatoryRisk: boolean;
  businessContinuityRisk: boolean;
  reputationalRisk: boolean;
  detectedKeywords: string[];
  confidence: number;
}

export interface ComprehensiveRiskAssessment {
  overallRiskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  totalFinancialExposure: number;
  prioritizedRisks: RiskFactor[];
  riskMatrix: RiskMatrixEntry[];
  recommendations: RiskRecommendation[];
  complianceScore: number;
  businessContinuityScore: number;
  reputationalScore: number;
}

export interface RiskMatrixEntry {
  risk: string;
  impact: number;
  probability: number;
  riskScore: number;
  position: { x: number; y: number };
  color: string;
}

export interface RiskRecommendation {
  priority: 'Immediate' | 'High' | 'Medium' | 'Low';
  category: string;
  action: string;
  estimatedCost: number;
  timeframe: string;
  riskReduction: number;
  roiScore: number;
}

// Industry-specific risk factors with impact and probability weights
const RISK_CATEGORIES = {
  'Cyber Security': {
    baseImpact: 4.5,
    baseProbability: 3.8,
    financialMultiplier: 50000,
    keywords: ['data breach', 'cyber attack', 'ransomware', 'malware', 'phishing', 'data protection', 'gdpr', 'privacy'],
    regulatoryRisk: true,
    businessContinuityRisk: true,
    reputationalRisk: true
  },
  'Professional Liability': {
    baseImpact: 4.0,
    baseProbability: 3.5,
    financialMultiplier: 100000,
    keywords: ['errors', 'omissions', 'negligence', 'professional advice', 'malpractice', 'fiduciary duty'],
    regulatoryRisk: true,
    businessContinuityRisk: false,
    reputationalRisk: true
  },
  'General Liability': {
    baseImpact: 3.5,
    baseProbability: 3.0,
    financialMultiplier: 75000,
    keywords: ['bodily injury', 'property damage', 'slip and fall', 'premises liability', 'product liability'],
    regulatoryRisk: false,
    businessContinuityRisk: false,
    reputationalRisk: true
  },
  'Employment Practices': {
    baseImpact: 3.8,
    baseProbability: 3.2,
    financialMultiplier: 85000,
    keywords: ['discrimination', 'harassment', 'wrongful termination', 'employment law', 'workplace'],
    regulatoryRisk: true,
    businessContinuityRisk: false,
    reputationalRisk: true
  },
  'Business Interruption': {
    baseImpact: 4.8,
    baseProbability: 2.5,
    financialMultiplier: 200000,
    keywords: ['business interruption', 'lost income', 'operational disruption', 'supply chain'],
    regulatoryRisk: false,
    businessContinuityRisk: true,
    reputationalRisk: false
  },
  'Regulatory Compliance': {
    baseImpact: 4.2,
    baseProbability: 3.6,
    financialMultiplier: 120000,
    keywords: ['compliance', 'regulatory', 'violation', 'fine', 'penalty', 'audit'],
    regulatoryRisk: true,
    businessContinuityRisk: true,
    reputationalRisk: true
  },
  'Directors & Officers': {
    baseImpact: 4.3,
    baseProbability: 2.8,
    financialMultiplier: 150000,
    keywords: ['management liability', 'board decision', 'shareholder', 'fiduciary', 'governance'],
    regulatoryRisk: true,
    businessContinuityRisk: false,
    reputationalRisk: true
  },
  'Property Damage': {
    baseImpact: 3.8,
    baseProbability: 2.9,
    financialMultiplier: 95000,
    keywords: ['fire', 'flood', 'earthquake', 'vandalism', 'theft', 'property damage'],
    regulatoryRisk: false,
    businessContinuityRisk: true,
    reputationalRisk: false
  }
};

// Industry risk multipliers
const INDUSTRY_MULTIPLIERS = {
  'Technology': { cyber: 1.8, professional: 1.4, general: 0.8 },
  'Healthcare': { professional: 2.0, cyber: 1.6, regulatory: 1.8 },
  'Financial Services': { cyber: 2.2, regulatory: 2.0, professional: 1.8 },
  'Manufacturing': { general: 1.6, property: 1.4, employment: 1.2 },
  'Construction': { general: 2.0, property: 1.6, employment: 1.3 },
  'Professional Services': { professional: 1.8, cyber: 1.2, employment: 1.1 },
  'Retail': { general: 1.3, cyber: 1.1, property: 1.2 },
  'Default': { cyber: 1.0, professional: 1.0, general: 1.0 }
};

export class ComprehensiveRiskAssessor {
  
  static async assessRisk(
    analysis: AnalysisResult,
    businessProfile?: {
      industry: string;
      employeeCount: number;
      annualRevenue: number;
      businessType: string;
    }
  ): Promise<ComprehensiveRiskAssessment> {
    
    console.log("Starting comprehensive risk assessment...");
    
    // Extract text content for analysis
    const textContent = this.extractTextContent(analysis);
    
    // Detect risk factors
    const detectedRisks = this.detectRiskFactors(textContent, businessProfile);
    
    // Calculate financial exposure
    const riskMatrix = this.buildRiskMatrix(detectedRisks);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(detectedRisks, businessProfile);
    
    // Calculate scores
    const overallRiskScore = this.calculateOverallRiskScore(detectedRisks);
    const complianceScore = this.calculateComplianceScore(detectedRisks);
    const businessContinuityScore = this.calculateBusinessContinuityScore(detectedRisks);
    const reputationalScore = this.calculateReputationalScore(detectedRisks);
    
    const totalFinancialExposure = detectedRisks.reduce((sum, risk) => sum + risk.financialExposure, 0);
    
    return {
      overallRiskScore,
      riskLevel: this.determineRiskLevel(overallRiskScore),
      totalFinancialExposure,
      prioritizedRisks: this.prioritizeRisks(detectedRisks),
      riskMatrix,
      recommendations: this.prioritizeRecommendations(recommendations),
      complianceScore,
      businessContinuityScore,
      reputationalScore
    };
  }
  
  private static extractTextContent(analysis: AnalysisResult): string {
    let content = analysis.summary || '';
    
    if (analysis.gaps) {
      content += ' ' + analysis.gaps.join(' ');
    }
    
    if (analysis.risk_assessment?.risk_factors) {
      content += ' ' + analysis.risk_assessment.risk_factors.join(' ');
    }
    
    if (analysis.risk_assessment?.mitigation_strategies) {
      content += ' ' + analysis.risk_assessment.mitigation_strategies.join(' ');
    }
    
    return content.toLowerCase();
  }
  
  private static detectRiskFactors(
    textContent: string,
    businessProfile?: any
  ): RiskFactor[] {
    const detectedRisks: RiskFactor[] = [];
    const industry = businessProfile?.industry || 'Default';
    const multipliers = INDUSTRY_MULTIPLIERS[industry as keyof typeof INDUSTRY_MULTIPLIERS] || INDUSTRY_MULTIPLIERS.Default;
    
    Object.entries(RISK_CATEGORIES).forEach(([category, config]) => {
      const matchedKeywords = config.keywords.filter(keyword => 
        textContent.includes(keyword.toLowerCase())
      );
      
      if (matchedKeywords.length > 0) {
        // Calculate probability based on keyword frequency and context
        const keywordDensity = matchedKeywords.length / config.keywords.length;
        const contextualProbability = this.calculateContextualProbability(textContent, matchedKeywords);
        
        const adjustedProbability = Math.min(5, config.baseProbability * (1 + keywordDensity) * contextualProbability);
        
        // Apply industry multipliers
        const industryMultiplier = multipliers[category.toLowerCase().replace(/\s+/g, '') as keyof typeof multipliers] || 1.0;
        const adjustedImpact = Math.min(5, config.baseImpact * industryMultiplier);
        
        // Calculate financial exposure based on business profile
        const financialExposure = this.calculateFinancialExposure(
          config.financialMultiplier,
          adjustedImpact,
          adjustedProbability,
          businessProfile
        );
        
        const confidence = Math.min(1, (matchedKeywords.length / config.keywords.length) * 0.7 + contextualProbability * 0.3);
        
        detectedRisks.push({
          id: `risk_${category.toLowerCase().replace(/\s+/g, '_')}`,
          category,
          description: this.generateRiskDescription(category, matchedKeywords, businessProfile),
          impact: this.mapScoreToLevel(adjustedImpact),
          probability: this.mapScoreToLevel(adjustedProbability),
          financialExposure,
          mitigationCost: financialExposure * 0.15, // Estimated 15% of exposure
          regulatoryRisk: config.regulatoryRisk,
          businessContinuityRisk: config.businessContinuityRisk,
          reputationalRisk: config.reputationalRisk,
          detectedKeywords: matchedKeywords,
          confidence
        });
      }
    });
    
    return detectedRisks;
  }
  
  private static calculateContextualProbability(textContent: string, keywords: string[]): number {
    // Look for negative indicators that might reduce probability
    const negativeIndicators = ['covered', 'protected', 'insured', 'adequate', 'comprehensive'];
    const positiveIndicators = ['gap', 'missing', 'insufficient', 'lacking', 'excluded'];
    
    let contextScore = 1.0;
    
    keywords.forEach(keyword => {
      const keywordContext = this.extractContext(textContent, keyword, 50);
      
      negativeIndicators.forEach(indicator => {
        if (keywordContext.includes(indicator)) {
          contextScore *= 0.7; // Reduce probability if coverage is mentioned
        }
      });
      
      positiveIndicators.forEach(indicator => {
        if (keywordContext.includes(indicator)) {
          contextScore *= 1.3; // Increase probability if gaps are mentioned
        }
      });
    });
    
    return Math.max(0.3, Math.min(2.0, contextScore));
  }
  
  private static extractContext(text: string, keyword: string, contextLength: number): string {
    const index = text.indexOf(keyword);
    if (index === -1) return '';
    
    const start = Math.max(0, index - contextLength);
    const end = Math.min(text.length, index + keyword.length + contextLength);
    
    return text.substring(start, end);
  }
  
  private static calculateFinancialExposure(
    baseAmount: number,
    impact: number,
    probability: number,
    businessProfile?: any
  ): number {
    let exposure = baseAmount * (impact / 5) * (probability / 5);
    
    // Adjust based on business size
    if (businessProfile) {
      const revenueMultiplier = Math.min(10, (businessProfile.annualRevenue || 1000000) / 1000000);
      const employeeMultiplier = Math.min(5, (businessProfile.employeeCount || 10) / 10);
      
      exposure *= (1 + revenueMultiplier * 0.1 + employeeMultiplier * 0.05);
    }
    
    return Math.round(exposure);
  }
  
  private static generateRiskDescription(
    category: string,
    keywords: string[],
    businessProfile?: any
  ): string {
    const businessType = businessProfile?.businessType || 'business';
    const industry = businessProfile?.industry || 'organization';
    
    const descriptions = {
      'Cyber Security': `${industry} faces elevated cyber security risks due to potential ${keywords.slice(0, 3).join(', ')} exposures`,
      'Professional Liability': `Professional service risks identified including potential ${keywords.slice(0, 2).join(' and ')} claims`,
      'General Liability': `General liability exposures detected related to ${keywords.slice(0, 2).join(' and ')} incidents`,
      'Employment Practices': `Employment practices risks including ${keywords.slice(0, 2).join(' and ')} exposures`,
      'Business Interruption': `Business continuity risks that could impact operations through ${keywords.slice(0, 2).join(' or ')}`,
      'Regulatory Compliance': `Regulatory compliance gaps identified in ${keywords.slice(0, 2).join(' and ')} areas`,
      'Directors & Officers': `Management liability risks related to ${keywords.slice(0, 2).join(' and ')} decisions`,
      'Property Damage': `Property risks including potential ${keywords.slice(0, 2).join(' and ')} damage`
    };
    
    return descriptions[category as keyof typeof descriptions] || `${category} risks detected in policy analysis`;
  }
  
  private static mapScoreToLevel(score: number): 'Low' | 'Medium' | 'High' | 'Critical' | 'Rare' | 'Unlikely' | 'Possible' | 'Likely' | 'Almost Certain' {
    if (score <= 1.5) return 'Low';
    if (score <= 2.5) return 'Medium';
    if (score <= 3.5) return 'High';
    if (score <= 4.5) return 'Critical';
    return 'Critical';
  }
  
  private static buildRiskMatrix(risks: RiskFactor[]): RiskMatrixEntry[] {
    return risks.map(risk => {
      const impactScore = this.levelToScore(risk.impact);
      const probabilityScore = this.levelToScore(risk.probability);
      const riskScore = impactScore * probabilityScore;
      
      return {
        risk: risk.category,
        impact: impactScore,
        probability: probabilityScore,
        riskScore,
        position: { x: probabilityScore, y: impactScore },
        color: this.getRiskColor(riskScore)
      };
    });
  }
  
  private static levelToScore(level: string): number {
    const scoreMap = {
      'Low': 1, 'Rare': 1,
      'Medium': 2, 'Unlikely': 2,
      'High': 3, 'Possible': 3,
      'Critical': 4, 'Likely': 4,
      'Almost Certain': 5
    };
    return scoreMap[level as keyof typeof scoreMap] || 2;
  }
  
  private static getRiskColor(score: number): string {
    if (score <= 4) return '#10B981'; // Green
    if (score <= 8) return '#F59E0B'; // Yellow
    if (score <= 12) return '#F97316'; // Orange
    return '#DC2626'; // Red
  }
  
  private static generateRecommendations(
    risks: RiskFactor[],
    businessProfile?: any
  ): RiskRecommendation[] {
    const recommendations: RiskRecommendation[] = [];
    
    risks.forEach(risk => {
      const priority = this.determinePriority(risk);
      const estimatedCost = risk.mitigationCost;
      const riskReduction = this.calculateRiskReduction(risk);
      const roiScore = (risk.financialExposure * riskReduction) / estimatedCost;
      
      recommendations.push({
        priority,
        category: risk.category,
        action: this.getRecommendationAction(risk),
        estimatedCost,
        timeframe: this.getTimeframe(priority),
        riskReduction,
        roiScore
      });
    });
    
    return recommendations;
  }
  
  private static determinePriority(risk: RiskFactor): 'Immediate' | 'High' | 'Medium' | 'Low' {
    const impactScore = this.levelToScore(risk.impact);
    const probabilityScore = this.levelToScore(risk.probability);
    const combinedScore = impactScore * probabilityScore;
    
    if (combinedScore >= 16 || risk.regulatoryRisk) return 'Immediate';
    if (combinedScore >= 12) return 'High';
    if (combinedScore >= 8) return 'Medium';
    return 'Low';
  }
  
  private static getRecommendationAction(risk: RiskFactor): string {
    const actions = {
      'Cyber Security': 'Implement comprehensive cyber liability insurance and enhance cybersecurity protocols',
      'Professional Liability': 'Secure professional indemnity coverage and establish quality assurance processes',
      'General Liability': 'Obtain adequate general liability coverage and implement safety protocols',
      'Employment Practices': 'Secure EPLI coverage and enhance HR policies and training',
      'Business Interruption': 'Implement business continuity insurance and disaster recovery planning',
      'Regulatory Compliance': 'Conduct compliance audit and implement regulatory management system',
      'Directors & Officers': 'Secure D&O insurance and enhance corporate governance practices',
      'Property Damage': 'Obtain comprehensive property insurance and implement loss prevention measures'
    };
    
    return actions[risk.category as keyof typeof actions] || `Address ${risk.category} risks through appropriate coverage and risk management`;
  }
  
  private static getTimeframe(priority: string): string {
    const timeframes = {
      'Immediate': '0-30 days',
      'High': '1-3 months',
      'Medium': '3-6 months',
      'Low': '6-12 months'
    };
    
    return timeframes[priority as keyof typeof timeframes] || '3-6 months';
  }
  
  private static calculateRiskReduction(risk: RiskFactor): number {
    // Estimate risk reduction based on risk type and mitigation strategies
    const baseReduction = 0.7; // 70% base reduction with proper coverage
    
    if (risk.regulatoryRisk) return Math.min(0.9, baseReduction + 0.2);
    if (risk.businessContinuityRisk) return Math.min(0.85, baseReduction + 0.15);
    
    return baseReduction;
  }
  
  private static calculateOverallRiskScore(risks: RiskFactor[]): number {
    if (risks.length === 0) return 0;
    
    const weightedScore = risks.reduce((sum, risk) => {
      const impactScore = this.levelToScore(risk.impact);
      const probabilityScore = this.levelToScore(risk.probability);
      const weight = risk.confidence;
      
      return sum + (impactScore * probabilityScore * weight);
    }, 0);
    
    const totalWeight = risks.reduce((sum, risk) => sum + risk.confidence, 0);
    
    return Math.round((weightedScore / totalWeight) * 10) / 10;
  }
  
  private static calculateComplianceScore(risks: RiskFactor[]): number {
    const complianceRisks = risks.filter(risk => risk.regulatoryRisk);
    if (complianceRisks.length === 0) return 100;
    
    const averageRisk = complianceRisks.reduce((sum, risk) => {
      return sum + (this.levelToScore(risk.impact) * this.levelToScore(risk.probability));
    }, 0) / complianceRisks.length;
    
    return Math.max(0, Math.round(100 - (averageRisk * 4)));
  }
  
  private static calculateBusinessContinuityScore(risks: RiskFactor[]): number {
    const continuityRisks = risks.filter(risk => risk.businessContinuityRisk);
    if (continuityRisks.length === 0) return 100;
    
    const averageRisk = continuityRisks.reduce((sum, risk) => {
      return sum + (this.levelToScore(risk.impact) * this.levelToScore(risk.probability));
    }, 0) / continuityRisks.length;
    
    return Math.max(0, Math.round(100 - (averageRisk * 4)));
  }
  
  private static calculateReputationalScore(risks: RiskFactor[]): number {
    const reputationalRisks = risks.filter(risk => risk.reputationalRisk);
    if (reputationalRisks.length === 0) return 100;
    
    const averageRisk = reputationalRisks.reduce((sum, risk) => {
      return sum + (this.levelToScore(risk.impact) * this.levelToScore(risk.probability));
    }, 0) / reputationalRisks.length;
    
    return Math.max(0, Math.round(100 - (averageRisk * 4)));
  }
  
  private static determineRiskLevel(score: number): 'Low' | 'Medium' | 'High' | 'Critical' {
    if (score <= 5) return 'Low';
    if (score <= 10) return 'Medium';
    if (score <= 15) return 'High';
    return 'Critical';
  }
  
  private static prioritizeRisks(risks: RiskFactor[]): RiskFactor[] {
    return risks.sort((a, b) => {
      const scoreA = this.levelToScore(a.impact) * this.levelToScore(a.probability) * a.confidence;
      const scoreB = this.levelToScore(b.impact) * this.levelToScore(b.probability) * b.confidence;
      
      return scoreB - scoreA;
    });
  }
  
  private static prioritizeRecommendations(recommendations: RiskRecommendation[]): RiskRecommendation[] {
    const priorityOrder = { 'Immediate': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
    
    return recommendations.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return b.roiScore - a.roiScore; // Higher ROI first
    });
  }
}
