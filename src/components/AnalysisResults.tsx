
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

  const formatTextAsParagraph = (text: string) => {
    // Clean up special characters and format as flowing paragraph
    const cleanText = text.replace(/[*#-]/g, '').trim();
    const sentences = cleanText.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    
    return sentences.map(sentence => sentence.trim()).join('. ') + '.';
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case "Low": return "default";
      case "Medium": return "secondary";
      case "High": return "destructive";
      default: return "outline";
    }
  };

  const extractCoveredRisks = (summary: string) => {
    const riskKeywords = ['fire', 'theft', 'flood', 'earthquake', 'liability', 'windstorm', 'hail', 'explosion', 'smoke', 'vandalism', 'water damage', 'burst pipes'];
    const foundRisks = [];
    
    const lowerSummary = summary.toLowerCase();
    riskKeywords.forEach(risk => {
      if (lowerSummary.includes(risk)) {
        foundRisks.push(risk.charAt(0).toUpperCase() + risk.slice(1));
      }
    });
    
    return foundRisks.length > 0 ? foundRisks : ['Property damage', 'Personal liability', 'Third-party coverage'];
  };

  const coveredRisks = analysis.risk_assessment?.risk_factors || extractCoveredRisks(analysis.summary);

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
              <div className="prose prose-sm md:prose-base max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {formatTextAsParagraph(analysis.summary)}
                </p>
              </div>
            </CardContent>
          </Card>

          {analysis.risk_assessment && (
            <Card className="border-blue-200">
              <CardHeader className="bg-blue-50 border-b border-blue-200">
                <CardTitle className="text-blue-700 flex items-center gap-2 text-lg md:text-xl">
                  Covered Risk Areas
                  <Badge variant={getRiskBadgeVariant(analysis.risk_assessment.overall_risk_level)} className="text-xs md:text-sm">
                    {analysis.risk_assessment.overall_risk_level} Risk Level
                  </Badge>
                </CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Areas of risk that are covered under this policy
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 md:pt-6 space-y-4">
                <div>
                  <h4 className="font-bold text-gray-800 mb-3 text-base md:text-lg">Risk Coverage Overview</h4>
                  <div className="prose prose-sm md:prose-base max-w-none mb-4">
                    <p className="text-gray-700 leading-relaxed">
                      Your policy provides comprehensive protection against various risk factors that could potentially impact your property and personal liability. 
                      The coverage includes protection against both common and specialized risks, ensuring you have adequate financial protection in case of unexpected events.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {coveredRisks.map((risk, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                        <span className="text-blue-600 font-bold text-sm md:text-base">🛡️</span>
                        <span className="text-blue-800 text-sm md:text-base font-medium">{risk}</span>
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
                Tailored suggestions to enhance your policy coverage
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 md:pt-6">
              <div className="space-y-4">
                {/* Enhanced Coverage Recommendations */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex gap-3">
                    <span className="text-green-600 font-bold text-lg">💡</span>
                    <div className="flex-1">
                      <h4 className="text-gray-800 font-semibold text-base md:text-lg mb-2">Coverage Enhancement Opportunities</h4>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 leading-relaxed mb-3">
                          Based on our analysis of your current policy, we've identified several opportunities to strengthen your coverage. 
                          These recommendations focus on addressing potential gaps and ensuring you have comprehensive protection against emerging risks.
                        </p>
                        <p className="text-green-700 font-medium">
                          Consider adding cyber liability coverage if you work from home or store sensitive data electronically. 
                          This protection is increasingly important in today's digital landscape and can cover costs related to data breaches, 
                          identity theft, and cyber attacks that traditional policies may not address.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex gap-3">
                    <span className="text-blue-600 font-bold text-lg">📋</span>
                    <div className="flex-1">
                      <h4 className="text-gray-800 font-semibold text-base md:text-lg mb-2">Policy-Specific Recommendations</h4>
                      <div className="prose prose-sm max-w-none">
                        {analysis.recommendations && analysis.recommendations.length > 0 ? (
                          <p className="text-gray-700 leading-relaxed">
                            {analysis.recommendations.map(rec => rec.replace(/[*#-]/g, '').trim()).join('. ')}. 
                            These suggestions are based on the specific terms and conditions found in your current policy document.
                          </p>
                        ) : (
                          <p className="text-gray-700 leading-relaxed">
                            Your current policy appears to provide good baseline coverage. We recommend conducting an annual review 
                            to ensure your coverage limits keep pace with inflation and any changes in your personal circumstances or property values.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
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
