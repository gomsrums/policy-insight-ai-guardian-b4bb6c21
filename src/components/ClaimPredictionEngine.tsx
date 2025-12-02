import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, TrendingUp, Activity, Shield, Loader2 } from 'lucide-react';

interface ClaimPrediction {
  type: string;
  probability: number;
  averageCost: number;
  riskLevel: 'low' | 'medium' | 'high';
  covered: boolean;
  mitigation: string;
}

interface ClaimPredictionEngineProps {
  analysisData?: {
    gaps?: string[];
    coverage_analysis?: Array<{
      type: string;
      status: string;
    }>;
    risk_assessment?: {
      overall_risk_level?: string;
      risk_factors?: string[];
    };
  };
}

const CLAIM_TYPES = {
  'Property': [
    { type: 'Fire Damage', baseProbability: 8, averageCost: 75000 },
    { type: 'Water Damage', baseProbability: 15, averageCost: 25000 },
    { type: 'Theft/Burglary', baseProbability: 12, averageCost: 15000 },
    { type: 'Natural Disaster', baseProbability: 5, averageCost: 100000 },
    { type: 'Vandalism', baseProbability: 6, averageCost: 8000 }
  ],
  'Liability': [
    { type: 'Slip and Fall', baseProbability: 18, averageCost: 50000 },
    { type: 'Professional Negligence', baseProbability: 10, averageCost: 75000 },
    { type: 'Product Liability', baseProbability: 7, averageCost: 150000 },
    { type: 'Employment Practices', baseProbability: 12, averageCost: 40000 }
  ],
  'Auto': [
    { type: 'Collision', baseProbability: 20, averageCost: 12000 },
    { type: 'Comprehensive', baseProbability: 15, averageCost: 8000 },
    { type: 'Bodily Injury', baseProbability: 8, averageCost: 35000 },
    { type: 'Uninsured Motorist', baseProbability: 5, averageCost: 25000 }
  ],
  'Cyber': [
    { type: 'Data Breach', baseProbability: 25, averageCost: 200000 },
    { type: 'Ransomware Attack', baseProbability: 15, averageCost: 150000 },
    { type: 'Business Interruption', baseProbability: 12, averageCost: 100000 },
    { type: 'Social Engineering', baseProbability: 20, averageCost: 50000 }
  ],
  'Health': [
    { type: 'Emergency Medical', baseProbability: 30, averageCost: 25000 },
    { type: 'Surgery/Hospitalization', baseProbability: 15, averageCost: 50000 },
    { type: 'Chronic Condition', baseProbability: 20, averageCost: 15000 },
    { type: 'Prescription Drugs', baseProbability: 40, averageCost: 5000 }
  ]
};

