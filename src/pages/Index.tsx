
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
import BusinessProfileForm from "@/components/BusinessProfileForm";
import BenchmarkComparison from "@/components/BenchmarkComparison";
import { PolicyDocument, AnalysisResult, BusinessProfile, PolicyBenchmark } from "@/lib/chatpdf-types";

const Index = () => {
  const [documents, setDocuments] = useState<PolicyDocument[]>([]);
  const [activeTab, setActiveTab] = useState("file");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState("summary");
  const [isChatting, setIsChatting] = useState(false);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchmark, setBenchmark] = useState<PolicyBenchmark | null>(null);
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
      // Simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create empty analysis result structure
      const result: AnalysisResult = {
        summary: "",
        gaps: [],
        overpayments: [],
        recommendations: []
      };
      
      setAnalysisResult(result);
      
      toast({
        title: "Analysis Complete",
        description: "Your insurance policy has been successfully analyzed.",
      });

      // Set to summary tab
      setActiveResultTab("summary");
    } catch (error) {
      console.error("Error analyzing document:", error);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your document. Please try again.",
        variant: "destructive",
      });
      
      // Update document status to error
      setDocuments(docs => 
        docs.map(doc => 
          doc.id === document.id 
            ? { ...doc, status: "error", errorMessage: "Failed to analyze document" } 
            : doc
        )
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeClick = () => {
    if (documents.length > 0) {
      analyzeDocument(documents[0]);
    }
  };

  const handleSendMessage = async (message: string) => {
    setIsChatting(true);
    try {
      // Simulate API response with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      return "Please connect to an API to enable chat functionality.";
    } finally {
      setIsChatting(false);
    }
  };

  const handleProfileSubmit = async (profile: BusinessProfile) => {
    setIsBenchmarking(true);
    setBenchmark(null);
    
    try {
      // Simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create empty benchmark result structure
      const emptyBenchmark: PolicyBenchmark = {
        coverageLimits: "",
        deductibles: "",
        missingCoverages: [],
        premiumComparison: "",
        benchmarkScore: 0
      };
      
      setBenchmark(emptyBenchmark);
      setActiveResultTab("benchmark");
      
      toast({
        title: "Benchmark Comparison Complete",
        description: "Your policy has been compared against industry standards.",
      });
    } catch (error) {
      console.error("Error comparing with benchmark:", error);
      toast({
        title: "Benchmark Comparison Failed",
        description: "There was an error comparing your policy with benchmarks.",
        variant: "destructive",
      });
    } finally {
      setIsBenchmarking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-insurance-blue-dark mb-2">
              Insurance Policy Analyzer
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Upload your insurance policy document or paste the text to analyze coverage gaps, identify potential overpayments, and compare against industry benchmarks
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="file">Upload File</TabsTrigger>
                      <TabsTrigger value="text">Paste Text</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="file" className="space-y-6">
                      <FileUploader onFileAdded={handleFileAdded} />
                      
                      {documents.length > 0 && activeTab === "file" && (
                        <div className="mt-6">
                          <h3 className="font-medium mb-3">Uploaded Document</h3>
                          <DocumentPreview 
                            document={documents[0]} 
                            onRemove={handleRemoveDocument} 
                          />
                          
                          <div className="mt-4">
                            <Button 
                              className="w-full bg-insurance-blue hover:bg-insurance-blue-dark"
                              onClick={handleAnalyzeClick}
                              disabled={isAnalyzing}
                            >
                              {isAnalyzing ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Analyzing...
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
              
              <BusinessProfileForm 
                onProfileSubmit={handleProfileSubmit}
                isLoading={isBenchmarking}
              />
            </div>
            
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardContent className="p-6">
                  <Tabs value={activeResultTab} onValueChange={setActiveResultTab}>
                    <TabsList className="w-full border-b mb-6">
                      <TabsTrigger value="summary" className="flex-1">Analysis</TabsTrigger>
                      <TabsTrigger value="chat" className="flex-1">Chat with Document</TabsTrigger>
                      <TabsTrigger value="benchmark" className="flex-1" disabled={!benchmark}>Benchmarks</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="summary">
                      {!analysisResult && !isAnalyzing && (
                        <div className="text-center py-12">
                          <p className="text-gray-500">
                            Upload a document or paste text to see analysis results
                          </p>
                        </div>
                      )}
                      
                      {isAnalyzing && (
                        <AnalysisResults analysis={{
                          summary: "",
                          gaps: [],
                          overpayments: [],
                          recommendations: []
                        }} isLoading />
                      )}
                      
                      {analysisResult && !isAnalyzing && (
                        <AnalysisResults analysis={analysisResult} />
                      )}
                    </TabsContent>
                    
                    <TabsContent value="chat" className="h-[calc(100vh-320px)] min-h-[500px]">
                      <ChatInterface 
                        sourceId="demo-source-id"
                        onSendMessage={handleSendMessage}
                        isLoading={isChatting}
                      />
                    </TabsContent>
                    
                    <TabsContent value="benchmark">
                      {isBenchmarking && (
                        <BenchmarkComparison
                          benchmark={{
                            coverageLimits: "",
                            deductibles: "",
                            missingCoverages: [],
                            premiumComparison: "",
                            benchmarkScore: 0
                          }}
                          isLoading
                        />
                      )}
                      
                      {benchmark && !isBenchmarking && (
                        <BenchmarkComparison benchmark={benchmark} />
                      )}
                      
                      {!benchmark && !isBenchmarking && (
                        <div className="text-center py-12">
                          <p className="text-gray-500">
                            Fill in your business profile to compare with benchmarks
                          </p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="mt-12 py-6 border-t bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} PolicyCheck. This tool is for informational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
