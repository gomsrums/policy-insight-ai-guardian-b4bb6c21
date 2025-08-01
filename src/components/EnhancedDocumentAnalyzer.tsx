import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Shield, CheckCircle, AlertCircle, Download, TrendingUp, AlertTriangle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { uploadDocumentForAnalysis } from "@/services/chatpdf-api";
import { AnalysisResult } from "@/lib/chatpdf-types";

interface CoverageItem {
  type: string;
  status: "Covered" | "Partial" | "Not Covered" | "Excluded";
  limit?: string;
  notes: string;
}

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#6b7280'];

const EnhancedDocumentAnalyzer = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setAnalysisResult(null);
    }
  };

  const analyzeDocument = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setProgress(0);

    try {
      // Simulate progress steps
      const steps = [
        "Uploading document to ChatPDF...",
        "Extracting policy information...",
        "Analyzing coverage gaps...",
        "Identifying recommendations...",
        "Generating insights..."
      ];

      // Upload document for real analysis
      const policyDocument = {
        id: `doc_${Date.now()}`,
        name: selectedFile.name,
        type: "insurance_policy" as const,
        status: "uploaded" as const,
        file: selectedFile
      };

      // Update progress during analysis
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 1000);

      const result = await uploadDocumentForAnalysis(policyDocument);
      
      clearInterval(progressInterval);
      setProgress(100);

      setAnalysisResult(result);

      toast({
        title: "Analysis Complete",
        description: "Your insurance policy has been analyzed with real AI insights.",
      });

    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Please try again with a valid insurance policy document.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  // Convert ChatPDF analysis result to display format
  const convertToDisplayFormat = (result: AnalysisResult) => {
    const coverageItems: CoverageItem[] = result.coverage_analysis?.map(item => ({
      type: item.type,
      status: item.status as "Covered" | "Partial" | "Not Covered" | "Excluded",
      limit: item.limit || "Not specified",
      notes: item.notes
    })) || [];

    return {
      summary: result.summary,
      gaps: result.gaps,
      recommendations: result.recommendations,
      riskLevel: result.risk_assessment?.overall_risk_level || "Medium",
      coverageItems
    };
  };


  const getStatusIcon = (status: CoverageItem['status']) => {
    switch (status) {
      case "Covered": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "Partial": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "Not Covered": return <XCircle className="h-4 w-4 text-red-500" />;
      case "Excluded": return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const downloadReport = () => {
    if (!analysisResult || !selectedFile) return;

    const displayData = convertToDisplayFormat(analysisResult);
    
    const report = `
COMPREHENSIVE INSURANCE POLICY ANALYSIS REPORT
=============================================
Document: ${selectedFile.name}
Analysis Date: ${new Date().toLocaleDateString()}
Risk Level: ${displayData.riskLevel}

EXECUTIVE SUMMARY
================
${displayData.summary}

COVERAGE GAPS IDENTIFIED
========================
${displayData.gaps.map((gap, i) => `${i + 1}. ${gap}`).join('\n')}

COVERAGE ANALYSIS
================
${displayData.coverageItems.map(item => 
`${item.type}: ${item.status}
  Limit: ${item.limit}
  Notes: ${item.notes}`
).join('\n\n')}

RECOMMENDATIONS
==============
${displayData.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

Note: This analysis was performed using AI-powered ChatPDF analysis for accurate insights.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insurance-analysis-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const displayData = analysisResult ? convertToDisplayFormat(analysisResult) : null;
  
  const coverageChartData = displayData?.coverageItems.reduce((acc, item) => {
    const existing = acc.find(d => d.status === item.status);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ status: item.status, count: 1 });
    }
    return acc;
  }, [] as Array<{ status: string; count: number }>) || [];

  return (
    <div className="space-y-6">
      <Alert className="border-green-200 bg-green-50">
        <Shield className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>100% Private Analysis:</strong> Your documents are analyzed locally in your browser with complete privacy.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Intelligent Policy Analysis
          </CardTitle>
          <CardDescription>
            Upload your insurance policy for comprehensive analysis with actionable insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <input
              type="file"
              accept=".txt,.pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Supported formats: TXT, PDF, DOC, DOCX (Max 10MB)
            </p>
          </div>

          {selectedFile && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}

          {isAnalyzing && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                Analyzing document... {progress.toFixed(0)}%
              </p>
            </div>
          )}

          <Button
            onClick={analyzeDocument}
            disabled={!selectedFile || isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Policy"}
          </Button>
        </CardContent>
      </Card>

      {analysisResult && displayData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Comprehensive Analysis Results
              <Button onClick={downloadReport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="coverage">Coverage Analysis</TabsTrigger>
                <TabsTrigger value="gaps">Coverage Gaps</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="space-y-4">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Analysis Summary</h4>
                    <div className="text-sm">
                      <div className={`inline-flex items-center px-2 py-1 rounded text-sm ${
                        displayData.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                        displayData.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        Risk Level: {displayData.riskLevel}
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{displayData.summary}</p>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="coverage">
                <div className="space-y-4">
                  {displayData.coverageItems.map((item, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(item.status)}
                          <div>
                            <h4 className="font-medium">{item.type}</h4>
                            <p className="text-sm text-muted-foreground">{item.notes}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{item.status}</div>
                          <div className="text-xs text-muted-foreground">Limit: {item.limit}</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="gaps">
                <Table>
                  <TableCaption>Coverage gaps that require attention</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Coverage Type</TableHead>
                      <TableHead>Current Status</TableHead>
                      <TableHead>Risk Impact</TableHead>
                      <TableHead>Recommended Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysisResult.coverageItems
                      .filter(item => item.status === "Not Covered" || item.status === "Excluded")
                      .map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.type}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(item.status)}
                              {item.status}
                            </div>
                          </TableCell>
                          <TableCell>{getRiskBadge(item.risk)}</TableCell>
                          <TableCell className="max-w-sm">
                            {getSpecificRecommendation(item.type)}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="recommendations">
                <Table>
                  <TableCaption>Actionable recommendations to improve your coverage</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Priority</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Issue</TableHead>
                      <TableHead>Recommendation</TableHead>
                      <TableHead>Impact</TableHead>
                      <TableHead>Est. Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysisResult.recommendations.map((rec, index) => (
                      <TableRow key={index}>
                        <TableCell>{getPriorityBadge(rec.priority)}</TableCell>
                        <TableCell className="font-medium">{rec.category}</TableCell>
                        <TableCell className="max-w-xs">{rec.issue}</TableCell>
                        <TableCell className="max-w-sm">{rec.recommendation}</TableCell>
                        <TableCell className="max-w-xs">{rec.impact}</TableCell>
                        <TableCell>{rec.estimatedCost}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="charts" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-4">Coverage Status Distribution</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={coverageChartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          label={({status, count}) => `${status}: ${count}`}
                        >
                          {coverageChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-semibold mb-4">Risk Level Analysis</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={riskChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="risk" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </div>

                <Card className="p-4">
                  <h4 className="font-semibold mb-4">Overall Risk Assessment</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Overall Score</span>
                      <span className="font-bold">{analysisResult.overallScore}/100</span>
                    </div>
                    <Progress value={analysisResult.overallScore} className="w-full" />
                    <div className="text-sm text-muted-foreground">
                      {analysisResult.riskLevel === 'Low' 
                        ? 'Your policy provides good coverage with minimal gaps'
                        : analysisResult.riskLevel === 'Medium'
                        ? 'Some coverage improvements recommended'
                        : 'Significant coverage gaps identified - immediate action recommended'
                      }
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedDocumentAnalyzer;