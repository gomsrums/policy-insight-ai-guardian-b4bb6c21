
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUploader from "./FileUploader";
import BatchComplianceProcessor from "./BatchComplianceProcessor";
import { EnhancedComplianceAnalyzer } from "./EnhancedComplianceAnalyzer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useBrokerAuth } from "@/contexts/BrokerAuthContext";
import { CheckCircle, XCircle, AlertTriangle, FileText, Shield, Loader2, BarChart3 } from "lucide-react";
import { PolicyDocument } from "@/lib/chatpdf-types";

interface ComplianceIssue {
  type: 'missing_coverage' | 'non_compliant_clause' | 'ambiguous_term';
  description: string;
  regulation: string;
  severity: 'low' | 'medium' | 'high';
}

interface ComplianceReport {
  policyName: string;
  region: string;
  complianceScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  flaggedIssues: ComplianceIssue[];
  recommendations: string[];
  totalRegulations: number;
  passedRegulations: number;
}

const ComplianceChecker = () => {
  const [selectedRegion, setSelectedRegion] = useState("");
  const [policyName, setPolicyName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [uploadedDocument, setUploadedDocument] = useState<PolicyDocument | null>(null);
  const [batchResults, setBatchResults] = useState<any[]>([]);
  const { broker } = useBrokerAuth();
  const { toast } = useToast();

  const regions = [
    "California",
    "Texas", 
    "New York",
    "Florida",
    "Illinois",
    "United Kingdom",
    "Germany",
    "France",
    "Netherlands",
    "India",
    "Singapore"
  ];

  const handleDocumentUpload = (document: PolicyDocument) => {
    console.log("Document uploaded:", document);
    setUploadedDocument(document);
    
    toast({
      title: "Document Uploaded",
      description: `Document "${document.name}" uploaded successfully. Ready for compliance analysis.`,
    });
  };

  const analyzeCompliance = async () => {
    if (!uploadedDocument) {
      toast({
        title: "No Document",
        description: "Please upload a document first.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedRegion || !policyName) {
      toast({
        title: "Missing Information",
        description: "Please select a region and enter a policy name before analyzing.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      console.log("Starting enhanced compliance analysis for document:", uploadedDocument.name);
      
      // Use the enhanced analyzer
      const analysisResult = await EnhancedComplianceAnalyzer.analyzeDocument(
        uploadedDocument, 
        selectedRegion, 
        policyName
      );

      const report: ComplianceReport = {
        policyName,
        region: selectedRegion,
        complianceScore: analysisResult.complianceScore,
        riskLevel: analysisResult.riskLevel,
        flaggedIssues: analysisResult.flaggedIssues,
        recommendations: analysisResult.recommendations,
        totalRegulations: analysisResult.totalRegulations,
        passedRegulations: analysisResult.passedRegulations
      };

      console.log("Enhanced compliance report generated:", report);
      setComplianceReport(report);

      // Save the compliance report to database
      if (broker) {
        const { error: saveError } = await supabase
          .from('compliance_reports')
          .insert({
            broker_id: broker.id,
            policy_name: policyName,
            compliance_score: analysisResult.complianceScore,
            risk_level: analysisResult.riskLevel,
            flagged_issues: JSON.parse(JSON.stringify(analysisResult.flaggedIssues)),
            recommendations: JSON.parse(JSON.stringify(analysisResult.recommendations))
          });

        if (saveError) {
          console.error("Error saving compliance report:", saveError);
        } else {
          console.log("Compliance report saved to database");
        }
      }

      toast({
        title: "Compliance Analysis Complete",
        description: `Analysis completed. Compliance Score: ${analysisResult.complianceScore}%. Found ${analysisResult.flaggedIssues.length} potential issues.`,
      });

    } catch (error) {
      console.error("Compliance analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze policy for compliance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'high': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single">Single Document Analysis</TabsTrigger>
          <TabsTrigger value="batch">Batch Processing</TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Regulatory Compliance Checker
              </CardTitle>
              <CardDescription>
                Upload a policy document to check compliance with regional regulations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="policy-name">Policy Name</Label>
                  <Input
                    id="policy-name"
                    placeholder="Enter policy name"
                    value={policyName}
                    onChange={(e) => setPolicyName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Policy Document</Label>
                <FileUploader 
                  onFileAdded={handleDocumentUpload}
                />
              </div>

              {uploadedDocument && (
                <Alert className="border-green-200 bg-green-50">
                  <FileText className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Document "{uploadedDocument.name}" uploaded successfully. Ready for compliance analysis.
                  </AlertDescription>
                </Alert>
              )}

              {uploadedDocument && selectedRegion && policyName && (
                <div className="flex justify-center">
                  <Button
                    onClick={analyzeCompliance}
                    disabled={isAnalyzing}
                    className="bg-insurance-blue hover:bg-insurance-blue-dark"
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing Compliance...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Analyze Compliance
                      </>
                    )}
                  </Button>
                </div>
              )}

              {isAnalyzing && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    Analyzing policy document for regulatory compliance against {selectedRegion} regulations...
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch">
          <BatchComplianceProcessor 
            region={selectedRegion}
            onAnalysisComplete={setBatchResults}
          />
          
          {batchResults.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Batch Analysis Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{batchResults.length}</div>
                    <div className="text-sm text-gray-600">Documents Processed</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(batchResults.reduce((acc, r) => acc + r.complianceScore, 0) / batchResults.length)}%
                    </div>
                    <div className="text-sm text-gray-600">Average Compliance</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {batchResults.filter(r => r.riskLevel === 'high').length}
                    </div>
                    <div className="text-sm text-gray-600">High Risk Documents</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {complianceReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Compliance Report: {complianceReport.policyName}
            </CardTitle>
            <CardDescription>
              Region: {complianceReport.region} | Analysis completed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Compliance Score */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold">Compliance Score</h3>
                <p className="text-sm text-gray-600">
                  {complianceReport.passedRegulations} of {complianceReport.totalRegulations} regulations met
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-insurance-blue">
                  {complianceReport.complianceScore}%
                </div>
                <Badge className={getRiskBadgeColor(complianceReport.riskLevel)}>
                  {complianceReport.riskLevel.toUpperCase()} RISK
                </Badge>
              </div>
            </div>

            {/* Flagged Issues */}
            {complianceReport.flaggedIssues.length > 0 ? (
              <div className="space-y-3">
                <h3 className="font-semibold text-red-700">Flagged Issues ({complianceReport.flaggedIssues.length})</h3>
                {complianceReport.flaggedIssues.map((issue, index) => (
                  <Alert key={index} className="border-red-200">
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(issue.severity)}
                      <div className="flex-1">
                        <AlertDescription className="font-medium">
                          {issue.description}
                        </AlertDescription>
                        <p className="text-sm text-gray-600 mt-1">
                          Regulation: {issue.regulation}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {issue.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${
                            issue.severity === 'high' ? 'text-red-600' : 
                            issue.severity === 'medium' ? 'text-orange-600' : 'text-yellow-600'
                          }`}>
                            {issue.severity.toUpperCase()} SEVERITY
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            ) : (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  No compliance issues detected. The policy appears to meet all regulatory requirements.
                </AlertDescription>
              </Alert>
            )}

            {/* Recommendations */}
            {complianceReport.recommendations.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-green-700">Recommendations ({complianceReport.recommendations.length})</h3>
                <div className="space-y-2">
                  {complianceReport.recommendations.map((recommendation, index) => (
                    <Alert key={index} className="border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertDescription>{recommendation}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button className="bg-insurance-blue hover:bg-insurance-blue-dark">
                Download Report
              </Button>
              <Button variant="outline">
                Save for Later
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setComplianceReport(null);
                  setUploadedDocument(null);
                  setPolicyName("");
                  setSelectedRegion("");
                }}
              >
                New Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComplianceChecker;
