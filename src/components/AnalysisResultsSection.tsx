
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import { AnalysisResult } from "@/lib/chatpdf-types";

interface AnalysisResultsSectionProps {
  analysisResult: AnalysisResult | null;
  isAnalyzing: boolean;
  isChatting: boolean;
  onUseSampleText: () => void;
  onSendMessage: (message: string) => Promise<string>;
}

const AnalysisResultsSection = ({
  analysisResult,
  isAnalyzing,
  isChatting,
  onUseSampleText,
  onSendMessage
}: AnalysisResultsSectionProps) => {
  return (
    <Card className="h-full shadow-lg border-0 bg-card">
      <CardContent className="p-6">
        {!analysisResult && !isAnalyzing && (
          <div className="h-full">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Chat with AI Assistant
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                Ask questions about insurance policies, coverage, or get general advice
              </p>
            </div>
            <div className="h-[calc(100vh-400px)] min-h-[400px]">
              <ChatInterface 
                sourceId={null}
                onSendMessage={onSendMessage}
                isLoading={isChatting}
              />
            </div>
          </div>
        )}
        
        {isAnalyzing && (
          <div className="space-y-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Analyzing Your Policy
              </h3>
              <p className="text-muted-foreground">
                Our AI is analyzing your policy for comprehensive insights...
              </p>
            </div>
          </div>
        )}
        
        {analysisResult && !isAnalyzing && (
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="summary">📋 Summary</TabsTrigger>
              <TabsTrigger value="gaps">⚠️ Coverage Gaps</TabsTrigger>
              <TabsTrigger value="insights">💡 Insights</TabsTrigger>
              <TabsTrigger value="chat">💬 Chat</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📋 Policy Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{analysisResult.summary}</p>
                </CardContent>
              </Card>
              
              {analysisResult.risk_assessment && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">🎯 Risk Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Risk Level:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          analysisResult.risk_assessment?.overall_risk_level === 'High' ? 'bg-red-100 text-red-800' :
                          analysisResult.risk_assessment?.overall_risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {analysisResult.risk_assessment?.overall_risk_level || 'Medium'}
                        </span>
                      </div>
                      {analysisResult.risk_assessment?.risk_factors && analysisResult.risk_assessment.risk_factors.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Risk Factors:</p>
                          <ul className="space-y-1">
                            {analysisResult.risk_assessment.risk_factors.map((factor, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-red-500 mt-1">•</span>
                                {factor}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="gaps" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">⚠️ Coverage Gaps</CardTitle>
                  <CardDescription>
                    Areas where your policy may have limited or no coverage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analysisResult.gaps && analysisResult.gaps.length > 0 ? (
                    <ul className="space-y-2">
                      {analysisResult.gaps.map((gap, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-orange-500 mt-1">•</span>
                          {gap}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No significant coverage gaps identified in your policy.</p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">💡 Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  {analysisResult.recommendations && analysisResult.recommendations.length > 0 ? (
                    <ul className="space-y-2">
                      {analysisResult.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">Your policy appears to have comprehensive coverage.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="insights" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">💡 Key Insights</CardTitle>
                  <CardDescription>
                    Important observations about your policy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <h4 className="font-medium text-blue-900 mb-2">Policy Strengths</h4>
                      <p className="text-sm text-blue-800">
                        Your policy includes comprehensive coverage with industry-standard protections.
                      </p>
                    </div>
                    
                    {analysisResult.gaps && analysisResult.gaps.length > 0 && (
                      <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                        <h4 className="font-medium text-orange-900 mb-2">Areas for Improvement</h4>
                        <p className="text-sm text-orange-800">
                          Consider reviewing the identified coverage gaps to ensure complete protection.
                        </p>
                      </div>
                    )}
                    
                    <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                      <h4 className="font-medium text-green-900 mb-2">Next Steps</h4>
                      <p className="text-sm text-green-800">
                        Schedule an annual policy review with your agent to ensure coverage remains adequate.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="chat" className="h-[calc(100vh-500px)] min-h-[500px]">
              <ChatInterface 
                sourceId={analysisResult?.document_id ?? null}
                onSendMessage={onSendMessage}
                isLoading={isChatting}
              />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalysisResultsSection;
