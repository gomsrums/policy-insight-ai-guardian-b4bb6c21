import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Shield, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface RiskFactor {
  name: string;
  score: number;
  maxScore: number;
  status: 'good' | 'warning' | 'critical';
  recommendation: string;
}

interface RiskScoreResult {
  overallScore: number;
  grade: string;
  factors: RiskFactor[];
  insights: string[];
}

interface RiskScoringEngineProps {
  analysisData?: {
    gaps?: string[];
    recommendations?: string[];
    risk_assessment?: {
      overall_risk_level?: string;
      risk_factors?: string[];
    };
    coverage_analysis?: Array<{
      type: string;
      status: string;
      limit?: string;
    }>;
  };
}

export const RiskScoringEngine: React.FC<RiskScoringEngineProps> = ({ analysisData }) => {
  const [riskScore, setRiskScore] = useState<RiskScoreResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateRiskScore = () => {
    setIsCalculating(true);
    
    // Simulate calculation delay
    setTimeout(() => {
      const factors: RiskFactor[] = [];
      let totalScore = 0;
      let maxPossible = 0;

      // Coverage Completeness (25 points max)
      const coverageCount = analysisData?.coverage_analysis?.filter(c => c.status === 'Covered').length || 0;
      const totalCoverage = analysisData?.coverage_analysis?.length || 5;
      const coverageScore = Math.round((coverageCount / Math.max(totalCoverage, 1)) * 25);
      factors.push({
        name: 'Coverage Completeness',
        score: coverageScore,
        maxScore: 25,
        status: coverageScore >= 20 ? 'good' : coverageScore >= 12 ? 'warning' : 'critical',
        recommendation: coverageScore < 20 ? 'Consider adding additional coverage types to improve protection.' : 'Good coverage breadth.'
      });
      totalScore += coverageScore;
      maxPossible += 25;

      // Gap Analysis (25 points max)
      const gapsCount = analysisData?.gaps?.length || 0;
      const gapScore = Math.max(0, 25 - (gapsCount * 5));
      factors.push({
        name: 'Coverage Gaps',
        score: gapScore,
        maxScore: 25,
        status: gapScore >= 20 ? 'good' : gapScore >= 12 ? 'warning' : 'critical',
        recommendation: gapScore < 20 ? `${gapsCount} coverage gaps identified. Review and address critical gaps.` : 'Minimal coverage gaps detected.'
      });
      totalScore += gapScore;
      maxPossible += 25;

      // Risk Level Assessment (25 points max)
      const riskLevel = analysisData?.risk_assessment?.overall_risk_level?.toLowerCase() || 'medium';
      const riskLevelScore = riskLevel === 'low' ? 25 : riskLevel === 'medium' ? 15 : 5;
      factors.push({
        name: 'Overall Risk Level',
        score: riskLevelScore,
        maxScore: 25,
        status: riskLevelScore >= 20 ? 'good' : riskLevelScore >= 12 ? 'warning' : 'critical',
        recommendation: riskLevelScore < 20 ? 'Policy has elevated risk factors that need attention.' : 'Risk level is well managed.'
      });
      totalScore += riskLevelScore;
      maxPossible += 25;

      // Recommendations Addressed (25 points max)
      const recsCount = analysisData?.recommendations?.length || 0;
      const recScore = Math.max(0, 25 - (recsCount * 4));
      factors.push({
        name: 'Policy Optimization',
        score: recScore,
        maxScore: 25,
        status: recScore >= 20 ? 'good' : recScore >= 12 ? 'warning' : 'critical',
        recommendation: recScore < 20 ? `${recsCount} optimization opportunities identified.` : 'Policy is well optimized.'
      });
      totalScore += recScore;
      maxPossible += 25;

      const overallScore = Math.round((totalScore / maxPossible) * 100);
      
      const grade = overallScore >= 90 ? 'A+' : 
                   overallScore >= 80 ? 'A' :
                   overallScore >= 70 ? 'B' :
                   overallScore >= 60 ? 'C' :
                   overallScore >= 50 ? 'D' : 'F';

      const insights: string[] = [];
      if (overallScore >= 80) {
        insights.push('Your policy provides strong protection with minimal gaps.');
      } else if (overallScore >= 60) {
        insights.push('Your policy has moderate protection but could benefit from improvements.');
      } else {
        insights.push('Your policy has significant gaps that could leave you exposed to risks.');
      }

      if (gapsCount > 2) {
        insights.push(`Address the ${gapsCount} identified coverage gaps to improve your score.`);
      }

      if (riskLevel === 'high') {
        insights.push('High-risk factors detected. Consider consulting with an insurance advisor.');
      }

      setRiskScore({ overallScore, grade, factors, insights });
      setIsCalculating(false);
    }, 1500);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Automated Risk Scoring
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!riskScore ? (
          <div className="text-center py-8">
            <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Calculate a comprehensive risk score (1-100) based on your policy analysis
            </p>
            <Button onClick={calculateRiskScore} disabled={isCalculating || !analysisData}>
              {isCalculating ? 'Calculating...' : 'Calculate Risk Score'}
            </Button>
            {!analysisData && (
              <p className="text-sm text-muted-foreground mt-2">
                Upload and analyze a policy first to calculate risk score
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Overall Score */}
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <div className={`text-6xl font-bold ${getScoreColor(riskScore.overallScore)}`}>
                {riskScore.overallScore}
              </div>
              <div className="text-lg text-muted-foreground">out of 100</div>
              <Badge variant="outline" className="mt-2 text-lg px-4 py-1">
                Grade: {riskScore.grade}
              </Badge>
            </div>

            {/* Risk Factors */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Risk Factors Breakdown
              </h4>
              {riskScore.factors.map((factor, index) => (
                <div key={index} className="space-y-2 p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(factor.status)}
                      <span className="font-medium">{factor.name}</span>
                    </div>
                    <span className="text-sm font-semibold">
                      {factor.score}/{factor.maxScore}
                    </span>
                  </div>
                  <Progress value={(factor.score / factor.maxScore) * 100} className="h-2" />
                  <p className="text-sm text-muted-foreground">{factor.recommendation}</p>
                </div>
              ))}
            </div>

            {/* Insights */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Actionable Insights
              </h4>
              {riskScore.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{insight}</span>
                </div>
              ))}
            </div>

            <Button variant="outline" onClick={() => setRiskScore(null)} className="w-full">
              Recalculate Score
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
