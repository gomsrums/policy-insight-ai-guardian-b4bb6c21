
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
          <CardDescription>What your policy currently covers</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{analysis.summary}</p>
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
            <CardDescription>Identified risk factors and mitigation strategies</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <h4 className="font-medium mb-2">Risk Factors</h4>
              <ul className="space-y-2">
                {analysis.risk_assessment.risk_factors.map((factor, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-purple-500 font-bold">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Mitigation Strategies</h4>
              <ul className="space-y-2">
                {analysis.risk_assessment.mitigation_strategies.map((strategy, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-green-500 font-bold">•</span>
                    <span>{strategy}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-red-200">
          <CardHeader className="bg-red-50 border-b border-red-200">
            <CardTitle className="text-red-700">Coverage Gaps</CardTitle>
            <CardDescription>Areas where you may be underinsured</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {analysis.gaps.length > 0 ? (
              <ul className="space-y-2">
                {analysis.gaps.map((gap, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No significant coverage gaps identified.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="bg-green-50 border-b border-green-200">
            <CardTitle className="text-green-700">Recommendations</CardTitle>
            <CardDescription>How to optimize your insurance coverage</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {analysis.recommendations.length > 0 ? (
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-green-500 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No specific recommendations available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Alert>
        <AlertTitle>Disclaimer</AlertTitle>
        <AlertDescription>
          This analysis is for informational purposes only and should not replace professional insurance advice. 
          Consult with a licensed insurance agent or broker before making changes to your policy.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default AnalysisResults;
