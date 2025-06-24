import { AnalysisResult } from "@/lib/chatpdf-types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EnhancedCoverageGapAnalyzer from "./EnhancedCoverageGapAnalyzer";

interface AnalysisResultsProps {
  analysis: AnalysisResult;
  isLoading?: boolean;
}

const AnalysisResults = ({ analysis, isLoading = false }: AnalysisResultsProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse-slow"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-6 w-1/4 bg-gray-200 rounded animate-pulse-slow"></div>
            <div className="h-20 bg-gray-200 rounded animate-pulse-slow"></div>
          </div>
        ))}
      </div>
    );
  }

  const formatTextWithBullets = (text: string) => {
    // Clean up special characters and format as bullet points
    const cleanText = text.replace(/[*#-]/g, '').trim();
    const sentences = cleanText.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    
    return sentences.map((sentence, index) => (
      <li key={index} className="mb-2">
        <span className="text-gray-700 text-sm md:text-base">{sentence.trim()}.</span>
      </li>
    ));
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case "Low": return "default";
      case "Medium": return "secondary";
      case "High": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Main Analysis Tabs */}
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary">Policy Summary</TabsTrigger>
          <TabsTrigger value="coverage-gaps">Coverage Gap Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Policy Summary</CardTitle>
              <CardDescription className="text-sm md:text-base">
                Key features and coverage details of your policy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {formatTextWithBullets(analysis.summary)}
              </ul>
            </CardContent>
          </Card>

          {analysis.risk_assessment && (
            <Card className="border-blue-200">
              <CardHeader className="bg-blue-50 border-b border-blue-200">
                <CardTitle className="text-blue-700 flex items-center gap-2 text-lg md:text-xl">
                  Risk Covered
                  <Badge variant={getRiskBadgeVariant(analysis.risk_assessment.overall_risk_level)} className="text-xs md:text-sm">
                    {analysis.risk_assessment.overall_risk_level} Risk
                  </Badge>
                </CardTitle>
                <CardDescription className="text-sm md:text-base">What risks are covered under this policy</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 md:pt-6 space-y-4">
                <div>
                  <h4 className="font-bold text-gray-800 mb-3 text-base md:text-lg">Covered Risk Areas</h4>
                  <div className="space-y-2">
                    {analysis.risk_assessment.risk_factors.map((factor, index) => (
                      <div key={index} className="flex gap-2">
                        <span className="text-blue-500 font-bold text-sm md:text-base">✓</span>
                        <span className="text-gray-700 text-sm md:text-base">{factor.replace(/[*#-]/g, '').trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-3 text-base md:text-lg">Protection Strategies</h4>
                  <div className="space-y-2">
                    {analysis.risk_assessment.mitigation_strategies.map((strategy, index) => (
                      <div key={index} className="flex gap-2">
                        <span className="text-green-500 font-bold text-sm md:text-base">•</span>
                        <span className="text-gray-700 text-sm md:text-base">{strategy.replace(/[*#-]/g, '').trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="coverage-gaps">
          <EnhancedCoverageGapAnalyzer analysis={analysis} />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card className="border-green-200">
            <CardHeader className="bg-green-50 border-b border-green-200">
              <CardTitle className="text-green-700 text-lg md:text-xl">
                Smart Recommendations
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                Tailored suggestions to address your policy
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 md:pt-6">
              <div className="space-y-3">
                {/* Coverage Enhancement Recommendations */}
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex gap-2">
                    <span className="text-green-500 font-bold text-sm md:text-base">💡</span>
                    <div>
                      <p className="text-gray-700 font-medium text-sm md:text-base">Add Cyber Liability Coverage</p>
                      <p className="text-xs md:text-sm text-green-600 mt-1">
                        Essential for businesses handling customer data. Covers data breaches, cyber attacks, and regulatory fines.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex gap-2">
                    <span className="text-green-500 font-bold text-sm md:text-base">💡</span>
                    <div>
                      <p className="text-gray-700 font-medium text-sm md:text-base">Consider Business Owners Policy (BOP)</p>
                      <p className="text-xs md:text-sm text-green-600 mt-1">
                        Combines general liability and property insurance for comprehensive small business protection.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex gap-2">
                    <span className="text-green-500 font-bold text-sm md:text-base">💡</span>
                    <div>
                      <p className="text-gray-700 font-medium text-sm md:text-base">Review Coverage Limits Annually</p>
                      <p className="text-xs md:text-sm text-green-600 mt-1">
                        Ensure property values and liability limits keep pace with business growth and inflation.
                      </p>
                    </div>
                  </div>
                </div>
                {/* Original recommendations from analysis */}
                {analysis.recommendations && analysis.recommendations.length > 0 &&
                  analysis.recommendations.slice(0, 2).map((rec, index) => (
                    <div key={index} className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex gap-2">
                        <span className="text-blue-500 font-bold text-sm md:text-base">📋</span>
                        <div>
                          <p className="text-gray-700 font-medium text-sm md:text-base">{rec.replace(/[*#-]/g, '').trim()}</p>
                          <p className="text-xs md:text-sm text-blue-600 mt-1">
                            From document analysis: Review with your insurance broker for implementation.
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Alert>
        <AlertTitle className="text-sm md:text-base font-bold">Important Disclaimer</AlertTitle>
        <AlertDescription className="text-xs md:text-sm">
          This AI-powered analysis is for informational purposes only and should not replace professional insurance advice. 
          Please consult with a licensed insurance agent or broker before making any changes to your policy coverage.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default AnalysisResults;
