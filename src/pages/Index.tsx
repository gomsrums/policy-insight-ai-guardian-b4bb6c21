
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import DocumentUploadSection from "@/components/DocumentUploadSection";
import AnalysisResultsSection from "@/components/AnalysisResultsSection";
import FooterSection from "@/components/FooterSection";
import { PolicyDocument, AnalysisResult } from "@/lib/chatpdf-types";
import { uploadDocumentForAnalysis, sendChatMessage } from "@/services/chatpdf-api";
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
      
      setDocuments(docs => 
        docs.map(doc => 
          doc.id === document.id 
            ? { ...doc, status: "processing" } 
            : doc
        )
      );
      
      const result = await uploadDocumentForAnalysis(document);
      console.log("Document analyzed successfully:", result);
      
      if (!result || typeof result !== 'object' || !result.document_id) {
        throw new Error("Invalid analysis result returned from ChatPDF API");
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
        description: "Your policy has been analyzed and is ready for review.",
      });

    } catch (error) {
      console.error("Error processing document:", error);
      
      let errorMessage = "There was an error analyzing your document. Please try again.";
      
      if (error instanceof Error) {
        // Handle ChatPDF specific errors
        if (error.message.includes("authentication failed") || error.message.includes("401")) {
          errorMessage = "ChatPDF API authentication failed. Please verify the API key is correct.";
        } else if (error.message.includes("rate limit")) {
          errorMessage = "ChatPDF API rate limit exceeded. Please wait a moment and try again.";
        } else if (error.message.includes("file too large") || error.message.includes("413")) {
          errorMessage = "File is too large for ChatPDF. Please try a smaller file.";
        } else if (error.message.includes("network") || error.message.includes("fetch")) {
          errorMessage = "Network error. Please check your internet connection and try again.";
        } else if (error.message.includes("Invalid analysis result")) {
          errorMessage = "ChatPDF returned an invalid response. Please try again.";
        } else if (error.message.includes("No source ID")) {
          errorMessage = "ChatPDF failed to process the document. Please try again.";
        } else if (error.message.includes("No content returned")) {
          errorMessage = "ChatPDF did not return analysis content. Please try again.";
        } else {
          errorMessage = `ChatPDF Error: ${error.message}`;
        }
      }
      
      setDocuments(docs => 
        docs.map(doc => 
          doc.id === document.id 
            ? { ...doc, status: "error", errorMessage: errorMessage } 
            : doc
        )
      );
      
      toast({
        title: "Analysis Failed",
        description: errorMessage,
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
      
      if (error instanceof Error) {
        if (error.message.includes("authentication failed") || error.message.includes("401")) {
          return "ChatPDF API authentication failed. Please check the API configuration.";
        } else {
          return `ChatPDF Error: ${error.message}`;
        }
      }
      
      return "Sorry, there was an error processing your message. Please try again.";
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <Header />
      
      <HeroSection onUseSampleText={handleUseSampleText} />

      <main className="container mx-auto py-8 md:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-1 space-y-6">
              <DocumentUploadSection
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                documents={documents}
                onFileAdded={handleFileAdded}
                onTextAdded={handleTextAdded}
                onRemoveDocument={handleRemoveDocument}
              />
            </div>
            
            <div className="lg:col-span-2">
              <AnalysisResultsSection
                analysisResult={analysisResult}
                isAnalyzing={isAnalyzing}
                isChatting={isChatting}
                onUseSampleText={handleUseSampleText}
                onSendMessage={handleSendMessage}
              />
            </div>
          </div>
        </div>
      </main>
      
      <FooterSection />
    </div>
  );
};

export default Index;
