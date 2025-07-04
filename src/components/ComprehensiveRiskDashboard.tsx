
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Shield, TrendingUp, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { ComprehensiveRiskAssessment, RiskFactor, RiskRecommendation } from "@/services/comprehensive-risk-assessor";

interface ComprehensiveRiskDashboardProps {
  assessment: ComprehensiveRiskAssessment;
}

const ComprehensiveRiskDashboard = ({ assessment }: ComprehensiveRiskDashboardProps) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'bg-red-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Immediate': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Risk Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Risk Score</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assessment.overallRiskScore}/20</div>
            <Badge className={getRiskLevelColor(assessment.riskLevel)}>
              {assessment.riskLevel}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Financial Exposure</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(assessment.totalFinancialExposure)}</div>
            <p className="text-xs text-muted-foreground">Estimated total exposure</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assessment.complianceScore}%</div>
            <Progress value={assessment.complianceScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Business Continuity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assessment.businessContinuityScore}%</div>
            <Progress value={assessment.businessContinuityScore} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Risk Matrix Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Matrix</CardTitle>
          <CardDescription>Impact vs Probability visualization of identified risks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative h-64 border rounded-lg bg-gray-50">
            <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 gap-1 p-2">
              {assessment.riskMatrix.map((risk, index) => (
                <div
                  key={index}
                  className="relative"
                  style={{
                    gridColumn: risk.position.x,
                    gridRow: 6 - risk.position.y,
                  }}
                >
                  <div
                    className="w-full h-full rounded flex items-center justify-center text-xs font-medium text-white"
                    style={{ backgroundColor: risk.color }}
                    title={`${risk.risk}: Impact ${risk.impact}, Probability ${risk.probability}`}
                  >
                    {risk.risk.substring(0, 3)}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Matrix Labels */}
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">
              Probability →
            </div>
            <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs text-gray-600">
              Impact ↑
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prioritized Risks */}
      <Card>
        <CardHeader>
          <CardTitle>Prioritized Risk Factors</CardTitle>
          <CardDescription>Risks ranked by impact, probability, and confidence</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assessment.prioritizedRisks.slice(0, 6).map((risk, index) => (
              <div key={risk.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={getRiskLevelColor(risk.impact)}>
                      {risk.impact} Impact
                    </Badge>
                    <Badge variant="outline" className={getRiskLevelColor(risk.probability)}>
                      {risk.probability}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(risk.confidence * 100)}% confidence
                    </span>
                  </div>
                  <h4 className="font-medium">{risk.category}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{risk.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Exposure: {formatCurrency(risk.financialExposure)}</span>
                    <span>Mitigation: {formatCurrency(risk.mitigationCost)}</span>
                    {risk.regulatoryRisk && <Badge variant="secondary" className="text-xs">Regulatory</Badge>}
                    {risk.businessContinuityRisk && <Badge variant="secondary" className="text-xs">Business Critical</Badge>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Mitigation Recommendations</CardTitle>
          <CardDescription>Prioritized actions to reduce risk exposure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assessment.recommendations.slice(0, 8).map((rec, index) => (
              <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getPriorityColor(rec.priority)}>
                      {rec.priority} Priority
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{rec.timeframe}</span>
                    </div>
                  </div>
                  <h4 className="font-medium">{rec.category}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{rec.action}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Cost: {formatCurrency(rec.estimatedCost)}</span>
                    <span>Risk Reduction: {Math.round(rec.riskReduction * 100)}%</span>
                    <span>ROI Score: {rec.roiScore.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Compliance Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{assessment.complianceScore}%</div>
            <Progress value={assessment.complianceScore} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              Regulatory compliance assessment based on identified gaps
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Business Continuity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{assessment.businessContinuityScore}%</div>
            <Progress value={assessment.businessContinuityScore} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              Operational resilience and continuity protection level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Reputational Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{assessment.reputationalScore}%</div>
            <Progress value={assessment.reputationalScore} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              Brand and reputation protection assessment
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComprehensiveRiskDashboard;
