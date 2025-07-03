
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import FileUploader from "@/components/FileUploader";
import TextInput from "@/components/TextInput";
import DocumentPreview from "@/components/DocumentPreview";
import ChatInterface from "@/components/ChatInterface";
import { PolicyDocument, AnalysisResult } from "@/lib/chatpdf-types";
import { uploadDocumentForAnalysis, sendChatMessage } from "@/services/huggingface-api";
import { saveAnalysisResultHistory, getAnalysisResultsHistory } from "@/services/history";

const Index = () => {
  const [documents, setDocuments] = useState<PolicyDocument[]>([]);
  const [activeTab, setActiveTab] = useState("file");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const { toast } = useToast();

  // Sample policy text for demonstration
  const samplePolicyText = `
COMPREHENSIVE HOME INSURANCE POLICY

Policy Number: HI-2024-001
Policyholder: John Smith
Property Address: 123 Main Street, London, UK

SECTION A: PROPERTY COVERAGE
This policy covers your dwelling and personal property against the following perils:
- Fire and lightning damage
- Windstorm and hail damage
- Explosion and smoke damage
- Theft and burglary
- Vandalism and malicious mischief
- Water damage from burst pipes

Coverage Limits:
- Dwelling: £300,000
- Personal Property: £150,000
- Additional Living Expenses: £50,000

SECTION B: LIABILITY COVERAGE
Personal liability coverage: £1,000,000
Medical payments to others: £5,000

EXCLUSIONS:
This policy does not cover:
- Flood damage
- Earthquake damage
- War and nuclear hazards
- Intentional damage by insured
- Business activities conducted on premises

DEDUCTIBLE: £500 per claim

Premium: £1,200 annually
Policy Period: January 1, 2024 to January 1, 2025
  `;

  useEffect(() => {
    if (analysisResult?.document_id) {
      getAnalysisResultsHistory(analysisResult.document_id).then(setAnalysisHistory);
    } else {
      setAnalysisHistory([]);
    }
  }, [analysisResult?.document_id]);

  const handleFileAdded = (newDocument: PolicyDocument) => {
    setDocuments([newDocument]);
    analyzeDocumentForChat(newDocument);
  };

  const handleTextAdded = (newDocument: PolicyDocument) => {
    setDocuments([newDocument]);
    analyzeDocumentForChat(newDocument);
  };

  const handleUseSampleText = () => {
    const sampleDocument: PolicyDocument = {
      id: `sample-${Date.now()}`,
      name: "Sample Home Insurance Policy",
      type: "text",
      content: samplePolicyText,
      status: "ready"
    };
    setDocuments([sampleDocument]);
    analyzeDocumentForChat(sampleDocument);
  };

  const handleRemoveDocument = (id: string) => {
    const documentToRemove = documents.find(doc => doc.id === id);
    setDocuments(documents.filter(doc => doc.id !== id));
    
    if (documentToRemove?.previewUrl) {
      URL.revokeObjectURL(documentToRemove.previewUrl);
    }
    
    setAnalysisResult(null);
    setShowAnalysis(false);
  };

  const analyzeDocumentForChat = async (document: PolicyDocument) => {
    if (!document) return;
    
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setShowAnalysis(false);
    
    try {
      console.log("Processing document for analysis:", document.name);
      
      // Store document content for chat context
      if (document.content) {
        localStorage.setItem(`document_hf-${Date.now()}`, document.content);
      }
      
      setDocuments(docs => 
        docs.map(doc => 
          doc.id === document.id 
            ? { ...doc, status: "processing" } 
            : doc
        )
      );
      
      const result = await uploadDocumentForAnalysis(document);
      console.log("Document analyzed:", result);
      
      if (!result || typeof result !== 'object' || !result.document_id) {
        throw new Error("Invalid analysis result returned from API");
      }
      
      setAnalysisResult(result);
      setShowAnalysis(true);
      
      if (result && result.document_id) {
        saveAnalysisResultHistory(result);
        getAnalysisResultsHistory(result.document_id).then(setAnalysisHistory);
      }
      
      setDocuments(docs => 
        docs.map(doc => 
          doc.id === document.id 
            ? { ...doc, status: "ready" } 
            : doc
        )
      );
      
      toast({
        title: "Analysis Complete",
        description: "Your policy has been analyzed and is ready for chat.",
      });

    } catch (error) {
      console.error("Error processing document:", error);
      
      setDocuments(docs => 
        docs.map(doc => 
          doc.id === document.id 
            ? { ...doc, status: "error", errorMessage: error.message || "Processing failed" } 
            : doc
        )
      );
      
      toast({
        title: "Analysis Failed",
        description: error.message || "There was an error analyzing your document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    setIsChatting(true);
    try {
      const documentId = analysisResult?.document_id;
      
      if (!documentId) {
        return "Please upload and process a document first before asking questions.";
      }
      
      const response = await sendChatMessage(documentId, message);
      return response;
    } catch (error) {
      console.error("Error sending message:", error);
      return "Sorry, there was an error processing your message. Please try again.";
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/5 to-primary/10 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span>🛡️</span>
              Trusted by 10,000+ Policy Holders
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              AI-Powered Insurance Analysis
              <span className="block text-primary">Get Comprehensive Insights</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Upload your insurance policy document to get detailed analysis including coverage gaps, risk assessment, and personalized recommendations
            </p>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-8 bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="flex items-center gap-2">
              <span className="text-green-600">🔒</span>
              <span className="text-sm font-medium">GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600">🛡️</span>
              <span className="text-sm font-medium">Secure Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-600">⚡</span>
              <span className="text-sm font-medium">AI-Powered Chat</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-orange-600">🏆</span>
              <span className="text-sm font-medium">Industry Standard</span>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto py-8 md:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-1 space-y-6">
              <Card className="shadow-lg border-0 bg-card">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Upload Your Policy
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Get comprehensive AI analysis and chat capabilities
                    </p>
                  </div>
                  
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="file" className="text-sm">📄 Upload PDF</TabsTrigger>
                      <TabsTrigger value="text" className="text-sm">📝 Paste Text</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="file" className="space-y-6">
                      <FileUploader onFileAdded={handleFileAdded} />
                      
                      {documents.length > 0 && activeTab === "file" && (
                        <div className="space-y-4">
                          <div className="p-4 bg-muted/50 rounded-lg">
                            <h4 className="font-medium mb-3 text-sm">Uploaded Document</h4>
                            <DocumentPreview 
                              document={documents[0]} 
                              onRemove={handleRemoveDocument} 
                            />
                          </div>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="text">
                      <TextInput onTextAdded={handleTextAdded} />
                    </TabsContent>
                  </Tabs>

                  {/* Features List */}
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                      What You Get
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-600">✓</span>
                        <span>Coverage Gap Analysis</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-600">✓</span>
                        <span>Risk Assessment</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-600">✓</span>
                        <span>Policy Insights</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-600">✓</span>
                        <span>Interactive Chat</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Card className="h-full shadow-lg border-0 bg-card">
                <CardContent className="p-6">
                  {!analysisResult && !isAnalyzing && (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">🤖</span>
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-4">
                        Ready for AI Analysis
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-6">
                        Upload your insurance policy to get comprehensive AI-powered analysis and chat capabilities
                      </p>
                      <Button 
                        variant="outline"
                        onClick={handleUseSampleText}
                      >
                        Try Sample Policy
                      </Button>
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
                    <Tabs defaultValue="analysis" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="analysis">📊 Analysis Results</TabsTrigger>
                        <TabsTrigger value="chat">💬 Chat with Policy</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="analysis" className="space-y-6">
                        <div className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">📋 Policy Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground">{analysisResult.summary}</p>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">⚠️ Coverage Gaps</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {analysisResult.gaps.map((gap, index) => (
                                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-orange-500 mt-1">•</span>
                                    {gap}
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                          
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
                                <div>
                                  <p className="text-sm font-medium mb-2">Risk Factors:</p>
                                  <ul className="space-y-1">
                                    {analysisResult.risk_assessment?.risk_factors?.map((factor, index) => (
                                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                        <span className="text-red-500 mt-1">•</span>
                                        {factor}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">💡 Recommendations</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {analysisResult.recommendations.map((rec, index) => (
                                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">•</span>
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="chat" className="h-[calc(100vh-500px)] min-h-[500px]">
                        <ChatInterface 
                          sourceId={analysisResult?.document_id ?? null}
                          onSendMessage={handleSendMessage}
                          isLoading={isChatting}
                        />
                      </TabsContent>
                    </Tabs>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer with Trust & Compliance */}
      <footer className="mt-16 py-12 border-t bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-foreground mb-4">Trust & Security</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">🔒</span>
                  <span>GDPR Compliant Data Processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">🛡️</span>
                  <span>Secure SSL Encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">🗑️</span>
                  <span>Automatic Data Deletion</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">AI-Powered Chat</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>💬 Instant Policy Answers</div>
                <div>🎯 Context-Aware Responses</div>
                <div>📋 Coverage Explanations</div>
                <div>⚡ Real-time Processing</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Disclaimer</h4>
              <p className="text-sm text-muted-foreground">
                This AI-powered chat is for informational purposes only. 
                Always consult with a licensed insurance professional before making policy decisions.
              </p>
            </div>
          </div>
          <div className="text-center pt-8 border-t">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Insurance Policy Chat. Powered by advanced AI technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
