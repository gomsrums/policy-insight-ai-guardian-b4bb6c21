
import { AnalysisResult } from "@/lib/chatpdf-types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  analyzeGaps, 
  convertAnalysisToCompanyData,
  type GapAnalysisResult,
  type CompanyData,
  type CoverageGap
} from "@/services/rule-based-gap-analyzer";
import { useMemo } from "react";

interface ComprehensiveAnalysisDashboardProps {
  analysis: AnalysisResult;
  userContext: {
    location: string;
    propertyType: string;
    businessType: string;
    industry: string;
  };
}

const ComprehensiveAnalysisDashboard = ({ 
  analysis, 
  userContext 
}: ComprehensiveAnalysisDashboardProps) => {
  
  const { companyData, gapAnalysis } = useMemo(() => {
    const companyData = convertAnalysisToCompanyData(analysis);
    // Override with user context where available
    companyData.industry = userContext.industry || companyData.industry;
    companyData.location = userContext.location || companyData.location;
    
    const gapAnalysis = analyzeGaps(companyData);
    return { companyData, gapAnalysis };
  }, [analysis, userContext]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Missing": return "destructive";
      case "Underinsured": return "secondary";
      case "Adequate": return "default";
      default: return "outline";
    }
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{gapAnalysis.overallRiskScore}/100</div>
            <Progress value={gapAnalysis.overallRiskScore} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Critical Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{gapAnalysis.criticalGaps}</div>
            <p className="text-sm text-muted-foreground mt-1">Require immediate attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{gapAnalysis.totalGaps}</div>
            <p className="text-sm text-muted-foreground mt-1">Missing or underinsured</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Adequate Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{gapAnalysis.adequateCoverages}</div>
            <p className="text-sm text-muted-foreground mt-1">Properly protected</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="gaps" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="gaps">Coverage Analysis</TabsTrigger>
          <TabsTrigger value="adequate">Adequate Coverage</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="company">Company Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="gaps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Coverage Gap Analysis</CardTitle>
              <CardDescription>
                Detailed analysis of missing, underinsured, and adequate coverage based on your business profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gapAnalysis.coverageGaps.map((gap, index) => (
                  <div 
                    key={index} 
                    className="border rounded-lg p-4"
                    style={{ borderLeftColor: gap.colorCode, borderLeftWidth: '4px' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{gap.coverageName}</h4>
                        <p className="text-sm text-muted-foreground">{gap.category}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getStatusBadgeVariant(gap.status)}>
                          {gap.status}
                        </Badge>
                        <Badge 
                          variant={gap.severity === 'Critical' ? 'destructive' : 
                                 gap.severity === 'High' ? 'secondary' : 'default'}
                        >
                          {gap.severity}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Current Limit</label>
                        <p className="text-sm font-medium">{formatCurrency(gap.coverageLimit)}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Recommended Minimum</label>
                        <p className="text-sm font-medium">{formatCurrency(gap.recommendedMinimum)}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Estimated Exposure</label>
                        <p className="text-sm font-medium">{formatCurrency(gap.estimatedExposure)}</p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <label className="text-xs font-medium text-muted-foreground">Compliance Risk</label>
                        <Badge variant={gap.complianceRisk ? 'destructive' : 'default'}>
                          {gap.complianceRisk ? 'High Risk' : 'Low Risk'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 p-3 rounded">
                      <p className="text-sm">{gap.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adequate" className="space-y-4">
          <Card className="border-green-500">
            <CardHeader>
              <CardTitle className="text-green-600">Adequate Coverage</CardTitle>
              <CardDescription>
                Insurance coverages that meet or exceed recommended requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {gapAnalysis.coverageGaps.filter(gap => gap.status === 'Adequate').length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gapAnalysis.coverageGaps
                    .filter(gap => gap.status === 'Adequate')
                    .map((gap, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-green-50">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{gap.coverageName}</h4>
                          <p className="text-sm text-muted-foreground">{gap.category}</p>
                        </div>
                        <Badge variant="default" className="bg-green-600">
                          Adequate
                        </Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        <p>Current: {formatCurrency(gap.coverageLimit)}</p>
                        <p>Required: {formatCurrency(gap.recommendedMinimum)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No adequate coverages identified. Review the gaps tab for improvement opportunities.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prioritized Recommendations</CardTitle>
              <CardDescription>
                Action items prioritized by severity and compliance risk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gapAnalysis.coverageGaps
                  .filter(gap => gap.status !== 'Adequate')
                  .sort((a, b) => {
                    const severityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
                    return (severityOrder[b.severity as keyof typeof severityOrder] || 0) - 
                           (severityOrder[a.severity as keyof typeof severityOrder] || 0);
                  })
                  .map((gap, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-3 p-4 border rounded-lg"
                    style={{ backgroundColor: `${gap.colorCode}10` }}
                  >
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ backgroundColor: gap.colorCode }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium">{gap.coverageName}</h5>
                        <Badge variant={getStatusBadgeVariant(gap.status)}>
                          {gap.status}
                        </Badge>
                        {gap.complianceRisk && (
                          <Badge variant="destructive">Compliance Risk</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Estimated Exposure: {formatCurrency(gap.estimatedExposure)}
                      </p>
                      <p className="text-sm">{gap.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Risk Profile</CardTitle>
              <CardDescription>
                Analysis based on your business characteristics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Industry</label>
                    <p className="text-lg">{companyData.industry}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Employee Count</label>
                    <p className="text-lg">{companyData.employeeCount}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Annual Revenue</label>
                    <p className="text-lg">{formatCurrency(companyData.annualRevenue)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Fleet Vehicles</label>
                    <p className="text-lg">{companyData.fleetVehicles}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Has Premises</label>
                    <p className="text-lg">{companyData.hasPremises ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Handles PII</label>
                    <p className="text-lg">{companyData.handlesPII ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Location</label>
                    <p className="text-lg">{companyData.location}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Company ID</label>
                    <p className="text-lg font-mono text-sm">{companyData.companyId}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Alert>
        <AlertTitle>Analysis Methodology</AlertTitle>
        <AlertDescription>
          This analysis uses a rule-based framework to evaluate your insurance coverage against industry-standard requirements. 
          Each coverage gap includes estimated exposure calculations, compliance risk assessment, and color-coded severity indicators 
          based on your specific business profile including industry type, employee count, revenue, and operational characteristics.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ComprehensiveAnalysisDashboard;
