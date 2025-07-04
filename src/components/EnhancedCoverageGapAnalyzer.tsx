
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MessageCircle, AlertTriangle, BarChart3, Shield, Loader2 } from 'lucide-react';
import { AnalysisResult } from "@/lib/chatpdf-types";
import { ComprehensiveRiskAssessor, ComprehensiveRiskAssessment } from "@/services/comprehensive-risk-assessor";
import ComprehensiveRiskDashboard from './ComprehensiveRiskDashboard';

interface EnhancedCoverageGapAnalyzerProps {
  analysis: AnalysisResult;
  policyType?: string;
  region?: string;
}

const EnhancedCoverageGapAnalyzer = ({ 
  analysis, 
  policyType = "general",
  region = "UK"
}: EnhancedCoverageGapAnalyzerProps) => {
  const [riskAssessment, setRiskAssessment] = useState<ComprehensiveRiskAssessment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const performRiskAssessment = async () => {
    setIsLoading(true);
    try {
      // Mock business profile - in real app, this would come from user input
      const businessProfile = {
        industry: 'Professional Services',
        employeeCount: 25,
        annualRevenue: 2500000,
        businessType: 'Service'
      };

      const assessment = await ComprehensiveRiskAssessor.assessRisk(analysis, businessProfile);
      setRiskAssessment(assessment);
      setActiveTab("risk-assessment");
    } catch (error) {
      console.error("Error performing risk assessment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Automatically perform risk assessment when component mounts
    if (analysis && !riskAssessment) {
      performRiskAssessment();
    }
  }, [analysis]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Enhanced Coverage & Risk Analysis
        </CardTitle>
        <CardDescription>
          Comprehensive policy analysis with risk assessment and financial exposure calculation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="risk-assessment" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Risk Assessment
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="space-y-4">
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Policy Analysis Complete</h3>
                <p className="text-muted-foreground mb-4">
                  Your policy document has been processed and analyzed. Use the chat feature to get instant answers 
                  about your policy terms, coverage limits, and exclusions.
                </p>
                <Button 
                  onClick={performRiskAssessment} 
                  disabled={isLoading}
                  className="mr-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Run Risk Assessment
                    </>
                  )}
                </Button>
              </div>

              {/* Quick Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Analysis Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {analysis.summary?.substring(0, 200)}...
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>Risk Level: {analysis.risk_assessment?.overall_risk_level || 'Not assessed'}</div>
                      <div>Gaps Identified: {analysis.gaps?.length || 0}</div>
                      <div>Recommendations: {analysis.recommendations?.length || 0}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="risk-assessment" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span>Performing comprehensive risk assessment...</span>
              </div>
            ) : riskAssessment ? (
              <ComprehensiveRiskDashboard assessment={riskAssessment} />
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Risk Assessment Not Started</h3>
                <p className="text-muted-foreground mb-4">
                  Click "Run Risk Assessment" to perform a comprehensive analysis of your policy risks.
                </p>
                <Button onClick={performRiskAssessment}>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Start Risk Assessment
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="space-y-6">
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
                <p className="text-muted-foreground">
                  Detailed analytics and trends will be available here in future updates.
                </p>
              </div>

              {riskAssessment && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Risk Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {riskAssessment.prioritizedRisks.slice(0, 5).map((risk, index) => (
                          <div key={risk.id} className="flex justify-between text-sm">
                            <span>{risk.category}</span>
                            <span className="font-medium">{risk.impact}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Financial Impact</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ${(riskAssessment.totalFinancialExposure / 1000000).toFixed(1)}M
                      </div>
                      <p className="text-sm text-muted-foreground">Total exposure</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Mitigation ROI</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {riskAssessment.recommendations.length > 0 
                          ? riskAssessment.recommendations[0].roiScore.toFixed(1) 
                          : 'N/A'}
                      </div>
                      <p className="text-sm text-muted-foreground">Best ROI action</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedCoverageGapAnalyzer;
