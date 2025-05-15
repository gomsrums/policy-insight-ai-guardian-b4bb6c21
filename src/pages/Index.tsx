
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import FileUploader from "@/components/FileUploader";
import TextInput from "@/components/TextInput";
import DocumentPreview from "@/components/DocumentPreview";
import AnalysisResults from "@/components/AnalysisResults";
import { PolicyDocument, AnalysisResult } from "@/lib/chatpdf-types";
import { 
  uploadDocumentToChatPDF, 
  uploadTextToChatPDF, 
  analyzePolicyWithChatPDF,
  deleteSourceFromChatPDF
} from "@/services/chatpdf-service";
import { nanoid } from "nanoid";

const Index = () => {
  const [documents, setDocuments] = useState<PolicyDocument[]>([]);
  const [activeTab, setActiveTab] = useState("file");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sourceId, setSourceId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileAdded = (newDocument: PolicyDocument) => {
    setDocuments([...documents, newDocument]);
  };

  const handleTextAdded = (newDocument: PolicyDocument) => {
    setDocuments([newDocument]);
    analyzeDocument(newDocument);
  };

  const handleRemoveDocument = async (id: string) => {
    const documentToRemove = documents.find(doc => doc.id === id);
    setDocuments(documents.filter(doc => doc.id !== id));
    
    // Clean up any preview URLs to prevent memory leaks
    if (documentToRemove?.previewUrl) {
      URL.revokeObjectURL(documentToRemove.previewUrl);
    }
    
    // Clean up source from ChatPDF if we have a sourceId
    if (sourceId) {
      try {
        await deleteSourceFromChatPDF(sourceId);
        setSourceId(null);
      } catch (error) {
        console.error("Error deleting source from ChatPDF:", error);
      }
    }
    
    // Reset analysis results when removing the document
    setAnalysisResult(null);
  };

  const analyzeDocument = async (document: PolicyDocument) => {
    if (!document) return;
    
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      // If we have an existing sourceId, delete it first
      if (sourceId) {
        try {
          await deleteSourceFromChatPDF(sourceId);
        } catch (error) {
          console.error("Error deleting previous source:", error);
        }
      }
      
      let newSourceId;
      
      // Upload file or text to ChatPDF
      if (document.type === "file" && document.file) {
        newSourceId = await uploadDocumentToChatPDF(document.file);
      } else if (document.type === "text" && document.content) {
        newSourceId = await uploadTextToChatPDF(document.content);
      } else {
        throw new Error("Invalid document type or missing content");
      }
      
      setSourceId(newSourceId);
      
      // Analyze the policy
      const analysis = await analyzePolicyWithChatPDF(newSourceId);
      setAnalysisResult(analysis);
      
      toast({
        title: "Analysis Complete",
        description: "Your insurance policy has been successfully analyzed.",
      });
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-insurance-blue-dark mb-2">
              Insurance Policy Analyzer
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload your insurance policy document or paste the text to analyze coverage gaps and identify potential overpayments
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="md:col-span-1">
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
            
            <Card className="md:col-span-2">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
                
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
              </CardContent>
            </Card>
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
