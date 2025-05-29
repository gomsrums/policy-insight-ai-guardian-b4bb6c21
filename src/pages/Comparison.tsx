
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import LoginDialog from "@/components/LoginDialog";
import { uploadDocumentForAnalysis } from "@/services/insurance-api";
import { PolicyDocument, AnalysisResult } from "@/lib/chatpdf-types";
import { nanoid } from "nanoid";

interface ComparisonResult {
  name: string;
  riskCover: string;
  coverageGap: string;
  benchmarkRating: number;
  premiumComparison: string;
  coverageLimit: string;
  missingCoverages: string[];
}

const Comparison = () => {
  const [quotation1, setQuotation1] = useState("");
  const [quotation2, setQuotation2] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<{
    policy1: ComparisonResult;
    policy2: ComparisonResult;
  } | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const createPDFFromText = async (text: string, filename: string): Promise<File> => {
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length ${text.length + 100}
>>
stream
BT
/F1 12 Tf
50 750 Td
(${text.replace(/\n/g, ') Tj 0 -14 Td (')}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000173 00000 n 
0000000301 00000 n 
0000000380 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
456
%%EOF`;

    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    return new File([blob], filename, { type: 'application/pdf' });
  };

  const analyzeWithChatPDF = async (text: string, policyName: string): Promise<ComparisonResult> => {
    try {
      // Convert text to PDF
      const pdfFile = await createPDFFromText(text, `${policyName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      
      // Create PolicyDocument for ChatPDF analysis
      const document: PolicyDocument = {
        id: nanoid(),
        name: policyName,
        type: "file",
        file: pdfFile,
        status: "processing",
      };

      // Analyze with ChatPDF
      const analysis: AnalysisResult = await uploadDocumentForAnalysis(document);
      
      // Extract specific information from the analysis
      const riskCover = analysis.risk_assessment?.overall_risk_level || "Medium";
      
      // Extract coverage gap level from analysis
      let coverageGap = "Low";
      if (analysis.gaps.length > 3) coverageGap = "High";
      else if (analysis.gaps.length > 1) coverageGap = "Medium";

      // Calculate benchmark rating based on analysis quality
      const benchmarkRating = Math.max(1, 10 - (analysis.gaps.length * 1.5));

      // Extract premium info from summary
      const premiumMatch = analysis.summary.match(/\$[\d,]+/);
      const premiumComparison = premiumMatch ? `${premiumMatch[0]}/year` : "Premium not specified";

      // Extract coverage limits
      const limitMatch = analysis.summary.match(/\$[\d,]+,000|\$[\d,]+k/i);
      const coverageLimit = limitMatch ? limitMatch[0] : "Limits not specified";

      // Use the gaps as missing coverages
      const missingCoverages = analysis.gaps.slice(0, 3);

      return {
        name: policyName,
        riskCover,
        coverageGap,
        benchmarkRating: Math.round(benchmarkRating * 10) / 10,
        premiumComparison,
        coverageLimit,
        missingCoverages
      };
    } catch (error) {
      console.error(`Error analyzing ${policyName} with ChatPDF:`, error);
      throw error;
    }
  };

  const handleCompare = async () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }

    if (!quotation1.trim() || !quotation2.trim()) {
      toast({
        title: "Missing Information",
        description: "Please paste both insurance policy quotations to compare.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      toast({
        title: "Converting and Analyzing",
        description: "Converting your policy texts to PDF and analyzing with ChatPDF...",
      });

      // Analyze both policies with ChatPDF
      const [policy1Analysis, policy2Analysis] = await Promise.all([
        analyzeWithChatPDF(quotation1, "Policy A"),
        analyzeWithChatPDF(quotation2, "Policy B")
      ]);

      setComparisonResults({
        policy1: policy1Analysis,
        policy2: policy2Analysis
      });

      toast({
        title: "Comparison Complete",
        description: "Your insurance policies have been analyzed and compared using ChatPDF.",
      });
    } catch (error) {
      console.error("Error analyzing policies:", error);
      toast({
        title: "Analysis Failed", 
        description: "There was an error analyzing your policies with ChatPDF. Please try again.",
        variant: "destructive",
      });
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

  const getGapBadgeVariant = (level: string) => {
    switch (level) {
      case "High": return "destructive";
      case "Medium": return "secondary";
      case "Low": return "default";
      default: return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-insurance-blue-dark mb-2">
              Policy Comparison
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Compare two insurance policy quotations side-by-side using ChatPDF AI analysis
            </p>
          </div>

          {!isAuthenticated && (
            <div className="mb-8 p-6 border border-yellow-200 bg-yellow-50 rounded-lg">
              <div className="text-center space-y-4">
                <p className="text-yellow-800">
                  Please log in to access the policy comparison feature
                </p>
                <Button
                  onClick={() => setShowLoginDialog(true)}
                  className="bg-insurance-blue hover:bg-insurance-blue-dark"
                >
                  Login to Compare
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Policy Quotation 1</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste your first insurance policy quotation here..."
                  value={quotation1}
                  onChange={(e) => setQuotation1(e.target.value)}
                  className="min-h-[200px]"
                  disabled={!isAuthenticated || isAnalyzing}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Policy Quotation 2</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste your second insurance policy quotation here..."
                  value={quotation2}
                  onChange={(e) => setQuotation2(e.target.value)}
                  className="min-h-[200px]"
                  disabled={!isAuthenticated || isAnalyzing}
                />
              </CardContent>
            </Card>
          </div>

          <div className="text-center mb-8">
            <Button 
              onClick={handleCompare}
              disabled={isAnalyzing || !isAuthenticated || !quotation1.trim() || !quotation2.trim()}
              className="bg-insurance-blue hover:bg-insurance-blue-dark px-8 py-3"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting & Analyzing with ChatPDF...
                </>
              ) : "Convert to PDF & Compare with ChatPDF"}
            </Button>
          </div>

          {comparisonResults && (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>ChatPDF Analysis Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Parameter</TableHead>
                        <TableHead>{comparisonResults.policy1.name}</TableHead>
                        <TableHead>{comparisonResults.policy2.name}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Risk Cover</TableCell>
                        <TableCell>
                          <Badge variant={getRiskBadgeVariant(comparisonResults.policy1.riskCover)}>
                            {comparisonResults.policy1.riskCover}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRiskBadgeVariant(comparisonResults.policy2.riskCover)}>
                            {comparisonResults.policy2.riskCover}
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Coverage Gap</TableCell>
                        <TableCell>
                          <Badge variant={getGapBadgeVariant(comparisonResults.policy1.coverageGap)}>
                            {comparisonResults.policy1.coverageGap}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getGapBadgeVariant(comparisonResults.policy2.coverageGap)}>
                            {comparisonResults.policy2.coverageGap}
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Benchmark Rating</TableCell>
                        <TableCell>
                          <span className="font-semibold text-green-600">
                            {comparisonResults.policy1.benchmarkRating}/10
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-green-600">
                            {comparisonResults.policy2.benchmarkRating}/10
                          </span>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Premium Comparison</TableCell>
                        <TableCell>{comparisonResults.policy1.premiumComparison}</TableCell>
                        <TableCell>{comparisonResults.policy2.premiumComparison}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Coverage Limit</TableCell>
                        <TableCell>{comparisonResults.policy1.coverageLimit}</TableCell>
                        <TableCell>{comparisonResults.policy2.coverageLimit}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Missing Coverages</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {comparisonResults.policy1.missingCoverages.map((coverage: string, index: number) => (
                              <Badge key={index} variant="outline" className="mr-1 mb-1">
                                {coverage}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {comparisonResults.policy2.missingCoverages.map((coverage: string, index: number) => (
                              <Badge key={index} variant="outline" className="mr-1 mb-1">
                                {coverage}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {!comparisonResults && !isAnalyzing && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {isAuthenticated 
                  ? "Paste your insurance policy quotations above and click \"Convert to PDF & Compare\" to see detailed analysis results using ChatPDF"
                  : "Please log in to compare insurance policies"
                }
              </p>
            </div>
          )}
        </div>
      </main>
      
      <LoginDialog
        isOpen={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
      />
    </div>
  );
};

export default Comparison;
