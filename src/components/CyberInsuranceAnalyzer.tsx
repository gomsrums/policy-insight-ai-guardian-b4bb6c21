import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Shield, AlertTriangle, TrendingUp, Users, Database, Lock, Zap, FileText, Download } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface PlatformProfile {
  platformType: string;
  userBase: number;
  revenue: string;
  dataTypes: string[];
  geography: string[];
  complianceReqs: string[];
  techStack: string[];
}

interface RiskAssessment {
  category: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  score: number;
  factors: string[];
  recommendations: string[];
  estimatedLoss: number;
}

interface CoverageGap {
  area: string;
  currentCoverage: number;
  recommendedCoverage: number;
  gap: number;
  priority: 'Low' | 'Medium' | 'High';
  annualCost: number;
}

interface AnalysisResult {
  overallRiskScore: number;
  riskLevel: string;
  assessments: RiskAssessment[];
  coverageGaps: CoverageGap[];
  premiumEstimate: {
    current: number;
    recommended: number;
    savings: number;
  };
  complianceScore: number;
}

const CyberInsuranceAnalyzer = () => {
  const [profile, setProfile] = useState<PlatformProfile>({
    platformType: '',
    userBase: 0,
    revenue: '',
    dataTypes: [],
    geography: [],
    complianceReqs: [],
    techStack: []
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const platformTypes = [
    'E-commerce', 'SaaS Platform', 'Social Media', 'FinTech', 
    'Healthcare Platform', 'Educational Platform', 'Marketplace', 'Other'
  ];

  const dataTypeOptions = [
    'Personal Data (PII)', 'Payment Information', 'Health Records', 
    'Financial Data', 'Biometric Data', 'Location Data', 'Behavioral Data'
  ];

  const complianceOptions = [
    'GDPR', 'CCPA', 'HIPAA', 'PCI DSS', 'SOX', 'FERPA', 'ISO 27001'
  ];

  const techStackOptions = [
    'Cloud Infrastructure', 'Microservices', 'APIs', 'Mobile Apps',
    'IoT Devices', 'AI/ML Systems', 'Blockchain', 'Third-party Integrations'
  ];

  const handleAnalyze = async () => {
    if (!profile.platformType || !profile.userBase) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in the required platform details.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate analysis with realistic cyber insurance calculations
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const result = performCyberRiskAnalysis(profile);
    setAnalysisResult(result);
    setIsAnalyzing(false);
    
    toast({
      title: "Analysis Complete",
      description: "Your cyber insurance risk assessment is ready.",
    });
  };

  const performCyberRiskAnalysis = (profile: PlatformProfile): AnalysisResult => {
    // Risk scoring based on platform characteristics
    const userBaseRisk = calculateUserBaseRisk(profile.userBase);
    const dataTypeRisk = calculateDataTypeRisk(profile.dataTypes);
    const complianceRisk = calculateComplianceRisk(profile.complianceReqs);
    const platformRisk = calculatePlatformRisk(profile.platformType);
    
    const overallRiskScore = Math.round((userBaseRisk + dataTypeRisk + complianceRisk + platformRisk) / 4);
    
    const assessments: RiskAssessment[] = [
      {
        category: 'Data Breach Risk',
        riskLevel: getDataBreachRisk(profile),
        score: dataTypeRisk,
        factors: getDataBreachFactors(profile),
        recommendations: getDataBreachRecommendations(profile),
        estimatedLoss: calculateDataBreachLoss(profile)
      },
      {
        category: 'Business Interruption',
        riskLevel: getBusinessInterruptionRisk(profile),
        score: platformRisk,
        factors: getBusinessInterruptionFactors(profile),
        recommendations: getBusinessInterruptionRecommendations(profile),
        estimatedLoss: calculateBusinessInterruptionLoss(profile)
      },
      {
        category: 'Regulatory Compliance',
        riskLevel: getComplianceRiskLevel(complianceRisk),
        score: complianceRisk,
        factors: getComplianceFactors(profile),
        recommendations: getComplianceRecommendations(profile),
        estimatedLoss: calculateComplianceLoss(profile)
      },
      {
        category: 'Third-Party Liability',
        riskLevel: getThirdPartyRisk(profile),
        score: userBaseRisk,
        factors: getThirdPartyFactors(profile),
        recommendations: getThirdPartyRecommendations(profile),
        estimatedLoss: calculateThirdPartyLoss(profile)
      }
    ];

    const coverageGaps: CoverageGap[] = generateCoverageGaps(profile, assessments);
    
    const premiumEstimate = calculatePremiumEstimate(profile, assessments);
    
    return {
      overallRiskScore,
      riskLevel: getRiskLevel(overallRiskScore),
      assessments,
      coverageGaps,
      premiumEstimate,
      complianceScore: 100 - complianceRisk
    };
  };

  // Risk calculation functions
  const calculateUserBaseRisk = (userBase: number): number => {
    if (userBase < 1000) return 20;
    if (userBase < 10000) return 35;
    if (userBase < 100000) return 50;
    if (userBase < 1000000) return 70;
    return 85;
  };

  const calculateDataTypeRisk = (dataTypes: string[]): number => {
    const riskScores: { [key: string]: number } = {
      'Personal Data (PII)': 15,
      'Payment Information': 25,
      'Health Records': 30,
      'Financial Data': 25,
      'Biometric Data': 35,
      'Location Data': 10,
      'Behavioral Data': 10
    };
    
    return Math.min(dataTypes.reduce((sum, type) => sum + (riskScores[type] || 0), 0), 100);
  };

  const calculateComplianceRisk = (complianceReqs: string[]): number => {
    const complexityScores: { [key: string]: number } = {
      'GDPR': 20,
      'CCPA': 15,
      'HIPAA': 25,
      'PCI DSS': 20,
      'SOX': 30,
      'FERPA': 15,
      'ISO 27001': 10
    };
    
    const totalComplexity = complianceReqs.reduce((sum, req) => sum + (complexityScores[req] || 0), 0);
    return Math.min(totalComplexity, 100);
  };

  const calculatePlatformRisk = (platformType: string): number => {
    const platformRisks: { [key: string]: number } = {
      'FinTech': 80,
      'Healthcare Platform': 75,
      'E-commerce': 65,
      'Social Media': 60,
      'SaaS Platform': 55,
      'Educational Platform': 45,
      'Marketplace': 70,
      'Other': 50
    };
    
    return platformRisks[platformType] || 50;
  };

  // Risk level determination functions
  const getDataBreachRisk = (profile: PlatformProfile): 'Low' | 'Medium' | 'High' | 'Critical' => {
    const sensitiveData = profile.dataTypes.some(type => 
      ['Payment Information', 'Health Records', 'Biometric Data'].includes(type)
    );
    if (sensitiveData && profile.userBase > 100000) return 'Critical';
    if (sensitiveData || profile.userBase > 50000) return 'High';
    if (profile.userBase > 10000) return 'Medium';
    return 'Low';
  };

  const getBusinessInterruptionRisk = (profile: PlatformProfile): 'Low' | 'Medium' | 'High' | 'Critical' => {
    const highAvailabilityNeeded = ['FinTech', 'E-commerce', 'Healthcare Platform'].includes(profile.platformType);
    if (highAvailabilityNeeded && profile.userBase > 100000) return 'Critical';
    if (highAvailabilityNeeded || profile.userBase > 50000) return 'High';
    return 'Medium';
  };

  const getComplianceRiskLevel = (score: number): 'Low' | 'Medium' | 'High' | 'Critical' => {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  };

  const getThirdPartyRisk = (profile: PlatformProfile): 'Low' | 'Medium' | 'High' | 'Critical' => {
    if (profile.userBase > 500000) return 'Critical';
    if (profile.userBase > 100000) return 'High';
    if (profile.userBase > 10000) return 'Medium';
    return 'Low';
  };

  // Factor and recommendation functions
  const getDataBreachFactors = (profile: PlatformProfile): string[] => {
    const factors = [];
    if (profile.dataTypes.includes('Payment Information')) factors.push('Stores payment card data');
    if (profile.dataTypes.includes('Health Records')) factors.push('Handles sensitive health information');
    if (profile.dataTypes.includes('Personal Data (PII)')) factors.push('Large volume of personal data');
    if (profile.userBase > 100000) factors.push('High user base increases attack surface');
    return factors;
  };

  const getDataBreachRecommendations = (profile: PlatformProfile): string[] => {
    const recommendations = [];
    if (profile.dataTypes.includes('Payment Information')) {
      recommendations.push('Implement PCI DSS compliance measures');
      recommendations.push('Use tokenization for payment data');
    }
    if (profile.dataTypes.includes('Health Records')) {
      recommendations.push('Ensure HIPAA compliance');
      recommendations.push('Implement end-to-end encryption');
    }
    recommendations.push('Deploy advanced threat detection');
    recommendations.push('Conduct regular penetration testing');
    return recommendations;
  };

  const getBusinessInterruptionFactors = (profile: PlatformProfile): string[] => {
    const factors = [];
    if (['FinTech', 'E-commerce'].includes(profile.platformType)) factors.push('High-availability requirements');
    if (profile.userBase > 100000) factors.push('Large user base dependent on services');
    if (profile.techStack.includes('Cloud Infrastructure')) factors.push('Cloud dependency risks');
    factors.push('Revenue loss during downtime');
    return factors;
  };

  const getBusinessInterruptionRecommendations = (profile: PlatformProfile): string[] => {
    const recommendations = [];
    recommendations.push('Implement redundant systems and failover capabilities');
    recommendations.push('Develop comprehensive incident response plan');
    if (profile.platformType === 'E-commerce') recommendations.push('Maintain backup payment processing systems');
    if (profile.userBase > 50000) recommendations.push('Deploy DDoS protection services');
    recommendations.push('Regular disaster recovery testing');
    return recommendations;
  };

  const getComplianceFactors = (profile: PlatformProfile): string[] => {
    const factors = [];
    if (profile.complianceReqs.includes('GDPR')) factors.push('EU data protection requirements');
    if (profile.complianceReqs.includes('HIPAA')) factors.push('Healthcare data protection obligations');
    if (profile.complianceReqs.includes('PCI DSS')) factors.push('Payment card industry compliance');
    if (profile.complianceReqs.length > 2) factors.push('Multiple regulatory jurisdictions');
    return factors;
  };

  const getComplianceRecommendations = (profile: PlatformProfile): string[] => {
    const recommendations = [];
    if (profile.complianceReqs.includes('GDPR')) {
      recommendations.push('Implement data subject rights management');
      recommendations.push('Conduct privacy impact assessments');
    }
    if (profile.complianceReqs.includes('HIPAA')) {
      recommendations.push('Ensure business associate agreements');
      recommendations.push('Implement audit logging for PHI access');
    }
    if (profile.complianceReqs.includes('PCI DSS')) {
      recommendations.push('Maintain PCI DSS certification');
      recommendations.push('Regular security assessments');
    }
    recommendations.push('Legal compliance monitoring and updates');
    return recommendations;
  };

  const getThirdPartyFactors = (profile: PlatformProfile): string[] => {
    const factors = [];
    if (profile.userBase > 100000) factors.push('Large user base increases liability exposure');
    if (profile.dataTypes.includes('Personal Data (PII)')) factors.push('Personal data breach liability');
    if (profile.platformType === 'Marketplace') factors.push('Multi-party transaction risks');
    factors.push('Customer trust and reputation impact');
    return factors;
  };

  const getThirdPartyRecommendations = (profile: PlatformProfile): string[] => {
    const recommendations = [];
    recommendations.push('Review and update terms of service regularly');
    recommendations.push('Implement user consent management');
    if (profile.userBase > 50000) recommendations.push('Consider cyber liability insurance for third-party claims');
    recommendations.push('Establish clear data breach notification procedures');
    recommendations.push('Legal review of data handling practices');
    return recommendations;
  };

  // Loss calculation functions
  const calculateDataBreachLoss = (profile: PlatformProfile): number => {
    const basePerRecord = profile.dataTypes.includes('Health Records') ? 408 : 
                         profile.dataTypes.includes('Payment Information') ? 180 : 150;
    return Math.round(profile.userBase * basePerRecord * 0.05); // Assuming 5% breach rate
  };

  const calculateBusinessInterruptionLoss = (profile: PlatformProfile): number => {
    const revenueMultipliers: { [key: string]: number } = {
      'Under $1M': 50000,
      '$1M-$10M': 200000,
      '$10M-$100M': 1000000,
      'Over $100M': 5000000
    };
    
    return (revenueMultipliers[profile.revenue] || 100000) * 0.1; // 10% of annual revenue
  };

  const calculateComplianceLoss = (profile: PlatformProfile): number => {
    if (profile.complianceReqs.includes('GDPR')) return 500000;
    if (profile.complianceReqs.includes('HIPAA')) return 300000;
    if (profile.complianceReqs.includes('PCI DSS')) return 200000;
    return 100000;
  };

  const calculateThirdPartyLoss = (profile: PlatformProfile): number => {
    return Math.round(profile.userBase * 50); // $50 per affected user
  };

  // Coverage gap generation
  const generateCoverageGaps = (profile: PlatformProfile, assessments: RiskAssessment[]): CoverageGap[] => {
    const gaps: CoverageGap[] = [
      {
        area: 'Cyber Liability Coverage',
        currentCoverage: 1000000,
        recommendedCoverage: assessments[0].estimatedLoss * 2,
        gap: Math.max(0, (assessments[0].estimatedLoss * 2) - 1000000),
        priority: 'High',
        annualCost: 15000
      },
      {
        area: 'Business Interruption',
        currentCoverage: 500000,
        recommendedCoverage: assessments[1].estimatedLoss,
        gap: Math.max(0, assessments[1].estimatedLoss - 500000),
        priority: 'High',
        annualCost: 12000
      },
      {
        area: 'Regulatory Fines',
        currentCoverage: 0,
        recommendedCoverage: assessments[2].estimatedLoss,
        gap: assessments[2].estimatedLoss,
        priority: 'Medium',
        annualCost: 8000
      },
      {
        area: 'Third-Party Claims',
        currentCoverage: 2000000,
        recommendedCoverage: assessments[3].estimatedLoss,
        gap: Math.max(0, assessments[3].estimatedLoss - 2000000),
        priority: 'Medium',
        annualCost: 10000
      }
    ];

    return gaps.filter(gap => gap.gap > 0);
  };

  // Premium calculation
  const calculatePremiumEstimate = (profile: PlatformProfile, assessments: RiskAssessment[]) => {
    const basePremium = 25000;
    const riskMultiplier = assessments.reduce((sum, assessment) => sum + assessment.score, 0) / 100;
    const userBaseMultiplier = Math.log10(profile.userBase + 1) / 4;
    
    const current = Math.round(basePremium * riskMultiplier * userBaseMultiplier);
    const recommended = Math.round(current * 1.4); // 40% increase for better coverage
    
    return {
      current,
      recommended,
      savings: Math.round(recommended * 0.15) // Potential 15% savings with improvements
    };
  };

  const getRiskLevel = (score: number): string => {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Critical': return '#ef4444';
      case 'High': return '#f97316';
      case 'Medium': return '#eab308';
      case 'Low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const downloadReport = () => {
    if (!analysisResult) return;
    
    const reportContent = generateReportContent(profile, analysisResult);
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cyber-insurance-analysis-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateReportContent = (profile: PlatformProfile, result: AnalysisResult): string => {
    return `CYBER INSURANCE RISK ANALYSIS REPORT
Generated: ${new Date().toLocaleString()}

PLATFORM PROFILE:
Platform Type: ${profile.platformType}
User Base: ${profile.userBase.toLocaleString()}
Revenue: ${profile.revenue}
Data Types: ${profile.dataTypes.join(', ')}
Compliance Requirements: ${profile.complianceReqs.join(', ')}

RISK ASSESSMENT:
Overall Risk Score: ${result.overallRiskScore}/100 (${result.riskLevel})
Compliance Score: ${result.complianceScore}/100

DETAILED RISK ANALYSIS:
${result.assessments.map(assessment => `
${assessment.category}:
- Risk Level: ${assessment.riskLevel}
- Score: ${assessment.score}/100
- Estimated Loss: $${assessment.estimatedLoss.toLocaleString()}
- Key Factors: ${assessment.factors.join('; ')}
- Recommendations: ${assessment.recommendations.join('; ')}
`).join('')}

COVERAGE GAPS:
${result.coverageGaps.map(gap => `
${gap.area}:
- Current Coverage: $${gap.currentCoverage.toLocaleString()}
- Recommended Coverage: $${gap.recommendedCoverage.toLocaleString()}
- Gap: $${gap.gap.toLocaleString()}
- Priority: ${gap.priority}
- Annual Cost: $${gap.annualCost.toLocaleString()}
`).join('')}

PREMIUM ESTIMATE:
- Current Estimated Premium: $${result.premiumEstimate.current.toLocaleString()}
- Recommended Premium: $${result.premiumEstimate.recommended.toLocaleString()}
- Potential Savings: $${result.premiumEstimate.savings.toLocaleString()}
`;
  };

  // Chart data preparation
  const riskChartData = analysisResult?.assessments.map(assessment => ({
    name: assessment.category,
    score: assessment.score,
    estimatedLoss: assessment.estimatedLoss / 1000 // Convert to thousands
  })) || [];

  const coverageChartData = analysisResult?.coverageGaps.map(gap => ({
    name: gap.area,
    current: gap.currentCoverage / 1000000, // Convert to millions
    recommended: gap.recommendedCoverage / 1000000,
    gap: gap.gap / 1000000
  })) || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Cyber Insurance Risk Analyzer for Online Platforms
          </CardTitle>
          <CardDescription>
            Comprehensive risk assessment and coverage analysis tailored for digital platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Platform Profile Form */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Platform Profile</h3>
              
              <div className="space-y-2">
                <Label htmlFor="platformType">Platform Type *</Label>
                <Select value={profile.platformType} onValueChange={(value) => setProfile({...profile, platformType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform type" />
                  </SelectTrigger>
                  <SelectContent>
                    {platformTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userBase">User Base *</Label>
                <Input
                  id="userBase"
                  type="number"
                  value={profile.userBase || ''}
                  onChange={(e) => setProfile({...profile, userBase: parseInt(e.target.value) || 0})}
                  placeholder="Number of active users"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="revenue">Annual Revenue</Label>
                <Select value={profile.revenue} onValueChange={(value) => setProfile({...profile, revenue: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select revenue range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Under $1M">Under $1M</SelectItem>
                    <SelectItem value="$1M-$10M">$1M-$10M</SelectItem>
                    <SelectItem value="$10M-$100M">$10M-$100M</SelectItem>
                    <SelectItem value="Over $100M">Over $100M</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Data & Compliance */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Data & Compliance</h3>
              
              <div className="space-y-2">
                <Label>Data Types Handled</Label>
                <div className="grid grid-cols-1 gap-2">
                  {dataTypeOptions.map(dataType => (
                    <label key={dataType} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={profile.dataTypes.includes(dataType)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProfile({...profile, dataTypes: [...profile.dataTypes, dataType]});
                          } else {
                            setProfile({...profile, dataTypes: profile.dataTypes.filter(t => t !== dataType)});
                          }
                        }}
                      />
                      <span>{dataType}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Compliance Requirements</Label>
                <div className="grid grid-cols-1 gap-2">
                  {complianceOptions.map(compliance => (
                    <label key={compliance} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={profile.complianceReqs.includes(compliance)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProfile({...profile, complianceReqs: [...profile.complianceReqs, compliance]});
                          } else {
                            setProfile({...profile, complianceReqs: profile.complianceReqs.filter(c => c !== compliance)});
                          }
                        }}
                      />
                      <span>{compliance}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full">
              {isAnalyzing ? (
                <>
                  <Zap className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Cyber Risks...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Analyze Cyber Insurance Risks
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {analysisResult && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Risk Analysis Results</CardTitle>
              <Button variant="outline" onClick={downloadReport}>
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
                <TabsTrigger value="gaps">Coverage Gaps</TabsTrigger>
                <TabsTrigger value="visuals">Visual Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold" style={{color: getRiskColor(analysisResult.riskLevel)}}>
                          {analysisResult.overallRiskScore}
                        </div>
                        <div className="text-sm text-muted-foreground">Overall Risk Score</div>
                        <Badge variant="outline" style={{borderColor: getRiskColor(analysisResult.riskLevel)}}>
                          {analysisResult.riskLevel} Risk
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {analysisResult.complianceScore}%
                        </div>
                        <div className="text-sm text-muted-foreground">Compliance Score</div>
                        <Progress value={analysisResult.complianceScore} className="mt-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          ${analysisResult.premiumEstimate.recommended.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Recommended Premium</div>
                        <div className="text-xs text-green-600 mt-1">
                          Potential savings: ${analysisResult.premiumEstimate.savings.toLocaleString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Based on your platform profile, we've identified {analysisResult.coverageGaps.length} critical coverage gaps 
                    that require immediate attention to protect your business from cyber threats.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="risks" className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Risk Category</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Estimated Loss</TableHead>
                      <TableHead>Key Factors</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysisResult.assessments.map((assessment, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{assessment.category}</TableCell>
                        <TableCell>
                          <Badge variant="outline" style={{borderColor: getRiskColor(assessment.riskLevel)}}>
                            {assessment.riskLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>{assessment.score}/100</TableCell>
                        <TableCell>${assessment.estimatedLoss.toLocaleString()}</TableCell>
                        <TableCell className="max-w-xs">
                          <ul className="text-sm space-y-1">
                            {assessment.factors.slice(0, 2).map((factor, i) => (
                              <li key={i}>• {factor}</li>
                            ))}
                          </ul>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Recommendations</h4>
                  {analysisResult.assessments.map((assessment, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <h5 className="font-medium mb-2">{assessment.category}</h5>
                        <ul className="space-y-1">
                          {assessment.recommendations.map((rec, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <span className="text-primary">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="gaps" className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Coverage Area</TableHead>
                      <TableHead>Current</TableHead>
                      <TableHead>Recommended</TableHead>
                      <TableHead>Gap</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Annual Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysisResult.coverageGaps.map((gap, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{gap.area}</TableCell>
                        <TableCell>${gap.currentCoverage.toLocaleString()}</TableCell>
                        <TableCell>${gap.recommendedCoverage.toLocaleString()}</TableCell>
                        <TableCell className="text-red-600">${gap.gap.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={gap.priority === 'High' ? 'destructive' : 'secondary'}>
                            {gap.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>${gap.annualCost.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-2">Total Coverage Gap</h4>
                      <div className="text-2xl font-bold text-red-600">
                        ${analysisResult.coverageGaps.reduce((sum, gap) => sum + gap.gap, 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Additional coverage needed
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-2">Total Annual Cost</h4>
                      <div className="text-2xl font-bold text-blue-600">
                        ${analysisResult.coverageGaps.reduce((sum, gap) => sum + gap.annualCost, 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        To close all gaps
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="visuals" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Risk Scores by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={riskChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" fontSize={12} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="score" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Coverage Gaps Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={coverageChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" fontSize={12} />
                          <YAxis />
                          <Tooltip formatter={(value) => [`$${value}M`, '']} />
                          <Legend />
                          <Bar dataKey="current" fill="#22c55e" name="Current Coverage" />
                          <Bar dataKey="recommended" fill="#3b82f6" name="Recommended" />
                          <Bar dataKey="gap" fill="#ef4444" name="Gap" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Overall Risk Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Overall Risk Level</span>
                        <Badge variant="outline" style={{borderColor: getRiskColor(analysisResult.riskLevel)}}>
                          {analysisResult.riskLevel}
                        </Badge>
                      </div>
                      <Progress 
                        value={analysisResult.overallRiskScore} 
                        className="h-4"
                      />
                      <div className="text-sm text-muted-foreground">
                        Risk Score: {analysisResult.overallRiskScore}/100
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CyberInsuranceAnalyzer;