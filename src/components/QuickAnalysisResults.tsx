
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { QuickAnalysisResult } from "@/services/quickAnalysisEngine";
import { CheckCircle, AlertTriangle, AlertCircle, TrendingUp, DollarSign, Shield, Target } from "lucide-react";

interface QuickAnalysisResultsProps {
  result: QuickAnalysisResult;
}

const QuickAnalysisResults = ({ result }: QuickAnalysisResultsProps) => {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'medium': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'high': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Overall Analysis Score</CardTitle>
            <Badge className={getRiskColor(result.riskLevel)}>
              {result.riskLevel.toUpperCase()} RISK
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            {getRiskIcon(result.riskLevel)}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">{result.overallScore}/10</span>
                <span className="text-sm text-muted-foreground">
                  {result.overallScore >= 8 ? 'Excellent' : 
                   result.overallScore >= 6 ? 'Good' : 
                   result.overallScore >= 4 ? 'Fair' : 'Needs Improvement'}
                </span>
              </div>
              <Progress value={result.overallScore * 10} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Detailed Score Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Affordability</span>
              </div>
              <span className={`font-bold ${getScoreColor(result.scores.affordability)}`}>
                {result.scores.affordability}/10
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="font-medium">Coverage</span>
              </div>
              <span className={`font-bold ${getScoreColor(result.scores.coverage)}`}>
                {result.scores.coverage}/10
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Deductible</span>
              </div>
              <span className={`font-bold ${getScoreColor(result.scores.deductible)}`}>
                {result.scores.deductible}/10
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <span className="font-medium">Value</span>
              </div>
              <span className={`font-bold ${getScoreColor(result.scores.value)}`}>
                {result.scores.value}/10
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {result.insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="mt-0.5">
                  {insight.startsWith('✅') ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : insight.startsWith('⚠️') ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <p className="text-sm leading-relaxed">{insight.replace(/^[✅⚠️💡💰]\s*/, '')}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {result.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-2">
                <div className="mt-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <p className="text-sm">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Benchmarks */}
      <Card>
        <CardHeader>
          <CardTitle>Market Benchmarks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Average Premium</p>
              <p className="text-lg font-semibold">${result.benchmarks.averagePremium.toLocaleString()}/year</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Recommended Coverage</p>
              <p className="text-lg font-semibold">${result.benchmarks.recommendedCoverage.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Optimal Deductible</p>
              <p className="text-lg font-semibold">${result.benchmarks.optimalDeductible.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickAnalysisResults;
