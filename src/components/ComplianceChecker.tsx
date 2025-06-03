
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import FileUploader from "./FileUploader";
import { uploadDocumentForAnalysis } from "@/services/insurance-api";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useBrokerAuth } from "@/contexts/BrokerAuthContext";
import { CheckCircle, XCircle, AlertTriangle, FileText, Shield, Loader2 } from "lucide-react";

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

  const handleDocumentUpload = async (document: any) => {
    if (!selectedRegion || !policyName) {
      toast({
        title: "Missing Information",
        description: "Please select a region and enter a policy name before uploading.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      console.log("Starting compliance analysis for document:", document.name);
      
      // First, analyze the document using the existing API
      const analysis = await uploadDocumentForAnalysis(document);
      
      // Get regulations for the selected region
      const { data: regulations, error: regError } = await supabase
        .from('regulations')
        .select('*')
        .eq('region', selectedRegion);

      if (regError) {
        throw new Error("Failed to fetch regulations");
      }

      // Simulate compliance checking logic
      const totalRegulations = regulations?.length || 0;
      const flaggedIssues: ComplianceIssue[] = [];
      
      // Check for specific compliance issues based on regulations
      regulations?.forEach((regulation) => {
        const summaryLower = analysis.summary.toLowerCase();
        const regulationTextLower = regulation.regulation_text.toLowerCase();
        
        if (regulation.mandatory) {
          if (regulation.category === 'coverage') {
            if (regulationTextLower.includes('mental health') && !summaryLower.includes('mental health')) {
              flaggedIssues.push({
                type: 'missing_coverage',
                description: 'Missing mandatory mental health services coverage',
                regulation: regulation.regulation_text,
                severity: 'high'
              });
            }
            if (regulationTextLower.includes('liability') && !summaryLower.includes('liability')) {
              flaggedIssues.push({
                type: 'missing_coverage',
                description: 'Missing required liability coverage',
                regulation: regulation.regulation_text,
                severity: 'high'
              });
            }
          }
          
          if (regulation.category === 'premiums') {
            if (regulationTextLower.includes('premium increase') && summaryLower.includes('increase')) {
              flaggedIssues.push({
                type: 'non_compliant_clause',
                description: 'Premium increase clause may not comply with regulations',
                regulation: regulation.regulation_text,
                severity: 'medium'
              });
            }
          }
        }
      });

      // Add some additional checks based on analysis gaps
      analysis.gaps.forEach((gap, index) => {
        if (index < 2) { // Limit to first 2 gaps
          flaggedIssues.push({
            type: 'missing_coverage',
            description: gap,
            regulation: 'General coverage requirement',
            severity: 'medium'
          });
        }
      });

      const passedRegulations = totalRegulations - flaggedIssues.length;
      const complianceScore = totalRegulations > 0 ? Math.round((passedRegulations / totalRegulations) * 100) : 0;
      
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (complianceScore < 60) riskLevel = 'high';
      else if (complianceScore < 80) riskLevel = 'medium';

      const report: ComplianceReport = {
        policyName,
        region: selectedRegion,
        complianceScore,
        riskLevel,
        flaggedIssues,
        recommendations: analysis.recommendations.slice(0, 5),
        totalRegulations,
        passedRegulations
      };

      setComplianceReport(report);

      // Save the compliance report to database - fix the insert call
      if (broker) {
        await supabase
          .from('compliance_reports')
          .insert({
            broker_id: broker.id,
            policy_name: policyName,
            compliance_score: complianceScore,
            risk_level: riskLevel,
            flagged_issues: JSON.parse(JSON.stringify(flaggedIssues)),
            recommendations: JSON.parse(JSON.stringify(analysis.recommendations))
          });
      }

      toast({
        title: "Compliance Analysis Complete",
        description: `Found ${flaggedIssues.length} potential compliance issues.`,
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
              onDocumentUploaded={handleDocumentUpload}
              showTakePhotoOnly={false}
            />
          </div>

          {isAnalyzing && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Analyzing policy document for regulatory compliance...
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {complianceReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Compliance Report: {complianceReport.policyName}
            </CardTitle>
            <CardDescription>
              Region: {complianceReport.region}
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
            {complianceReport.flaggedIssues.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-red-700">Flagged Issues</h3>
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
                        <Badge variant="outline" className="mt-2">
                          {issue.type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {complianceReport.recommendations.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-green-700">Recommendations</h3>
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComplianceChecker;
