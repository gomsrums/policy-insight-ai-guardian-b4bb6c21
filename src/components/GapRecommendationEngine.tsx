import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Lightbulb, Target, TrendingUp, AlertCircle, CheckCircle, DollarSign, Calendar } from 'lucide-react';
import { AnalysisResult } from "@/lib/chatpdf-types";

interface CoverageGap {
  id: string;
  type: 'missing' | 'insufficient' | 'outdated';
  category: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  financialImpact: string;
  recommendation: string;
  estimatedCost: string;
  priority: number;
  timeframe: string;
  alternatives?: string[];
}

interface PersonalizedRecommendation {
  title: string;
  description: string;
  action: string;
  benefit: string;
  cost: string;
  urgency: 'Immediate' | 'Short-term' | 'Long-term';
  category: 'Essential' | 'Recommended' | 'Optional';
}

interface GapAnalysisData {
  totalGaps: number;
  criticalGaps: number;
  completenessScore: number;
  potentialSavings: string;
  gaps: CoverageGap[];
  recommendations: PersonalizedRecommendation[];
  industryBenchmarks: {
    category: string;
    yourCoverage: number;
    industryAverage: number;
    recommendation: string;
  }[];
}

interface GapRecommendationEngineProps {
  analysis: AnalysisResult;
  userProfile?: {
    businessType?: string;
    industry?: string;
    location?: string;
    size?: string;
  };
}

