import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, TrendingDown, Calculator, AlertCircle, CheckCircle } from 'lucide-react';

interface CostBenefitResult {
  valueScore: number;
  premiumEfficiency: number;
  coveragePerDollar: number;
  recommendations: string[];
  verdict: 'excellent' | 'good' | 'fair' | 'poor';
  savings: number;
}

interface CostBenefitAnalyzerProps {
  analysisData?: {
    coverage_analysis?: Array<{
      type: string;
      status: string;
      limit?: string;
    }>;
    gaps?: string[];
  };
}

export const CostBenefitAnalyzer: React.FC<CostBenefitAnalyzerProps> = ({ analysisData }) => {
  const [premium, setPremium] = useState<string>('');
  const [deductible, setDeductible] = useState<string>('');
  const [coverageLimit, setCoverageLimit] = useState<string>('');
  const [result, setResult] = useState<CostBenefitResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const parseAmount = (value: string): number => {
    return parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateCostBenefit = () => {
    const premiumAmount = parseAmount(premium);
    const deductibleAmount = parseAmount(deductible);
    const limitAmount = parseAmount(coverageLimit);

    if (premiumAmount <= 0) {
      return;
    }

    setIsCalculating(true);

    setTimeout(() => {
      // Calculate coverage per dollar spent
      const coveragePerDollar = limitAmount / premiumAmount;
      
      // Calculate premium efficiency (lower deductible = higher efficiency)
      const deductibleRatio = deductibleAmount / limitAmount;
      const premiumEfficiency = Math.max(0, 100 - (deductibleRatio * 100));
      
      // Calculate value score based on multiple factors
      const coverageCount = analysisData?.coverage_analysis?.filter(c => c.status === 'Covered').length || 0;
      const gapsCount = analysisData?.gaps?.length || 0;
      
      // Industry benchmark: $50 coverage per $1 premium is considered good
      const coverageScore = Math.min(100, (coveragePerDollar / 50) * 100);
      const gapPenalty = gapsCount * 5;
      
      const valueScore = Math.max(0, Math.min(100, 
        (coverageScore * 0.4) + 
        (premiumEfficiency * 0.3) + 
        ((coverageCount * 10) * 0.3) - 
        gapPenalty
      ));

      // Determine verdict
      let verdict: 'excellent' | 'good' | 'fair' | 'poor';
      if (valueScore >= 80) verdict = 'excellent';
      else if (valueScore >= 60) verdict = 'good';
      else if (valueScore >= 40) verdict = 'fair';
      else verdict = 'poor';

      // Calculate potential savings
      const industryAvgPremium = limitAmount / 50; // Industry benchmark
      const savings = Math.max(0, premiumAmount - industryAvgPremium);

      // Generate recommendations
      const recommendations: string[] = [];
      
      if (deductibleRatio > 0.1) {
        recommendations.push('Consider a lower deductible to improve out-of-pocket protection.');
      }
      
      if (coveragePerDollar < 30) {
        recommendations.push('Your coverage-to-premium ratio is below average. Shop for competitive quotes.');
      }
      
      if (gapsCount > 2) {
        recommendations.push(`Address ${gapsCount} coverage gaps to maximize policy value.`);
      }
      
      if (savings > 500) {
        recommendations.push(`Potential annual savings of ${formatCurrency(savings)} by comparing providers.`);
      }
      
      if (coverageCount < 5) {
        recommendations.push('Consider bundling additional coverage types for better rates.');
      }

      if (recommendations.length === 0) {
        recommendations.push('Your policy offers competitive value for the premium paid.');
      }

      setResult({
        valueScore: Math.round(valueScore),
        premiumEfficiency: Math.round(premiumEfficiency),
        coveragePerDollar: Math.round(coveragePerDollar),
        recommendations,
        verdict,
        savings: Math.round(savings)
      });

      setIsCalculating(false);
    }, 1000);
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'excellent':
      case 'good':
        return <TrendingUp className="h-6 w-6" />;
      case 'fair':
      case 'poor':
        return <TrendingDown className="h-6 w-6" />;
      default:
        return null;
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Cost-Benefit Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="premium" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Annual Premium
            </Label>
            <Input
              id="premium"
              type="text"
              placeholder="e.g., 2500"
              value={premium}
              onChange={(e) => setPremium(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deductible">Deductible</Label>
            <Input
              id="deductible"
              type="text"
              placeholder="e.g., 1000"
              value={deductible}
              onChange={(e) => setDeductible(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="limit">Coverage Limit</Label>
            <Input
              id="limit"
              type="text"
              placeholder="e.g., 100000"
              value={coverageLimit}
              onChange={(e) => setCoverageLimit(e.target.value)}
            />
          </div>
        </div>

        <Button 
          onClick={calculateCostBenefit} 
          disabled={!premium || isCalculating}
          className="w-full"
        >
          {isCalculating ? 'Analyzing...' : 'Analyze Cost-Benefit'}
        </Button>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Value Score */}
            <div className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-center">
              <div className={`flex items-center justify-center gap-2 ${getVerdictColor(result.verdict)}`}>
                {getVerdictIcon(result.verdict)}
                <span className="text-5xl font-bold">{result.valueScore}</span>
              </div>
              <p className="text-muted-foreground mt-1">Value Score (out of 100)</p>
              <Badge className={`mt-2 ${getVerdictColor(result.verdict)}`} variant="outline">
                {result.verdict.charAt(0).toUpperCase() + result.verdict.slice(1)} Value
              </Badge>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50 text-center">
                <p className="text-2xl font-bold text-primary">{formatCurrency(result.coveragePerDollar)}</p>
                <p className="text-sm text-muted-foreground">Coverage per $1 Premium</p>
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border border-border/50 text-center">
                <p className="text-2xl font-bold text-primary">{result.premiumEfficiency}%</p>
                <p className="text-sm text-muted-foreground">Premium Efficiency</p>
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border border-border/50 text-center">
                <p className="text-2xl font-bold text-green-500">
                  {result.savings > 0 ? formatCurrency(result.savings) : '$0'}
                </p>
                <p className="text-sm text-muted-foreground">Potential Savings</p>
              </div>
            </div>

            {/* Premium Efficiency Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Premium Efficiency</span>
                <span>{result.premiumEfficiency}%</span>
              </div>
              <Progress value={result.premiumEfficiency} className="h-2" />
            </div>

            {/* Recommendations */}
            <div className="space-y-3">
              <h4 className="font-semibold">Recommendations</h4>
              {result.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                  {rec.includes('savings') || rec.includes('competitive') ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  )}
                  <span className="text-sm">{rec}</span>
                </div>
              ))}
            </div>

            <Button variant="outline" onClick={() => setResult(null)} className="w-full">
              New Analysis
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
