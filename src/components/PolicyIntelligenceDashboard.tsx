import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Shield, 
  Home, 
  FileText,
  TrendingUp,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { PolicyIntelligenceReport, PolicyGap } from '@/types/policyIntelligence';

interface PolicyIntelligenceDashboardProps {
  report: PolicyIntelligenceReport;
}

const PolicyIntelligenceDashboard: React.FC<PolicyIntelligenceDashboardProps> = ({ report }) => {
  const getSeverityColor = (severity: PolicyGap['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
    }
  };

  const getSeverityIcon = (severity: PolicyGap['severity']) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'high': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'medium': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-green-500';
  };

  const getRiskLevel = (score: number) => {
    if (score >= 70) return 'High Risk';
    if (score >= 40) return 'Medium Risk';
    return 'Low Risk';
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getRiskScoreColor(report.overallRiskScore)}`}>
              {report.overallRiskScore}
            </div>
            <p className="text-xs text-muted-foreground">{getRiskLevel(report.overallRiskScore)}</p>
            <Progress 
              value={report.overallRiskScore} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Exposure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              £{report.totalExposure.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Uncovered value at risk</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Critical Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">
              {report.criticalGapsCount}
            </div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Extraction Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round(report.extractedPolicy.extractionConfidence * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">{report.extractedPolicy.rawDataPoints} data points</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {report.criticalGapsCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Coverage Gaps Detected</AlertTitle>
          <AlertDescription>
            Your policy has {report.criticalGapsCount} critical gap{report.criticalGapsCount > 1 ? 's' : ''} that 
            could leave you significantly exposed financially. Review the gaps below and take action.
          </AlertDescription>
        </Alert>
      )}

      {/* Extracted Policy Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Extracted Policy Data
          </CardTitle>
          <CardDescription>
            Key information extracted from your policy document
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Coverage Limits */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Coverage Limits
              </h4>
              <div className="space-y-2">
                {report.extractedPolicy.coverage.buildings && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Buildings</span>
                    <span className="font-medium">£{report.extractedPolicy.coverage.buildings.toLocaleString()}</span>
                  </div>
                )}
                {report.extractedPolicy.coverage.contents && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contents</span>
                    <span className="font-medium">£{report.extractedPolicy.coverage.contents.toLocaleString()}</span>
                  </div>
                )}
                {report.extractedPolicy.itemLimits.singleItemLimit && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Single Item Limit</span>
                    <span className="font-medium">£{report.extractedPolicy.itemLimits.singleItemLimit.toLocaleString()}</span>
                  </div>
                )}
                {report.extractedPolicy.itemLimits.gardenStructures && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Garden Structures</span>
                    <span className="font-medium">£{report.extractedPolicy.itemLimits.gardenStructures.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Excess Amounts */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Excess Amounts
              </h4>
              <div className="space-y-2">
                {report.extractedPolicy.excess.standard && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Standard</span>
                    <span className="font-medium">£{report.extractedPolicy.excess.standard}</span>
                  </div>
                )}
                {report.extractedPolicy.excess.escapeOfWater && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Escape of Water</span>
                    <span className="font-medium">£{report.extractedPolicy.excess.escapeOfWater}</span>
                  </div>
                )}
                {report.extractedPolicy.excess.subsidence && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subsidence</span>
                    <span className="font-medium">£{report.extractedPolicy.excess.subsidence}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Exclusions */}
          <div className="space-y-4">
            <h4 className="font-semibold">Policy Exclusions</h4>
            <div className="flex flex-wrap gap-2">
              {report.extractedPolicy.exclusions.length > 0 ? (
                report.extractedPolicy.exclusions.map((exclusion, index) => (
                  <Badge key={index} variant="destructive">
                    {exclusion}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">No major exclusions detected</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gap Analysis Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Gap Analysis: Your Situation vs Policy Reality
          </CardTitle>
          <CardDescription>
            Detailed breakdown of coverage gaps based on your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.gaps.length > 0 ? (
              report.gaps.map((gap) => (
                <div 
                  key={gap.id} 
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(gap.severity)}
                      <span className="font-semibold">{gap.category}</span>
                    </div>
                    <Badge 
                      className={`${getSeverityColor(gap.severity)} text-white`}
                    >
                      {gap.severity.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Your Situation</p>
                      <p className="font-medium">{gap.userSituation}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Policy Reality</p>
                      <p className="font-medium">{gap.policyReality}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Gap Identified</p>
                      <p className="font-medium text-destructive">{gap.gapIdentified}</p>
                    </div>
                  </div>

                  {gap.financialExposure && (
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">Financial Exposure:</span>
                      <span className="font-bold text-destructive">
                        £{gap.financialExposure.toLocaleString()}
                      </span>
                      {gap.percentageCovered && (
                        <>
                          <span className="text-muted-foreground">Currently Covered:</span>
                          <span className="font-medium">{gap.percentageCovered}%</span>
                        </>
                      )}
                    </div>
                  )}

                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">
                      <span className="font-medium">💡 Recommendation: </span>
                      {gap.recommendation}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium">No significant gaps detected</p>
                <p className="text-muted-foreground">Your policy appears to match your current situation well</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Key Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-1 shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PolicyIntelligenceDashboard;
