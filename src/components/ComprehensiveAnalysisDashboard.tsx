
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
  type CompanyData 
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

  const getRiskBadgeVariant = (severity: string) => {
    switch (severity) {
      case "Critical": return "destructive";
      case "High": return "destructive";
      case "Medium": return "secondary";
      case "Low": return "default";
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Missing Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{gapAnalysis.missingCoverages.length}</div>
            <p className="text-sm text-muted-foreground mt-1">Coverages not found</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Adequate Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{gapAnalysis.adequateCoverages.length}</div>
            <p className="text-sm text-muted-foreground mt-1">Properly protected</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="gaps" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="gaps">Coverage Gaps</TabsTrigger>
          <TabsTrigger value="adequate">Adequate Coverage</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="company">Company Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="gaps" className="space-y-4">
          {gapAnalysis.missingCoverages.length > 0 && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Missing Coverage</CardTitle>
                <CardDescription>
                  Critical insurance coverages that are required but not found in your policy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gapAnalysis.missingCoverages.map((gap, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-destructive/5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-lg">{gap.requiredCoverage}</h4>
                          <p className="text-sm text-muted-foreground">{gap.riskCategory}</p>
                        </div>
                        <Badge variant={getRiskBadgeVariant(gap.severity)}>
                          {gap.severity}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{gap.reason}</p>
                      <p className="text-sm font-medium">
                        Recommended limit: {formatCurrency(gap.recommendedLimit)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {gapAnalysis.underinsuredCoverages.length > 0 && (
            <Card className="border-orange-500">
              <CardHeader>
                <CardTitle className="text-orange-600">Underinsured Coverage</CardTitle>
                <CardDescription>
                  Existing coverages with limits below recommended minimums
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gapAnalysis.underinsuredCoverages.map((gap, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-orange-50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-lg">{gap.requiredCoverage}</h4>
                          <p className="text-sm text-muted-foreground">{gap.riskCategory}</p>
                        </div>
                        <Badge variant={getRiskBadgeVariant(gap.severity)}>
                          {gap.severity}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{gap.reason}</p>
                      <div className="flex justify-between text-sm">
                        <span>Current: {formatCurrency(gap.currentLimit)}</span>
                        <span>Recommended: {formatCurrency(gap.recommendedLimit)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
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
              {gapAnalysis.adequateCoverages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gapAnalysis.adequateCoverages.map((coverage, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-green-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{coverage.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Limit: {formatCurrency(coverage.limit)}
                          </p>
                        </div>
                        <Badge variant="default" className="bg-green-600">
                          {coverage.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No adequate coverages identified in current analysis.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actionable Recommendations</CardTitle>
              <CardDescription>
                Prioritized steps to improve your insurance coverage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gapAnalysis.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <p className="text-sm flex-1">{recommendation}</p>
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
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Alert>
        <AlertTitle>Analysis Methodology</AlertTitle>
        <AlertDescription>
          This analysis uses a rule-based framework to compare your current insurance coverage against industry-standard requirements based on your business profile. 
          The recommendations are generated by evaluating risk factors such as industry type, employee count, premises ownership, and data handling practices.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ComprehensiveAnalysisDashboard;
