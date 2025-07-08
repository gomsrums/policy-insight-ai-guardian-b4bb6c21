import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, AlertCircle, TrendingUp, DollarSign, Shield, Target, Crown } from "lucide-react";
import { ComparisonData } from "./SimpleComparisonForm";

interface PolicyComparison {
  policy1: {
    scores: {
      overall: number;
      affordability: number;
      coverage: number;
      deductible: number;
      value: number;
    };
    strengths: string[];
    weaknesses: string[];
    riskLevel: 'low' | 'medium' | 'high';
  };
  policy2: {
    scores: {
      overall: number;
      affordability: number;
      coverage: number;
      deductible: number;
      value: number;
    };
    strengths: string[];
    weaknesses: string[];
    riskLevel: 'low' | 'medium' | 'high';
  };
  winner: 1 | 2 | 'tie';
  summary: string;
  recommendations: string[];
}

interface SimpleComparisonResultsProps {
  comparison: PolicyComparison;
  originalData: ComparisonData;
}

const SimpleComparisonResults = ({ comparison, originalData }: SimpleComparisonResultsProps) => {
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
      case 'low': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'high': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCurrencyInfo = (country: string) => {
    const currencyMap: Record<string, { symbol: string; code: string }> = {
      US: { symbol: '$', code: 'USD' },
      UK: { symbol: '£', code: 'GBP' },
      CA: { symbol: 'C$', code: 'CAD' },
      AU: { symbol: 'A$', code: 'AUD' },
      DE: { symbol: '€', code: 'EUR' },
      FR: { symbol: '€', code: 'EUR' },
      IN: { symbol: '₹', code: 'INR' },
      JP: { symbol: '¥', code: 'JPY' },
      SG: { symbol: 'S$', code: 'SGD' }
    };
    
    return currencyMap[country] || currencyMap.US;
  };

  const formatCurrency = (amount: number, country: string) => {
    const { symbol } = getCurrencyInfo(country);
    return `${symbol}${amount.toLocaleString()}`;
  };

  const isWinner = (policyNumber: 1 | 2) => {
    return comparison.winner === policyNumber;
  };

  return (
    <div className="space-y-6">
      {/* Winner Announcement */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl text-center flex items-center justify-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            Comparison Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2">
            {comparison.winner === 'tie' ? (
              <p className="text-lg font-semibold">It's a tie! Both policies have similar value propositions.</p>
            ) : (
              <p className="text-lg font-semibold">
                {comparison.winner === 1 ? originalData.policy1.provider : originalData.policy2.provider} 
                {' '}offers the better overall value.
              </p>
            )}
            <p className="text-muted-foreground">{comparison.summary}</p>
          </div>
        </CardContent>
      </Card>

      {/* Side by Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Policy 1 */}
        <Card className={`${isWinner(1) ? 'ring-2 ring-primary' : ''}`}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                {isWinner(1) && <Crown className="h-5 w-5 text-yellow-500" />}
                {originalData.policy1.provider}
              </CardTitle>
              <Badge className={getRiskColor(comparison.policy1.riskLevel)}>
                {comparison.policy1.riskLevel.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall Score */}
            <div className="flex items-center gap-4">
              {getRiskIcon(comparison.policy1.riskLevel)}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xl font-bold">{comparison.policy1.scores.overall}/10</span>
                  <span className="text-sm text-muted-foreground">Overall Score</span>
                </div>
                <Progress value={comparison.policy1.scores.overall * 10} className="h-2" />
              </div>
            </div>

            {/* Policy Details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Monthly Premium:</span>
                <span className="font-medium">{formatCurrency(originalData.policy1.monthlyPremium, originalData.country)}</span>
              </div>
              <div className="flex justify-between">
                <span>Coverage Amount:</span>
                <span className="font-medium">{formatCurrency(originalData.policy1.coverageAmount, originalData.country)}</span>
              </div>
              <div className="flex justify-between">
                <span>Deductible:</span>
                <span className="font-medium">{formatCurrency(originalData.policy1.deductible, originalData.country)}</span>
              </div>
            </div>

            {/* Detailed Scores */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between p-2 bg-muted/50 rounded">
                <span>Affordability:</span>
                <span className={`font-bold ${getScoreColor(comparison.policy1.scores.affordability)}`}>
                  {comparison.policy1.scores.affordability}/10
                </span>
              </div>
              <div className="flex justify-between p-2 bg-muted/50 rounded">
                <span>Coverage:</span>
                <span className={`font-bold ${getScoreColor(comparison.policy1.scores.coverage)}`}>
                  {comparison.policy1.scores.coverage}/10
                </span>
              </div>
              <div className="flex justify-between p-2 bg-muted/50 rounded">
                <span>Deductible:</span>
                <span className={`font-bold ${getScoreColor(comparison.policy1.scores.deductible)}`}>
                  {comparison.policy1.scores.deductible}/10
                </span>
              </div>
              <div className="flex justify-between p-2 bg-muted/50 rounded">
                <span>Value:</span>
                <span className={`font-bold ${getScoreColor(comparison.policy1.scores.value)}`}>
                  {comparison.policy1.scores.value}/10
                </span>
              </div>
            </div>

            {/* Strengths */}
            <div>
              <h4 className="font-medium text-green-700 mb-2">Strengths</h4>
              <ul className="space-y-1">
                {comparison.policy1.strengths.map((strength, index) => (
                  <li key={index} className="text-xs flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div>
              <h4 className="font-medium text-red-700 mb-2">Areas for Improvement</h4>
              <ul className="space-y-1">
                {comparison.policy1.weaknesses.map((weakness, index) => (
                  <li key={index} className="text-xs flex items-start gap-2">
                    <AlertTriangle className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                    {weakness}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Policy 2 */}
        <Card className={`${isWinner(2) ? 'ring-2 ring-primary' : ''}`}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                {isWinner(2) && <Crown className="h-5 w-5 text-yellow-500" />}
                {originalData.policy2.provider}
              </CardTitle>
              <Badge className={getRiskColor(comparison.policy2.riskLevel)}>
                {comparison.policy2.riskLevel.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall Score */}
            <div className="flex items-center gap-4">
              {getRiskIcon(comparison.policy2.riskLevel)}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xl font-bold">{comparison.policy2.scores.overall}/10</span>
                  <span className="text-sm text-muted-foreground">Overall Score</span>
                </div>
                <Progress value={comparison.policy2.scores.overall * 10} className="h-2" />
              </div>
            </div>

            {/* Policy Details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Monthly Premium:</span>
                <span className="font-medium">{formatCurrency(originalData.policy2.monthlyPremium, originalData.country)}</span>
              </div>
              <div className="flex justify-between">
                <span>Coverage Amount:</span>
                <span className="font-medium">{formatCurrency(originalData.policy2.coverageAmount, originalData.country)}</span>
              </div>
              <div className="flex justify-between">
                <span>Deductible:</span>
                <span className="font-medium">{formatCurrency(originalData.policy2.deductible, originalData.country)}</span>
              </div>
            </div>

            {/* Detailed Scores */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between p-2 bg-muted/50 rounded">
                <span>Affordability:</span>
                <span className={`font-bold ${getScoreColor(comparison.policy2.scores.affordability)}`}>
                  {comparison.policy2.scores.affordability}/10
                </span>
              </div>
              <div className="flex justify-between p-2 bg-muted/50 rounded">
                <span>Coverage:</span>
                <span className={`font-bold ${getScoreColor(comparison.policy2.scores.coverage)}`}>
                  {comparison.policy2.scores.coverage}/10
                </span>
              </div>
              <div className="flex justify-between p-2 bg-muted/50 rounded">
                <span>Deductible:</span>
                <span className={`font-bold ${getScoreColor(comparison.policy2.scores.deductible)}`}>
                  {comparison.policy2.scores.deductible}/10
                </span>
              </div>
              <div className="flex justify-between p-2 bg-muted/50 rounded">
                <span>Value:</span>
                <span className={`font-bold ${getScoreColor(comparison.policy2.scores.value)}`}>
                  {comparison.policy2.scores.value}/10
                </span>
              </div>
            </div>

            {/* Strengths */}
            <div>
              <h4 className="font-medium text-green-700 mb-2">Strengths</h4>
              <ul className="space-y-1">
                {comparison.policy2.strengths.map((strength, index) => (
                  <li key={index} className="text-xs flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div>
              <h4 className="font-medium text-red-700 mb-2">Areas for Improvement</h4>
              <ul className="space-y-1">
                {comparison.policy2.weaknesses.map((weakness, index) => (
                  <li key={index} className="text-xs flex items-start gap-2">
                    <AlertTriangle className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                    {weakness}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Our Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {comparison.recommendations.map((recommendation, index) => (
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
    </div>
  );
};

export default SimpleComparisonResults;