export const ClaimPredictionEngine: React.FC<ClaimPredictionEngineProps> = ({ analysisData }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [predictions, setPredictions] = useState<ClaimPrediction[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const categories = Object.keys(CLAIM_TYPES);

  const calculatePredictions = () => {
    if (!selectedCategory) return;

    setIsCalculating(true);

    setTimeout(() => {
      const baseClaims = CLAIM_TYPES[selectedCategory as keyof typeof CLAIM_TYPES];
      const gaps = analysisData?.gaps || [];
      const coverageAnalysis = analysisData?.coverage_analysis || [];
      const riskLevel = analysisData?.risk_assessment?.overall_risk_level?.toLowerCase() || 'medium';

      // Risk multiplier based on overall risk level
      const riskMultiplier = riskLevel === 'high' ? 1.5 : riskLevel === 'low' ? 0.7 : 1.0;

      const calculatedPredictions: ClaimPrediction[] = baseClaims.map(claim => {
        // Check if this claim type is covered
        const isCovered = coverageAnalysis.some(c => 
          c.type.toLowerCase().includes(claim.type.toLowerCase().split(' ')[0]) &&
          c.status === 'Covered'
        );

        // Check if there's a gap related to this claim
        const hasGap = gaps.some(g => 
          g.toLowerCase().includes(claim.type.toLowerCase().split(' ')[0])
        );

        // Adjust probability based on gaps and coverage
        let adjustedProbability = claim.baseProbability * riskMultiplier;
        if (hasGap) adjustedProbability *= 1.3; // Gaps increase risk
        if (!isCovered) adjustedProbability *= 1.2; // Uncovered = higher effective risk

        adjustedProbability = Math.min(95, Math.round(adjustedProbability));

        // Determine risk level
        const claimRiskLevel: 'low' | 'medium' | 'high' = 
          adjustedProbability >= 30 ? 'high' : 
          adjustedProbability >= 15 ? 'medium' : 'low';

        // Generate mitigation advice
        let mitigation = '';
        if (!isCovered) {
          mitigation = `Add ${claim.type.toLowerCase()} coverage to protect against this risk.`;
        } else if (hasGap) {
          mitigation = `Review coverage limits for ${claim.type.toLowerCase()} claims.`;
        } else if (claimRiskLevel === 'high') {
          mitigation = `Implement risk management practices to reduce ${claim.type.toLowerCase()} incidents.`;
        } else {
          mitigation = `Coverage in place. Consider increasing limits if assets have grown.`;
        }

        return {
          type: claim.type,
          probability: adjustedProbability,
          averageCost: claim.averageCost,
          riskLevel: claimRiskLevel,
          covered: isCovered,
          mitigation
        };
      });

      // Sort by probability (highest first)
      calculatedPredictions.sort((a, b) => b.probability - a.probability);

      setPredictions(calculatedPredictions);
      setIsCalculating(false);
    }, 1500);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const totalExposure = predictions.reduce((sum, p) => {
    if (!p.covered) {
      return sum + (p.averageCost * (p.probability / 100));
    }
    return sum;
  }, 0);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Claim Prediction Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Selection */}
        <div className="flex gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Insurance Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button 
              onClick={calculatePredictions} 
              disabled={!selectedCategory || isCalculating}
            >
              {isCalculating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                'Predict Claims'
              )}
            </Button>
          </div>
        </div>

        {/* Results */}
        {predictions.length > 0 && (
          <>
            {/* Exposure Summary */}
            {totalExposure > 0 && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span className="font-semibold text-red-500">Uninsured Risk Exposure</span>
                </div>
                <p className="text-2xl font-bold mt-2">{formatCurrency(totalExposure)}</p>
                <p className="text-sm text-muted-foreground">
                  Expected annual exposure from uncovered claims
                </p>
              </div>
            )}

            {/* Predictions List */}
            <div className="space-y-4">
              {predictions.map((prediction, index) => (
                <div key={index} className="p-4 rounded-lg border border-border/50 bg-muted/20 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold flex items-center gap-2">
                        {prediction.type}
                        {!prediction.covered && (
                          <Badge variant="destructive" className="text-xs">Uncovered</Badge>
                        )}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Average claim: {formatCurrency(prediction.averageCost)}
                      </p>
                    </div>
                    <Badge variant="outline" className={getRiskColor(prediction.riskLevel)}>
                      {prediction.riskLevel.charAt(0).toUpperCase() + prediction.riskLevel.slice(1)} Risk
                    </Badge>
                  </div>

                  {/* Probability Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Claim Probability</span>
                      <span className={getRiskColor(prediction.riskLevel)}>{prediction.probability}%</span>
                    </div>
                    <Progress 
                      value={prediction.probability} 
                      className="h-2"
                    />
                  </div>

                  {/* Mitigation */}
                  <div className="flex items-start gap-2 p-2 rounded bg-muted/30">
                    <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{prediction.mitigation}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Low Risk (&lt;15%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>Medium Risk (15-30%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>High Risk (&gt;30%)</span>
              </div>
            </div>

            <Button variant="outline" onClick={() => setPredictions([])} className="w-full">
              New Prediction
            </Button>
          </>
        )}

        {!analysisData && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Upload and analyze a policy for personalized claim predictions
          </p>
        )}
      </CardContent>
    </Card>
  );
};
