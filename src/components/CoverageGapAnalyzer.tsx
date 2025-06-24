
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AnalysisResult } from "@/lib/chatpdf-types";
import { analyzeCoverageGaps } from "@/services/coverage-gap-service";

interface CoverageGap {
  category: string;
  missing: string[];
  insufficient: string[];
  recommendations: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  coverageScore: number;
}

interface CoverageGapAnalyzerProps {
  analysis: AnalysisResult;
  policyType?: string;
  region?: string;
}

const CoverageGapAnalyzer = ({ 
  analysis, 
  policyType = "general", 
  region = "UK" 
}: CoverageGapAnalyzerProps) => {
  const [coverageGaps, setCoverageGaps] = useState<CoverageGap[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [overallScore, setOverallScore] = useState(0);

  useEffect(() => {
    if (analysis) {
      analyzePolicyGaps();
    }
  }, [analysis]);

  const analyzePolicyGaps = async () => {
    setIsAnalyzing(true);
    try {
      const gaps = await analyzeCoverageGaps(analysis.summary, policyType, region);
      setCoverageGaps(gaps);
      
      // Calculate overall coverage score
      const avgScore = gaps.reduce((sum, gap) => sum + gap.coverageScore, 0) / gaps.length;
      setOverallScore(Math.round(avgScore));
    } catch (error) {
      console.error('Error analyzing coverage gaps:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case "High": return "destructive";
      case "Medium": return "secondary";
      case "Low": return "default";
      default: return "outline";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  if (isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Coverage Gap Analysis</CardTitle>
          <CardDescription>Analyzing your policy against UK insurance standards...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Comparing coverage against benchmarks...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Coverage Score */}
      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center justify-between">
            Coverage Gap Analysis
            <Badge variant="outline" className={`text-lg font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}% Complete
            </Badge>
          </CardTitle>
          <CardDescription>
            Analysis based on UK insurance standards and FCA guidelines
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Coverage Completeness</span>
                <span className={getScoreColor(overallScore)}>{overallScore}%</span>
              </div>
              <Progress value={overallScore} className="h-3" />
            </div>
            
            {overallScore < 70 && (
              <Alert>
                <AlertTitle>Coverage Improvement Needed</AlertTitle>
                <AlertDescription>
                  Your policy has significant gaps compared to UK insurance standards. 
                  Review the recommendations below to improve your coverage.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Gap Analysis */}
      <Tabs defaultValue="gaps" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gaps">Coverage Gaps</TabsTrigger>
          <TabsTrigger value="comparison">Benchmark Comparison</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="gaps" className="space-y-4">
          {coverageGaps.map((gap, index) => (
            <Card key={index} className="border-l-4 border-l-red-400">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {gap.category}
                  <div className="flex gap-2">
                    <Badge variant={getRiskBadgeVariant(gap.riskLevel)}>
                      {gap.riskLevel} Risk
                    </Badge>
                    <Badge variant="outline" className={getScoreColor(gap.coverageScore)}>
                      {gap.coverageScore}%
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gap.missing.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-red-600 mb-2">Missing Coverage</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {gap.missing.map((item, idx) => (
                          <li key={idx} className="text-sm text-gray-700">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {gap.insufficient.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-amber-600 mb-2">Insufficient Coverage</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {gap.insufficient.map((item, idx) => (
                          <li key={idx} className="text-sm text-gray-700">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>UK Insurance Benchmark Comparison</CardTitle>
              <CardDescription>
                How your policy compares to standard UK insurance coverage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Coverage Category</TableHead>
                    <TableHead>Your Policy</TableHead>
                    <TableHead>UK Standard</TableHead>
                    <TableHead>Gap Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coverageGaps.map((gap, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{gap.category}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={gap.coverageScore} className="h-2" />
                          <span className="text-xs text-gray-500">{gap.coverageScore}% covered</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">100% Expected</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={gap.coverageScore >= 80 ? "default" : gap.coverageScore >= 60 ? "secondary" : "destructive"}>
                          {100 - gap.coverageScore}% Gap
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {coverageGaps.map((gap, index) => (
            <Card key={index} className="border-l-4 border-l-green-400">
              <CardHeader>
                <CardTitle>{gap.category} Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {gap.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="text-sm font-medium text-green-800">{rec}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <h4 className="font-semibold text-blue-800 mb-2">Next Steps</h4>
                <p className="text-sm text-blue-700 mb-4">
                  Contact your insurance broker to discuss these coverage improvements
                </p>
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  Export Gap Analysis Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoverageGapAnalyzer;
