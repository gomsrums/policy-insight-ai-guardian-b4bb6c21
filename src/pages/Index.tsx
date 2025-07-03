
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
import ChatInterface from "@/components/ChatInterface";
import { PolicyDocument, AnalysisResult } from "@/lib/chatpdf-types";
import { uploadDocumentForAnalysis, sendChatMessage } from "@/services/insurance-api";
import { saveAnalysisResultHistory, getAnalysisResultsHistory } from "@/services/history";

const Index = () => {
  const [documents, setDocuments] = useState<PolicyDocument[]>([]);
  const [activeTab, setActiveTab] = useState("file");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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
  };

  const analyzeDocumentForChat = async (document: PolicyDocument) => {
    if (!document) return;
    
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      console.log("Processing document for chat:", document.name);
      
      setDocuments(docs => 
        docs.map(doc => 
          doc.id === document.id 
            ? { ...doc, status: "processing" } 
            : doc
        )
      );
      
      const result = await uploadDocumentForAnalysis(document);
      console.log("Document processed for chat:", result);
      
      if (!result || typeof result !== 'object' || !result.document_id) {
        throw new Error("Invalid processing result returned from API");
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
        title: "Document Ready for Chat",
        description: "Your policy document is now ready for interactive chat.",
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
        title: "Processing Failed",
        description: error.message || "There was an error processing your document. Please try again.",
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
              Chat with Your Insurance Policy
              <span className="block text-primary">Get Instant Answers</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Upload your insurance policy document and ask questions about your coverage, terms, and conditions through our AI-powered chat interface
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
          {/* How It Works */}
          <section className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                How It Works
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get instant answers about your insurance policy in three simple steps
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
                <h3 className="font-semibold text-lg mb-2">2. AI Processing</h3>
                <p className="text-muted-foreground text-sm">
                  Our AI processes your document and makes it ready for interactive chat
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">3. Ask Questions</h3>
                <p className="text-muted-foreground text-sm">
                  Chat with your policy to get instant answers about coverage and terms
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
                      Supports PDF files and text input for chat functionality
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
                      What You Can Do
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-600">✓</span>
                        <span>Ask about coverage details</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-600">✓</span>
                        <span>Understand policy terms</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-600">✓</span>
                        <span>Check exclusions & limits</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-600">✓</span>
                        <span>Get instant answers</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Card className="h-full shadow-lg border-0 bg-card">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      💬 Chat with Your Policy
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {analysisResult ? "Your document is ready. Ask questions about your policy below." : "Upload a document to start chatting with your policy"}
                    </p>
                  </div>
                  
                  {!analysisResult && !isAnalyzing && (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">💬</span>
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-4">
                        Ready to Chat with Your Policy
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-6">
                        Upload your insurance policy document to start an interactive chat and get instant answers about your coverage
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
                          Processing Your Document
                        </h3>
                        <p className="text-muted-foreground">
                          Preparing your policy document for interactive chat...
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {analysisResult && !isAnalyzing && (
                    <div className="h-[calc(100vh-400px)] min-h-[500px]">
                      <ChatInterface 
                        sourceId={analysisResult?.document_id ?? null}
                        onSendMessage={handleSendMessage}
                        isLoading={isChatting}
                      />
                    </div>
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
