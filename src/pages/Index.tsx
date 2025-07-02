
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import FileUploader from "@/components/FileUploader";
import TextInput from "@/components/TextInput";
import DocumentPreview from "@/components/DocumentPreview";
import AnalysisResults from "@/components/AnalysisResults";
import ChatInterface from "@/components/ChatInterface";
import ComprehensiveAnalysisDashboard from "@/components/ComprehensiveAnalysisDashboard";
import { PolicyDocument, AnalysisResult } from "@/lib/chatpdf-types";
import { uploadDocumentForAnalysis, sendChatMessage } from "@/services/insurance-api";
import { saveAnalysisResultHistory, getAnalysisResultsHistory } from "@/services/history";

const Index = () => {
  const [documents, setDocuments] = useState<PolicyDocument[]>([]);
  const [activeTab, setActiveTab] = useState("file");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState("comprehensive");
  const [isChatting, setIsChatting] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState([]);
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
    analyzeDocument(newDocument);
  };

  const handleTextAdded = (newDocument: PolicyDocument) => {
    setDocuments([newDocument]);
    analyzeDocument(newDocument);
  };

  const handleUseSampleText = () => {
    setActiveTab("text");
    // Create a sample document and analyze it
    const sampleDocument: PolicyDocument = {
      id: `sample-${Date.now()}`,
      name: "Sample Home Insurance Policy",
      type: "text",
      content: samplePolicyText,
      status: "ready"
    };
    setDocuments([sampleDocument]);
    analyzeDocument(sampleDocument);
  };

  const handleRemoveDocument = (id: string) => {
    const documentToRemove = documents.find(doc => doc.id === id);
    setDocuments(documents.filter(doc => doc.id !== id));
    
    if (documentToRemove?.previewUrl) {
      URL.revokeObjectURL(documentToRemove.previewUrl);
    }
    
    setAnalysisResult(null);
  };

  const analyzeDocument = async (document: PolicyDocument) => {
    if (!document) return;
    
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      console.log("Starting comprehensive policy analysis with ChatPDF:", document.name);
      
      setDocuments(docs => 
        docs.map(doc => 
          doc.id === document.id 
            ? { ...doc, status: "processing" } 
            : doc
        )
      );
      
      const result = await uploadDocumentForAnalysis(document);
      console.log("ChatPDF analysis completed successfully:", result);
      
      if (!result || typeof result !== 'object' || !result.document_id) {
        throw new Error("Invalid analysis result returned from ChatPDF API");
      }
      
      setAnalysisResult(result);
      
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
        description: "Your insurance policy has been comprehensively analyzed using ChatPDF.",
      });

      setActiveResultTab("comprehensive");
    } catch (error) {
      console.error("Error analyzing document:", error);
      
      setDocuments(docs => 
        docs.map(doc => 
          doc.id === document.id 
            ? { ...doc, status: "error", errorMessage: error.message || "Analysis failed" } 
            : doc
        )
      );
      
      toast({
        title: "Analysis Failed",
        description: error.message || "There was an error analyzing your document. Please check your internet connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeClick = () => {
    if (documents.length > 0) {
      const firstDoc = documents[0];
      if (firstDoc.status === "error") {
        setDocuments(docs => 
          docs.map(doc => 
            doc.id === firstDoc.id 
              ? { ...doc, status: "ready", errorMessage: undefined } 
              : doc
          )
        );
      }
      analyzeDocument(firstDoc);
    } else {
      toast({
        title: "No Document",
        description: "Please upload a document or paste text first.",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async (message: string) => {
    setIsChatting(true);
    try {
      const documentId = analysisResult?.document_id;
      
      if (!documentId) {
        return "Please upload and analyze a document first before asking questions.";
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
              Understand Your Insurance Coverage
              <span className="block text-primary">in Minutes</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Upload your insurance policy document to get AI-powered analysis of coverage, risk assessment, gaps identification, and personalized recommendations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg"
                onClick={() => setActiveTab("file")}
              >
                Upload Your Policy PDF
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-4 text-lg"
                onClick={handleUseSampleText}
              >
                Try With Sample Text
              </Button>
            </div>
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
              <span className="text-sm font-medium">AI-Powered Analysis</span>
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
          {/* How It Works */}
          <section className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                How It Works
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get comprehensive insurance analysis in three simple steps
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📄</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">1. Upload Policy</h3>
                <p className="text-muted-foreground text-sm">
                  Drag and drop your PDF or paste policy text for instant processing
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">2. AI Analysis</h3>
                <p className="text-muted-foreground text-sm">
                  Our AI extracts coverage details, identifies gaps, and assesses risks
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">3. Get Insights</h3>
                <p className="text-muted-foreground text-sm">
                  View detailed analysis with visual charts and actionable recommendations
                </p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-1 space-y-6">
              <Card className="shadow-lg border-0 bg-card">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Upload Your Policy
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Supports PDF files and text input for comprehensive analysis
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
                          
                          <Button 
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3"
                            onClick={handleAnalyzeClick}
                            disabled={isAnalyzing}
                            size="lg"
                          >
                            {isAnalyzing ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing Policy...
                              </>
                            ) : "🔍 Analyze Policy Now"}
                          </Button>
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
                      What You'll Get
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-600">✓</span>
                        <span>Coverage analysis & risk assessment</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-600">✓</span>
                        <span>Gap identification & recommendations</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-600">✓</span>
                        <span>Regional compliance checking</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-600">✓</span>
                        <span>Interactive policy chat</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Card className="h-full shadow-lg border-0 bg-card">
                <CardContent className="p-6">
                  <Tabs value={activeResultTab} onValueChange={setActiveResultTab}>
                    <TabsList className="w-full border-b mb-6 bg-transparent h-auto p-0">
                      <TabsTrigger 
                        value="comprehensive" 
                        className="flex-1 text-sm py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                      >
                        📊 Comprehensive Analysis
                      </TabsTrigger>
                      <TabsTrigger 
                        value="summary" 
                        className="flex-1 text-sm py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                      >
                        📋 Policy Summary
                      </TabsTrigger>
                      <TabsTrigger 
                        value="chat" 
                        className="flex-1 text-sm py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                      >
                        💬 Chat with Policy
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="comprehensive">
                      {!analysisResult && !isAnalyzing && (
                        <div className="text-center py-16">
                          <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">📋</span>
                          </div>
                          <h3 className="text-xl font-semibold text-foreground mb-4">
                            Ready to Analyze Your Policy
                          </h3>
                          <p className="text-muted-foreground max-w-md mx-auto mb-6">
                            Upload your insurance policy document to get comprehensive analysis including coverage assessment, risk evaluation, and personalized recommendations
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button 
                              variant="outline"
                              onClick={() => setActiveTab("file")}
                            >
                              Upload Document
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={handleUseSampleText}
                            >
                              Try Sample Text
                            </Button>
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
                              Our AI is analyzing your insurance policy for coverage details, risks, and recommendations...
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {analysisResult && !isAnalyzing && (
                        <ComprehensiveAnalysisDashboard 
                          analysis={analysisResult} 
                          userContext={{
                            location: 'UK',
                            propertyType: 'Residential',
                            businessType: 'Individual',
                            industry: 'Personal'
                          }}
                        />
                      )}
                    </TabsContent>

                    <TabsContent value="summary">
                      {analysisResult && !isAnalyzing ? (
                        <AnalysisResults analysis={analysisResult} />
                      ) : (
                        <div className="text-center py-16">
                          <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">📄</span>
                          </div>
                          <h3 className="text-xl font-semibold text-foreground mb-4">
                            Policy Summary
                          </h3>
                          <p className="text-muted-foreground max-w-md mx-auto mb-6">
                            Upload and analyze a policy to view detailed summary and recommendations
                          </p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="chat" className="h-[calc(100vh-400px)] min-h-[500px]">
                      <ChatInterface 
                        sourceId={analysisResult?.document_id ?? null}
                        onSendMessage={handleSendMessage}
                        isLoading={isChatting}
                      />
                    </TabsContent>
                  </Tabs>
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
              <h4 className="font-semibold text-foreground mb-4">Regional Standards</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>🇬🇧 UK Insurance Standards</div>
                <div>🇺🇸 US State Regulations</div>
                <div>🇮🇳 IRDAI Guidelines</div>
                <div>🇪🇺 European Directives</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Disclaimer</h4>
              <p className="text-sm text-muted-foreground">
                This AI-powered analysis is for informational purposes only. 
                Always consult with a licensed insurance professional before making policy decisions.
              </p>
            </div>
          </div>
          <div className="text-center pt-8 border-t">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Insurance Policy Analyzer. Powered by advanced AI technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
