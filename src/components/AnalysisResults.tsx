
import { AnalysisResult } from "@/lib/chatpdf-types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

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
        <span className="text-gray-700">{sentence.trim()}.</span>
      </li>
    ));
  };

  const formatRiskAssessment = (text: string) => {
    // Remove special characters and format with bold headings
    const cleanText = text.replace(/[*#-]/g, '');
    const lines = cleanText.split('\n').filter(line => line.trim().length > 0);
    
    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      // Check if line looks like a heading (short and followed by content)
      const isHeading = trimmedLine.length < 50 && !trimmedLine.includes('.');
      
      return (
        <div key={index} className="mb-2">
          {isHeading ? (
            <h5 className="font-bold text-gray-800 mb-1">{trimmedLine}</h5>
          ) : (
            <p className="text-gray-700 ml-2">{trimmedLine}</p>
          )}
        </div>
      );
    });
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
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Policy Summary</CardTitle>
          <CardDescription>Key features and coverage details of your policy</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {formatTextWithBullets(analysis.summary)}
          </ul>
        </CardContent>
      </Card>

      {analysis.risk_assessment && (
        <Card className="border-purple-200">
          <CardHeader className="bg-purple-50 border-b border-purple-200">
            <CardTitle className="text-purple-700 flex items-center gap-2">
              Risk Assessment
              <Badge variant={getRiskBadgeVariant(analysis.risk_assessment.overall_risk_level)}>
                {analysis.risk_assessment.overall_risk_level} Risk
              </Badge>
            </CardTitle>
            <CardDescription>Comprehensive risk analysis and mitigation strategies</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <h4 className="font-bold text-gray-800 mb-3">Risk Factors</h4>
              <div className="space-y-2">
                {analysis.risk_assessment.risk_factors.map((factor, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-purple-500 font-bold">•</span>
                    <span className="text-gray-700">{factor.replace(/[*#-]/g, '').trim()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-3">Mitigation Strategies</h4>
              <div className="space-y-2">
                {analysis.risk_assessment.mitigation_strategies.map((strategy, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-green-500 font-bold">•</span>
                    <span className="text-gray-700">{strategy.replace(/[*#-]/g, '').trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-red-200">
          <CardHeader className="bg-red-50 border-b border-red-200">
            <CardTitle className="text-red-700">Coverage Gaps & Risk Analysis</CardTitle>
            <CardDescription>Uncovered risks and potential exposures</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {analysis.gaps.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <h5 className="font-bold text-red-700 mb-2">Risks Not Covered</h5>
                  <ul className="space-y-2">
                    {analysis.gaps.slice(0, Math.ceil(analysis.gaps.length / 2)).map((gap, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="text-red-500 font-bold">⚠</span>
                        <span className="text-gray-700">{gap.replace(/[*#-]/g, '').trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {analysis.gaps.length > 2 && (
                  <div>
                    <h5 className="font-bold text-orange-600 mb-2">Potential Risk Exposures</h5>
                    <ul className="space-y-2">
                      {analysis.gaps.slice(Math.ceil(analysis.gaps.length / 2)).map((gap, index) => (
                        <li key={index} className="flex gap-2">
                          <span className="text-orange-500 font-bold">⚡</span>
                          <span className="text-gray-700">{gap.replace(/[*#-]/g, '').trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No significant coverage gaps identified in your policy.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="bg-green-50 border-b border-green-200">
            <CardTitle className="text-green-700">Smart Recommendations</CardTitle>
            <CardDescription>Tailored suggestions based on your coverage and risk profile</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {analysis.recommendations.length > 0 ? (
              <div className="space-y-3">
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="bg-green-50 p-3 rounded-lg">
                    <div className="flex gap-2">
                      <span className="text-green-500 font-bold">✓</span>
                      <div>
                        <p className="text-gray-700 font-medium">{rec.replace(/[*#-]/g, '').trim()}</p>
                        <p className="text-sm text-green-600 mt-1">
                          Consider reviewing your policy limits and ensuring adequate coverage for identified risks.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Your policy appears well-structured. Regular reviews are recommended.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Alert>
        <AlertTitle>Important Disclaimer</AlertTitle>
        <AlertDescription>
          This AI-powered analysis is for informational purposes only and should not replace professional insurance advice. 
          Please consult with a licensed insurance agent or broker before making any changes to your policy coverage.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default AnalysisResults;
