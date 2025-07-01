import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Shield, TrendingUp, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { AnalysisResult } from "@/lib/chatpdf-types";

interface RiskAssessment {
  riskType: string;
  likelihood: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  mitigation?: string;
}

interface CoverageAnalysis {
  totalCoverages: number;
  adequateCoverages: number;
  insufficientCoverages: number;
  missingCoverages: number;
  overallRiskScore: number;
  riskAssessments: RiskAssessment[];
  coverageBreakdown: {
    category: string;
    status: 'Adequate' | 'Insufficient' | 'Missing';
    details: string;
  }[];
}

interface CoverageAnalyzerProps {
  analysis: AnalysisResult;
  userContext?: {
    location?: string;
    propertyType?: string;
    businessType?: string;
  };
}

const CoverageAnalyzer = ({ analysis, userContext }: CoverageAnalyzerProps) => {
  const [coverageAnalysis, setCoverageAnalysis] = useState<CoverageAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (analysis?.summary) {
      performCoverageAnalysis();
    }
  }, [analysis, userContext]);

  const performCoverageAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      console.log('Starting coverage analysis...');
      
      // Simulate AI-powered coverage analysis
      const mockAnalysis: CoverageAnalysis = {
        totalCoverages: 12,
        adequateCoverages: 8,
        insufficientCoverages: 2,
        missingCoverages: 2,
        overallRiskScore: 75,
        riskAssessments: [
          {
            riskType: 'Fire Damage',
            likelihood: 'Medium',
            impact: 'High',
            priority: 'High',
            description: 'Fire coverage adequate for building value',
            mitigation: 'Install smoke detectors and fire suppression systems'
          },
          {
            riskType: 'Theft/Burglary',
            likelihood: 'High',
            impact: 'Medium',
            priority: 'High',
            description: 'Theft coverage present but may be insufficient for high-value items',
            mitigation: 'Consider security system upgrade and additional coverage'
          },
          {
            riskType: 'Flood Damage',
            likelihood: 'Low',
            impact: 'High',
            priority: 'Critical',
            description: 'No flood coverage detected - high risk area',
            mitigation: 'Add flood insurance immediately'
          },
          {
            riskType: 'Cyber Liability',
            likelihood: 'High',
            impact: 'High',
            priority: 'Critical',
            description: 'No cyber liability coverage found',
            mitigation: 'Essential for modern business operations'
          }
        ],
        coverageBreakdown: [
          { category: 'Property Damage', status: 'Adequate', details: 'Building and contents covered up to £500,000' },
          { category: 'Public Liability', status: 'Adequate', details: '£2M coverage meets industry standards' },
          { category: 'Employers Liability', status: 'Adequate', details: '£10M coverage compliant' },
          { category: 'Professional Indemnity', status: 'Insufficient', details: '£100K may be too low for business size' },
          { category: 'Cyber Security', status: 'Missing', details: 'No cyber coverage detected' },
          { category: 'Business Interruption', status: 'Adequate', details: '12 months coverage included' }
        ]
      };

      // Add location-based risk adjustments
      if (userContext?.location?.toLowerCase().includes('london')) {
        mockAnalysis.riskAssessments[1].likelihood = 'High';
        mockAnalysis.riskAssessments[1].priority = 'Critical';
      }
      
      setCoverageAnalysis(mockAnalysis);
    } catch (err) {
      console.error('Coverage analysis failed:', err);
      setError('Failed to analyze coverage. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Adequate': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Insufficient': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'Missing': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const pieChartData = coverageAnalysis ? [
    { name: 'Adequate', value: coverageAnalysis.adequateCoverages, color: '#10B981' },
    { name: 'Insufficient', value: coverageAnalysis.insufficientCoverages, color: '#F59E0B' },
    { name: 'Missing', value: coverageAnalysis.missingCoverages, color: '#EF4444' }
  ] : [];

  const riskChartData = coverageAnalysis ? 
    coverageAnalysis.riskAssessments.map(risk => ({
      name: risk.riskType,
      priority: risk.priority === 'Critical' ? 4 : risk.priority === 'High' ? 3 : risk.priority === 'Medium' ? 2 : 1,
      color: risk.priority === 'Critical' ? '#EF4444' : 
             risk.priority === 'High' ? '#F59E0B' : 
             risk.priority === 'Medium' ? '#EAB308' : '#10B981'
    })) : [];

  if (isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Coverage Analysis & Risk Assessment
          </CardTitle>
          <CardDescription>Analyzing your policy coverage and assessing risks...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Performing comprehensive coverage and risk analysis...</p>
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

  if (!coverageAnalysis) return null;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {coverageAnalysis.overallRiskScore}%
              </div>
              <p className="text-sm text-muted-foreground">Overall Risk Score</p>
              <Progress value={coverageAnalysis.overallRiskScore} className="mt-2" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {coverageAnalysis.adequateCoverages}
              </div>
              <p className="text-sm text-muted-foreground">Adequate Coverages</p>
              <Badge variant="default" className="mt-2">Protected</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {coverageAnalysis.insufficientCoverages}
              </div>
              <p className="text-sm text-muted-foreground">Insufficient Coverage</p>
              <Badge variant="secondary" className="mt-2">Review Needed</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {coverageAnalysis.missingCoverages}
              </div>
              <p className="text-sm text-muted-foreground">Missing Coverage</p>
              <Badge variant="destructive" className="mt-2">Action Required</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Coverage Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={100}
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
            <CardTitle>Risk Priority Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={riskChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="priority">
                  {riskChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Risk Assessment Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Risk Assessment Matrix
          </CardTitle>
          <CardDescription>
            Detailed risk analysis based on your policy and context
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Risk Type</TableHead>
                <TableHead>Likelihood</TableHead>
                <TableHead>Impact</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Mitigation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coverageAnalysis.riskAssessments.map((risk, index) => (
                <TableRow key={index} className={getRiskColor(risk.priority)}>
                  <TableCell className="font-medium">{risk.riskType}</TableCell>
                  <TableCell>
                    <Badge variant={risk.likelihood === 'High' ? 'destructive' : 
                                  risk.likelihood === 'Medium' ? 'secondary' : 'default'}>
                      {risk.likelihood}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={risk.impact === 'High' ? 'destructive' : 
                                  risk.impact === 'Medium' ? 'secondary' : 'default'}>
                      {risk.impact}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={risk.priority === 'Critical' ? 'destructive' : 
                                  risk.priority === 'High' ? 'secondary' : 'default'}>
                      {risk.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{risk.mitigation}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Coverage Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Coverage Breakdown
          </CardTitle>
          <CardDescription>
            Detailed analysis of each coverage area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coverageAnalysis.coverageBreakdown.map((coverage, index) => (
              <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  {getStatusIcon(coverage.status)}
                  <div>
                    <h4 className="font-medium">{coverage.category}</h4>
                    <p className="text-sm text-muted-foreground">{coverage.details}</p>
                  </div>
                </div>
                <Badge variant={coverage.status === 'Adequate' ? 'default' : 
                              coverage.status === 'Insufficient' ? 'secondary' : 'destructive'}>
                  {coverage.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoverageAnalyzer;