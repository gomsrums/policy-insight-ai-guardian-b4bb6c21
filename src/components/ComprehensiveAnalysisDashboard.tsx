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
import { 
  transformToInfographicData,
  transformToDetailedReport,
  generateChartData,
  type InfographicCompanyData,
  type DetailedReportData
} from "@/services/infographic-data-transformer";
import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

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
  
  const { companyData, gapAnalysis, infographicData, detailedReport, chartData } = useMemo(() => {
    const companyData = convertAnalysisToCompanyData(analysis);
    // Override with user context where available
    companyData.industry = userContext.industry || companyData.industry;
    companyData.location = userContext.location || companyData.location;
    
    const gapAnalysis = analyzeGaps(companyData);
    const infographicData = transformToInfographicData(gapAnalysis, companyData);
    const detailedReport = transformToDetailedReport(gapAnalysis, companyData);
    const chartData = generateChartData(infographicData);
    
    return { companyData, gapAnalysis, infographicData, detailedReport, chartData };
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
      {/* Enhanced Overview Cards with Infographic Data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: chartData.riskScoreGauge.color }}>
              {infographicData.overallRiskScore}/100
            </div>
            <p className="text-sm text-muted-foreground">{chartData.riskScoreGauge.label}</p>
            <Progress value={infographicData.overallRiskScore} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Critical Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{infographicData.gapSummary.critical}</div>
            <p className="text-sm text-muted-foreground mt-1">Require immediate attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Exposure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(infographicData.estimatedTotalExposure)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Uncovered risk exposure</p>
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

      {/* Enhanced Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Coverage Status Distribution</CardTitle>
            <CardDescription>Visual breakdown of coverage across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData.coverageStatusPieChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                  label={({ category, name }) => `${category}: ${name}`}
                >
                  {chartData.coverageStatusPieChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gaps by Severity</CardTitle>
            <CardDescription>Distribution of coverage gaps by risk level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData.gapsBySeverity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value">
                  {chartData.gapsBySeverity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="gaps" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="gaps">Coverage Analysis</TabsTrigger>
          <TabsTrigger value="infographic">Dashboard View</TabsTrigger>
          <TabsTrigger value="report">Detailed Report</TabsTrigger>
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

        <TabsContent value="infographic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Infographic Dashboard View</CardTitle>
              <CardDescription>
                Structured data for visualization and charts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Company Overview</h4>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <pre className="text-sm overflow-auto">
                        {JSON.stringify({
                          companyId: infographicData.companyId,
                          companyName: infographicData.companyName,
                          overallRiskScore: infographicData.overallRiskScore,
                          estimatedTotalExposure: infographicData.estimatedTotalExposure
                        }, null, 2)}
                      </pre>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Gap Summary</h4>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <pre className="text-sm overflow-auto">
                        {JSON.stringify(infographicData.gapSummary, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Top Gaps (Chart Ready)</h4>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <pre className="text-sm overflow-auto max-h-96">
                      {JSON.stringify(infographicData.topGaps, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Report Data</CardTitle>
              <CardDescription>
                Complete report structure for PDF/HTML generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Executive Summary</h4>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <pre className="text-sm overflow-auto">
                        {JSON.stringify(detailedReport.executiveSummary, null, 2)}
                      </pre>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Company Profile</h4>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <pre className="text-sm overflow-auto">
                        {JSON.stringify(detailedReport.companyProfile, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Risk Breakdown (Sample)</h4>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <pre className="text-sm overflow-auto max-h-64">
                      {JSON.stringify(detailedReport.riskBreakdown.slice(0, 3), null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
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
          The infographic data is structured for easy visualization while the detailed report provides comprehensive insights 
          for compliance and risk management purposes.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ComprehensiveAnalysisDashboard;
