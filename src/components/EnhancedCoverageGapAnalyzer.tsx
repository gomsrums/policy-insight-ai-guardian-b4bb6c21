
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Download, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { AnalysisResult } from "@/lib/chatpdf-types";
import { analyzePolicy, GapAnalysisResult, CoverageGap } from "@/services/advanced-coverage-analyzer";

interface EnhancedCoverageGapAnalyzerProps {
  analysis: AnalysisResult;
  policyType?: string;
}

const EnhancedCoverageGapAnalyzer = ({ 
  analysis, 
  policyType = "general" 
}: EnhancedCoverageGapAnalyzerProps) => {
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (analysis?.summary) {
      performGapAnalysis();
    }
  }, [analysis]);

  const performGapAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      console.log('Starting enhanced coverage gap analysis...');
      const result = await analyzePolicy(analysis.summary, policyType);
      setGapAnalysis(result);
    } catch (err) {
      console.error('Enhanced gap analysis failed:', err);
      setError('Failed to analyze coverage gaps. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'moderate': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'adequate': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'insufficient': return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case 'missing': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'adequate': return 'default';
      case 'insufficient': return 'secondary';
      case 'missing': return 'destructive';
      default: return 'outline';
    }
  };

  // Prepare chart data
  const pieChartData = gapAnalysis ? [
    { name: 'Covered', value: gapAnalysis.completeness.covered, color: '#10B981' },
    { name: 'Gaps', value: gapAnalysis.completeness.gaps, color: '#EF4444' }
  ] : [];

  const severityChartData = gapAnalysis ? [
    { 
      name: 'Critical', 
      count: gapAnalysis.gaps.filter(g => g.severity === 'critical').length,
      color: '#EF4444'
    },
    { 
      name: 'Moderate', 
      count: gapAnalysis.gaps.filter(g => g.severity === 'moderate').length,
      color: '#F59E0B'
    },
    { 
      name: 'Low', 
      count: gapAnalysis.gaps.filter(g => g.severity === 'low').length,
      color: '#3B82F6'
    }
  ] : [];

  const generateReport = () => {
    if (!gapAnalysis) return;
    
    // Create downloadable report content
    const reportContent = `
# Coverage Gap Analysis Report

## Overall Score: ${gapAnalysis.overallScore}%

## Summary
- Total Coverages Analyzed: ${gapAnalysis.gaps.length}
- Adequate Coverage: ${gapAnalysis.completeness.covered}
- Coverage Gaps: ${gapAnalysis.completeness.gaps}
- Critical Gaps: ${gapAnalysis.criticalGaps}

## Detailed Gaps
${gapAnalysis.gaps.map(gap => `
### ${gap.coverage} (${gap.severity.toUpperCase()})
- Status: ${gap.status}
- Description: ${gap.description}
- Recommendation: ${gap.recommendation}
- Estimated Cost: ${gap.estimatedCost || 'N/A'}
`).join('')}

Generated on: ${new Date().toLocaleDateString()}
    `;
    
    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'coverage-gap-analysis.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Coverage Gap Analysis</CardTitle>
          <CardDescription>Analyzing policy against UK insurance standards...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Processing coverage gaps with advanced NLP analysis...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Analysis Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!gapAnalysis) return null;

  return (
    <div className="space-y-6">
      {/* Overview Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {gapAnalysis.overallScore}%
              </div>
              <p className="text-sm text-gray-600">Overall Coverage Score</p>
              <Progress value={gapAnalysis.overallScore} className="mt-2" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {gapAnalysis.criticalGaps}
              </div>
              <p className="text-sm text-gray-600">Critical Gaps</p>
              {gapAnalysis.criticalGaps > 0 && (
                <Badge variant="destructive" className="mt-2">Attention Required</Badge>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {gapAnalysis.completeness.covered}
              </div>
              <p className="text-sm text-gray-600">Adequate Coverages</p>
              <Badge variant="default" className="mt-2">Protected</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Coverage Completeness</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieChartData.map((entry, index) => (
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
            <CardTitle>Gap Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={severityChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8">
                  {severityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="gaps" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gaps">Coverage Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="report">Generate Report</TabsTrigger>
        </TabsList>

        <TabsContent value="gaps">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Coverage Analysis</CardTitle>
              <CardDescription>
                Complete breakdown of your policy coverage with color-coded severity indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Coverage</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Estimated Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gapAnalysis.gaps.map((gap, index) => (
                    <TableRow key={index} className={getSeverityColor(gap.severity)}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(gap.status)}
                          {gap.coverage}
                        </div>
                      </TableCell>
                      <TableCell>{gap.category}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(gap.status)}>
                          {gap.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={gap.severity === 'critical' ? 'destructive' : 
                                 gap.severity === 'moderate' ? 'secondary' : 'default'}
                        >
                          {gap.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {gap.estimatedCost || 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <div className="space-y-4">
            {gapAnalysis.gaps
              .filter(gap => gap.status !== 'adequate')
              .map((gap, index) => (
                <Card key={index} className={`border-l-4 ${
                  gap.severity === 'critical' ? 'border-l-red-500' :
                  gap.severity === 'moderate' ? 'border-l-amber-500' : 'border-l-blue-500'
                }`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {gap.coverage}
                      <Badge variant={gap.severity === 'critical' ? 'destructive' : 
                                   gap.severity === 'moderate' ? 'secondary' : 'default'}>
                        {gap.severity} Priority
                      </Badge>
                    </CardTitle>
                    <CardDescription>{gap.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="font-medium text-green-700">Recommendation:</p>
                      <p className="text-sm">{gap.recommendation}</p>
                      {gap.estimatedCost && (
                        <p className="text-xs text-gray-500">
                          Estimated cost: {gap.estimatedCost}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="report">
          <Card>
            <CardHeader>
              <CardTitle>Download Analysis Report</CardTitle>
              <CardDescription>
                Generate a comprehensive PDF report of your coverage gap analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="font-semibold mb-2">Report Contents</h4>
                  <ul className="text-sm text-left space-y-1">
                    <li>• Executive summary with overall score</li>
                    <li>• Detailed gap analysis by severity</li>
                    <li>• Actionable recommendations with cost estimates</li>
                    <li>• Benchmark comparisons against UK standards</li>
                    <li>• Priority action items</li>
                  </ul>
                </div>
                <Button onClick={generateReport} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Coverage Gap Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Critical Gaps Alert */}
      {gapAnalysis.criticalGaps > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Coverage Gaps Detected</AlertTitle>
          <AlertDescription>
            Your policy has {gapAnalysis.criticalGaps} critical gap(s) that require immediate attention. 
            These gaps may leave you exposed to significant financial risk. Please review the recommendations above.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default EnhancedCoverageGapAnalyzer;
