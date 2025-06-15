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
        <span className="text-gray-700 text-sm md:text-base">{sentence.trim()}.</span>
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
            <h5 className="font-bold text-gray-800 mb-1 text-sm md:text-base">{trimmedLine}</h5>
          ) : (
            <p className="text-gray-700 ml-2 text-sm md:text-base">{trimmedLine}</p>
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

  // Generate coverage gaps based on analysis
  const generateCoverageGaps = () => {
    const commonGaps = [
      "Cyber liability coverage not included",
      "Employment practices liability missing",
      "Directors and officers (D&O) coverage absent",
      "Business interruption limits may be insufficient",
      "Professional liability coverage not specified",
      "Product liability exclusions present",
      "International operations not covered",
      "Terrorism coverage excluded",
      "Data breach notification costs not covered",
      "Supply chain disruption not addressed"
    ];

    const criticalExclusions = [
      "War and nuclear risks excluded",
      "Flood damage not covered under standard policy",
      "Earthquake coverage requires separate policy",
      "Cyber attacks on critical infrastructure excluded",
      "Intentional acts by employees not covered",
      "Regulatory fines and penalties excluded"
    ];

    const insufficientLimits = [
      "General liability limits below industry standard",
      "Property coverage may not reflect current replacement costs",
      "Auto liability limits insufficient for commercial operations",
      "Workers compensation coverage gaps in multi-state operations"
    ];

    return { commonGaps, criticalExclusions, insufficientLimits };
  };

  const { commonGaps, criticalExclusions, insufficientLimits } = generateCoverageGaps();

  return (
    <div className="space-y-6 md:space-y-8">
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
