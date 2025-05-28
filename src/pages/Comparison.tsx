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

const Comparison = () => {
  const [quotation1, setQuotation1] = useState("");
  const [quotation2, setQuotation2] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<any>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

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
    
    // Simulate API call for comparison
    setTimeout(() => {
      const mockResults = {
        policy1: {
          name: "Policy A",
          riskCover: "High",
          coverageGap: "Medium",
          benchmarkRating: 8.5,
          premiumComparison: "$1,200/year",
          coverageLimit: "$500,000",
          missingCoverages: ["Cyber liability", "Business interruption"]
        },
        policy2: {
          name: "Policy B",
          riskCover: "Medium",
          coverageGap: "Low",
          benchmarkRating: 7.2,
          premiumComparison: "$1,450/year",
          coverageLimit: "$750,000",
          missingCoverages: ["Professional liability"]
        }
      };
      setComparisonResults(mockResults);
      setIsAnalyzing(false);
      
      toast({
        title: "Comparison Complete",
        description: "Your insurance policies have been analyzed and compared.",
      });
    }, 2000);
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
              Compare two insurance policy quotations side-by-side to make an informed decision
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
                  placeholder="Paste your first insurance policy quotation here (including premium, coverage details, and terms & conditions)..."
                  value={quotation1}
                  onChange={(e) => setQuotation1(e.target.value)}
                  className="min-h-[200px]"
                  disabled={!isAuthenticated}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Policy Quotation 2</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste your second insurance policy quotation here (including premium, coverage details, and terms & conditions)..."
                  value={quotation2}
                  onChange={(e) => setQuotation2(e.target.value)}
                  className="min-h-[200px]"
                  disabled={!isAuthenticated}
                />
              </CardContent>
            </Card>
          </div>

          <div className="text-center mb-8">
            <Button 
              onClick={handleCompare}
              disabled={isAnalyzing || !isAuthenticated}
              className="bg-insurance-blue hover:bg-insurance-blue-dark px-8 py-3"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : "Compare Policies"}
            </Button>
          </div>

          {comparisonResults && (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Comparison Results</CardTitle>
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
                              <Badge key={index} variant="outline" className="mr-1">
                                {coverage}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {comparisonResults.policy2.missingCoverages.map((coverage: string, index: number) => (
                              <Badge key={index} variant="outline" className="mr-1">
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
                  ? "Paste your insurance policy quotations above and click \"Compare Policies\" to see detailed comparison results"
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
