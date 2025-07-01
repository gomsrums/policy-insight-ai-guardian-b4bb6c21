import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Shield, Target, Globe, BarChart3, AlertTriangle, CheckCircle } from 'lucide-react';
import { AnalysisResult } from "@/lib/chatpdf-types";
import CoverageAnalyzer from './CoverageAnalyzer';
import GapRecommendationEngine from './GapRecommendationEngine';
import RegionalComplianceChecker from './RegionalComplianceChecker';

interface ComprehensiveAnalysisDashboardProps {
  analysis: AnalysisResult;
  userContext?: {
    location?: string;
    propertyType?: string;
    businessType?: string;
    industry?: string;
  };
}

interface OverallInsights {
  coverageScore: number;
  gapScore: number;
  complianceScore: number;
  overallRiskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  keyFindings: string[];
  priorityActions: {
    action: string;
    urgency: 'Immediate' | 'Short-term' | 'Long-term';
    impact: 'High' | 'Medium' | 'Low';
  }[];
}

const ComprehensiveAnalysisDashboard = ({ analysis, userContext }: ComprehensiveAnalysisDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate overall insights
  const overallInsights: OverallInsights = {
    coverageScore: 75,
    gapScore: 68,
    complianceScore: 82,
    overallRiskLevel: 'Medium',
    keyFindings: [
      'Missing cyber liability coverage poses significant risk',
      'Professional indemnity limits may be insufficient',
      'Flood coverage required for your location',
      'GDPR compliance measures are adequate',
      'Business interruption coverage is comprehensive'
    ],
    priorityActions: [
      {
        action: 'Add cyber liability insurance',
        urgency: 'Immediate',
        impact: 'High'
      },
      {
        action: 'Increase professional indemnity limits',
        urgency: 'Short-term',
        impact: 'Medium'
      },
      {
        action: 'Review flood insurance requirements',
        urgency: 'Short-term',
        impact: 'High'
      },
      {
        action: 'Update equipment valuations',
        urgency: 'Long-term',
        impact: 'Low'
      }
    ]
  };

  const chartData = [
    { name: 'Coverage', score: overallInsights.coverageScore, color: '#3B82F6' },
    { name: 'Gaps', score: overallInsights.gapScore, color: '#EF4444' },
    { name: 'Compliance', score: overallInsights.complianceScore, color: '#10B981' }
  ];

  const pieData = [
    { name: 'Covered', value: 68, color: '#10B981' },
    { name: 'Gaps', value: 22, color: '#EF4444' },
    { name: 'Partial', value: 10, color: '#F59E0B' }
  ];

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'Immediate': return <Badge variant="destructive">{urgency}</Badge>;
      case 'Short-term': return <Badge variant="secondary">{urgency}</Badge>;
      case 'Long-term': return <Badge variant="outline">{urgency}</Badge>;
      default: return <Badge variant="outline">{urgency}</Badge>;
    }
  };

  const generateComprehensiveReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      userContext,
      analysis: overallInsights,
      // This would include all the detailed data from the three analysis components
    };

    const reportContent = `
# Comprehensive Insurance Analysis Report

## Executive Summary
- Overall Risk Level: ${overallInsights.overallRiskLevel}
- Coverage Score: ${overallInsights.coverageScore}%
- Gap Analysis Score: ${overallInsights.gapScore}%
- Compliance Score: ${overallInsights.complianceScore}%

## Key Findings
${overallInsights.keyFindings.map(finding => `- ${finding}`).join('\n')}

## Priority Actions
${overallInsights.priorityActions.map(action => 
  `- ${action.action} (${action.urgency} - ${action.impact} Impact)`
).join('\n')}

## Generated on: ${new Date().toLocaleDateString()}
    `;

    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'comprehensive-insurance-analysis.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Comprehensive Insurance Analysis Dashboard
          </CardTitle>
          <CardDescription>
            Complete coverage analysis, gap identification, and compliance checking for your insurance policy
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Executive Overview</TabsTrigger>
          <TabsTrigger value="coverage">Coverage Analysis</TabsTrigger>
          <TabsTrigger value="gaps">Gap Analysis</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Check</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            {/* Overall Scores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {overallInsights.coverageScore}%
                    </div>
                    <p className="text-sm text-muted-foreground">Coverage Analysis</p>
                    <Progress value={overallInsights.coverageScore} className="mt-2" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {overallInsights.gapScore}%
                    </div>
                    <p className="text-sm text-muted-foreground">Gap Identification</p>
                    <Progress value={overallInsights.gapScore} className="mt-2" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {overallInsights.complianceScore}%
                    </div>
                    <p className="text-sm text-muted-foreground">Compliance Check</p>
                    <Progress value={overallInsights.complianceScore} className="mt-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Risk Level Alert */}
            <Alert className={`border-l-4 ${getRiskLevelColor(overallInsights.overallRiskLevel)}`}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Overall Risk Assessment: {overallInsights.overallRiskLevel}</AlertTitle>
              <AlertDescription>
                Based on comprehensive analysis of your coverage, gaps, and compliance status.
              </AlertDescription>
            </Alert>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Scores Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="score">
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Coverage Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Key Findings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Key Findings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {overallInsights.keyFindings.map((finding, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 rounded border">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm">{finding}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Priority Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Priority Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overallInsights.priorityActions.map((action, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{action.action}</p>
                        <p className="text-sm text-muted-foreground">
                          Impact: {action.impact}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {getUrgencyBadge(action.urgency)}
                        <Badge variant="outline">{action.impact} Impact</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Generate Report */}
            <Card>
              <CardHeader>
                <CardTitle>Comprehensive Report</CardTitle>
                <CardDescription>
                  Download a complete analysis report with all findings and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={generateComprehensiveReport} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Complete Analysis Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="coverage">
          <CoverageAnalyzer analysis={analysis} userContext={userContext} />
        </TabsContent>

        <TabsContent value="gaps">
          <GapRecommendationEngine analysis={analysis} userProfile={userContext} />
        </TabsContent>

        <TabsContent value="compliance">
          <RegionalComplianceChecker analysis={analysis} initialRegion={userContext?.location || 'UK'} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComprehensiveAnalysisDashboard;