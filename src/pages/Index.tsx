import { useState } from "react";
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
import BenchmarkComparison from "@/components/BenchmarkComparison";
import VoiceChatInterface from "@/components/VoiceChatInterface";
import { PolicyDocument, AnalysisResult, PolicyBenchmark } from "@/lib/chatpdf-types";
import { uploadDocumentForAnalysis, sendChatMessage, getCoverageGaps } from "@/services/insurance-api";

const Index = () => {
  const [documents, setDocuments] = useState<PolicyDocument[]>([]);
  const [activeTab, setActiveTab] = useState("file");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState("summary");
  const [isChatting, setIsChatting] = useState(false);
  const [benchmark, setBenchmark] = useState<PolicyBenchmark | null>(null);
  const [isLoadingGaps, setIsLoadingGaps] = useState(false);
  const [coverageGaps, setCoverageGaps] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFileAdded = (newDocument: PolicyDocument) => {
    setDocuments([...documents, newDocument]);
  };

  const handleTextAdded = (newDocument: PolicyDocument) => {
    setDocuments([newDocument]);
    analyzeDocument(newDocument);
  };

  const handleRemoveDocument = (id: string) => {
    const documentToRemove = documents.find(doc => doc.id === id);
    setDocuments(documents.filter(doc => doc.id !== id));
    
    // Clean up any preview URLs to prevent memory leaks
    if (documentToRemove?.previewUrl) {
      URL.revokeObjectURL(documentToRemove.previewUrl);
    }
    
    // Reset analysis results when removing the document
    setAnalysisResult(null);
    setBenchmark(null);
  };

  const analyzeDocument = async (document: PolicyDocument) => {
    if (!document) return;
    
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      console.log("Starting comprehensive policy analysis:", document.name);
      
      // Update document status to processing
      setDocuments(docs => 
        docs.map(doc => 
          doc.id === document.id 
            ? { ...doc, status: "processing" } 
            : doc
        )
      );
      
      // Call the ChatPDF API to analyze the document comprehensively
      const result = await uploadDocumentForAnalysis(document);
      console.log("Comprehensive analysis completed successfully:", result);
      
      // Ensure we have a valid result with document_id
      if (!result || typeof result !== 'object' || !result.document_id) {
        throw new Error("Invalid analysis result returned from ChatPDF API");
      }
      
      setAnalysisResult(result);
      
      // Update document status to ready
      setDocuments(docs => 
        docs.map(doc => 
          doc.id === document.id 
            ? { ...doc, status: "ready" } 
            : doc
        )
      );
      
      toast({
        title: "Analysis Complete",
        description: "Your insurance policy has been comprehensively analyzed including coverage, risk assessment, and regulatory considerations.",
      });

      // Set to summary tab
      setActiveResultTab("summary");
    } catch (error) {
      console.error("Error analyzing document:", error);
      
      // Update document status to error
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
        // Reset status and retry
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

  const fetchCoverageGaps = async () => {
    if (!analysisResult?.document_id) return;
    
    setIsLoadingGaps(true);
    setCoverageGaps([]);
    
    try {
      // Get the current document ID from ChatPDF
      const documentId = analysisResult.document_id;
      
      // Fetch coverage gaps from the ChatPDF API
      const response = await getCoverageGaps(documentId);
      
      // Parse the response into an array
      if (typeof response === 'string') {
        // Split by newlines and filter out empty lines
        const gaps = response.split('\n')
          .filter(gap => gap.trim().length > 0)
          .map(gap => gap.replace(/^[•\-\d\.]\s*/, '').trim())
          .filter(gap => gap.length > 0);
        setCoverageGaps(gaps);
      } else if (Array.isArray(response)) {
        setCoverageGaps(response);
      } else {
        setCoverageGaps(['No coverage gaps analysis available']);
      }
      
      toast({
        title: "Coverage Gaps Analysis Complete",
        description: "Your policy has been analyzed for potential coverage gaps using ChatPDF.",
      });
    } catch (error) {
      console.error("Error fetching coverage gaps from ChatPDF:", error);
      toast({
        title: "Coverage Gaps Analysis Failed",
        description: "There was an error analyzing your policy for coverage gaps with ChatPDF.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingGaps(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    setIsChatting(true);
    try {
      // Get the current document ID from ChatPDF
      const documentId = analysisResult?.document_id;
      
      if (!documentId) {
        return "Please upload and analyze a document first before asking questions.";
      }
      
      // Send the chat message to the ChatPDF API
      const response = await sendChatMessage(documentId, message);
      return response;
    } catch (error) {
      console.error("Error sending message to ChatPDF:", error);
      return "Sorry, there was an error processing your message with ChatPDF. Please try again.";
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto py-4 md:py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-insurance-blue-dark mb-2">
              Insurance Policy Analyzer
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto px-4">
              Upload your insurance policy document to analyze coverage, assess risk, identify positive and negative aspects, and ensure regulatory compliance
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-1 space-y-4 md:space-y-6">
              <Card>
                <CardContent className="p-4 md:p-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4 md:mb-6">
                      <TabsTrigger value="file" className="text-xs md:text-sm">Upload File</TabsTrigger>
                      <TabsTrigger value="text" className="text-xs md:text-sm">Paste Text</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="file" className="space-y-4 md:space-y-6">
                      <FileUploader onFileAdded={handleFileAdded} />
                      
                      {documents.length > 0 && activeTab === "file" && (
                        <div className="mt-4 md:mt-6">
                          <h3 className="font-medium mb-3 text-sm md:text-base">Uploaded Document</h3>
                          <DocumentPreview 
                            document={documents[0]} 
                            onRemove={handleRemoveDocument} 
                          />
                          
                          <div className="mt-4">
                            <Button 
                              className="w-full bg-insurance-blue hover:bg-insurance-blue-dark text-sm md:text-base py-2 md:py-3"
                              onClick={handleAnalyzeClick}
                              disabled={isAnalyzing}
                            >
                              {isAnalyzing ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Analyzing Policy...
                                </>
                              ) : "Analyze Document"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="text">
                      <TextInput onTextAdded={handleTextAdded} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardContent className="p-4 md:p-6">
                  <Tabs value={activeResultTab} onValueChange={setActiveResultTab}>
                    <TabsList className="w-full border-b mb-4 md:mb-6 flex-wrap h-auto">
                      <TabsTrigger value="summary" className="flex-1 text-xs md:text-sm py-2">Analysis</TabsTrigger>
                      <TabsTrigger value="chat" className="flex-1 text-xs md:text-sm py-2">Chat with Document</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="summary">
                      {!analysisResult && !isAnalyzing && (
                        <div className="text-center py-8 md:py-12">
                          <p className="text-gray-500 text-sm md:text-base px-4">
                            Upload a document or paste text to see comprehensive analysis results including coverage assessment, risk evaluation, and regulatory compliance
                          </p>
                        </div>
                      )}
                      
                      {isAnalyzing && (
                        <div className="space-y-4">
                          <div className="text-center py-6 md:py-8">
                            <Loader2 className="mx-auto h-6 w-6 md:h-8 md:w-8 animate-spin text-insurance-blue" />
                            <p className="mt-4 text-gray-600 text-sm md:text-base px-4">
                              Analyzing your insurance policy for coverage, risk assessment, and regulatory compliance...
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {analysisResult && !isAnalyzing && (
                        <AnalysisResults analysis={analysisResult} />
                      )}
                    </TabsContent>
                    
                    <TabsContent value="chat" className="h-[calc(100vh-400px)] md:h-[calc(100vh-320px)] min-h-[400px] md:min-h-[500px]">
                      <ChatInterface 
                        sourceId="demo-source-id"
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
      
      <footer className="mt-8 md:mt-12 py-4 md:py-6 border-t bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-xs md:text-sm">
            © {new Date().getFullYear()} PolicyCheck. This tool is for informational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