const GapRecommendationEngine = ({ analysis, userProfile }: GapRecommendationEngineProps) => {
  const [gapData, setGapData] = useState<GapAnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  useEffect(() => {
    if (analysis?.summary) {
      performGapAnalysis();
    }
  }, [analysis, userProfile]);

  const performGapAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      console.log('Starting gap identification and recommendation analysis...');
      
      // Simulate comprehensive gap analysis
      const mockGapData: GapAnalysisData = {
        totalGaps: 8,
        criticalGaps: 2,
        completenessScore: 72,
        potentialSavings: '£2,500/year',
        gaps: [
          {
            id: '1',
            type: 'missing',
            category: 'Cyber Security',
            description: 'No cyber liability coverage detected',
            severity: 'Critical',
            financialImpact: '£50K-500K potential loss',
            recommendation: 'Add comprehensive cyber liability insurance',
            estimatedCost: '£800-1,200/year',
            priority: 1,
            timeframe: 'Immediate',
            alternatives: ['Basic cyber coverage', 'Extended cyber protection']
          },
          {
            id: '2',
            type: 'insufficient',
            category: 'Professional Indemnity',
            description: 'Current £100K limit may be insufficient',
            severity: 'High',
            financialImpact: '£100K+ potential shortfall',
            recommendation: 'Increase coverage to £500K minimum',
            estimatedCost: '£200-400/year additional',
            priority: 2,
            timeframe: 'Short-term',
            alternatives: ['£250K coverage', '£1M coverage']
          },
          {
            id: '3',
            type: 'missing',
            category: 'Employment Practices',
            description: 'No employment practices liability coverage',
            severity: 'Medium',
            financialImpact: '£25K-100K potential claims',
            recommendation: 'Add employment practices liability',
            estimatedCost: '£300-600/year',
            priority: 3,
            timeframe: 'Medium-term'
          },
          {
            id: '4',
            type: 'outdated',
            category: 'Equipment Coverage',
            description: 'Equipment values may be underinsured',
            severity: 'Medium',
            financialImpact: '£10K-50K potential shortfall',
            recommendation: 'Update equipment valuations',
            estimatedCost: '£100-200/year',
            priority: 4,
            timeframe: 'Medium-term'
          }
        ],
        recommendations: [
          {
            title: 'Cyber Security Package',
            description: 'Essential protection against cyber threats and data breaches',
            action: 'Add comprehensive cyber liability coverage',
            benefit: 'Protection against ransomware, data breaches, and cyber attacks',
            cost: '£1,000/year',
            urgency: 'Immediate',
            category: 'Essential'
          },
          {
            title: 'Professional Indemnity Upgrade',
            description: 'Increase coverage limits to match business growth',
            action: 'Upgrade from £100K to £500K coverage',
            benefit: 'Adequate protection for client claims and professional errors',
            cost: '£300/year',
            urgency: 'Short-term',
            category: 'Recommended'
          },
          {
            title: 'Business Continuity Review',
            description: 'Ensure business interruption coverage is adequate',
            action: 'Review and update business interruption limits',
            benefit: 'Protection against lost income during disruptions',
            cost: '£150/year',
            urgency: 'Long-term',
            category: 'Recommended'
          }
        ],
        industryBenchmarks: [
          {
            category: 'Public Liability',
            yourCoverage: 2000000,
            industryAverage: 2000000,
            recommendation: 'Coverage meets industry standard'
          },
          {
            category: 'Professional Indemnity',
            yourCoverage: 100000,
            industryAverage: 500000,
            recommendation: 'Consider increasing to industry average'
          },
          {
            category: 'Cyber Liability',
            yourCoverage: 0,
            industryAverage: 1000000,
            recommendation: 'Critical gap - add cyber coverage immediately'
          }
        ]
      };
      
      setGapData(mockGapData);
    } catch (err) {
      console.error('Gap analysis failed:', err);
      setError('Failed to analyze coverage gaps. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'Immediate': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'Short-term': return <TrendingUp className="h-4 w-4 text-orange-600" />;
      case 'Long-term': return <Calendar className="h-4 w-4 text-blue-600" />;
      default: return null;
    }
  };

  const filteredGaps = gapData?.gaps.filter(gap => 
    selectedPriority === 'all' || gap.severity.toLowerCase() === selectedPriority
  ) || [];

  if (isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Gap Identification & Recommendations
          </CardTitle>
          <CardDescription>Analyzing coverage gaps and generating personalized recommendations...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Identifying gaps and generating recommendations...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Analysis Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!gapData) return null;

  return (
    <div className="space-y-6">
      {/* Overview Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {gapData.completenessScore}%
              </div>
              <p className="text-sm text-muted-foreground">Coverage Completeness</p>
              <Progress value={gapData.completenessScore} className="mt-2" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {gapData.criticalGaps}
              </div>
              <p className="text-sm text-muted-foreground">Critical Gaps</p>
              <Badge variant="destructive" className="mt-2">Urgent Action</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {gapData.totalGaps}
              </div>
              <p className="text-sm text-muted-foreground">Total Gaps</p>
              <Badge variant="secondary" className="mt-2">Review Needed</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-xl font-bold text-green-600 mb-2">
                {gapData.potentialSavings}
              </div>
              <p className="text-sm text-muted-foreground">Potential Annual Savings</p>
              <Badge variant="default" className="mt-2">Optimize</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="gaps" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gaps">Coverage Gaps</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="benchmarks">Industry Benchmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="gaps">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Identified Coverage Gaps
              </CardTitle>
              <CardDescription>
                Gaps in your current coverage with prioritized recommendations
              </CardDescription>
              <div className="flex gap-2 mt-4">
                <Button 
                  variant={selectedPriority === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPriority('all')}
                >
                  All ({gapData.totalGaps})
                </Button>
                <Button 
                  variant={selectedPriority === 'critical' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPriority('critical')}
                >
                  Critical ({gapData.criticalGaps})
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredGaps.map((gap) => (
                  <div key={gap.id} className={`p-4 border rounded-lg ${getSeverityColor(gap.severity)}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{gap.category}</h4>
                        <Badge variant={gap.severity === 'Critical' ? 'destructive' : 
                                      gap.severity === 'High' ? 'secondary' : 'default'}>
                          {gap.severity} Priority
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {gap.type.charAt(0).toUpperCase() + gap.type.slice(1)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm mb-3">{gap.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Financial Impact:</span> {gap.financialImpact}
                      </div>
                      <div>
                        <span className="font-medium">Estimated Cost:</span> {gap.estimatedCost}
                      </div>
                      <div>
                        <span className="font-medium">Timeframe:</span> {gap.timeframe}
                      </div>
                      <div>
                        <span className="font-medium">Priority:</span> #{gap.priority}
                      </div>
                    </div>
                    
                    <div className="mt-3 p-3 bg-background rounded border">
                      <h5 className="font-medium text-green-700 mb-1">Recommendation:</h5>
                      <p className="text-sm">{gap.recommendation}</p>
                      {gap.alternatives && (
                        <div className="mt-2">
                          <span className="text-xs font-medium">Alternatives: </span>
                          <span className="text-xs">{gap.alternatives.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Personalized Recommendations
              </CardTitle>
              <CardDescription>
                Tailored insurance recommendations based on your profile and gaps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gapData.recommendations.map((rec, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getUrgencyIcon(rec.urgency)}
                        <h4 className="font-semibold">{rec.title}</h4>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={rec.category === 'Essential' ? 'destructive' : 
                                      rec.category === 'Recommended' ? 'secondary' : 'outline'}>
                          {rec.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {rec.urgency}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Action:</span> {rec.action}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span className="font-medium">Cost:</span> {rec.cost}
                      </div>
                    </div>
                    
                    <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                      <h5 className="font-medium text-green-700 mb-1">Benefit:</h5>
                      <p className="text-sm text-green-700">{rec.benefit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Industry Benchmarks
              </CardTitle>
              <CardDescription>
                Compare your coverage against industry standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gapData.industryBenchmarks.map((benchmark, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{benchmark.category}</h4>
                      {benchmark.yourCoverage >= benchmark.industryAverage ? 
                        <CheckCircle className="h-5 w-5 text-green-600" /> :
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      }
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Your Coverage</p>
                        <p className="font-medium">
                          {benchmark.yourCoverage === 0 ? 'Not Covered' : `£${benchmark.yourCoverage.toLocaleString()}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Industry Average</p>
                        <p className="font-medium">£{benchmark.industryAverage.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div 
                        className={`h-2 rounded-full ${
                          benchmark.yourCoverage >= benchmark.industryAverage ? 'bg-green-600' : 'bg-red-600'
                        }`}
                        style={{ 
                          width: `${Math.min((benchmark.yourCoverage / benchmark.industryAverage) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{benchmark.recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GapRecommendationEngine;