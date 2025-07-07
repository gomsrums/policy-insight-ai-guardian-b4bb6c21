
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import FileUploader from "@/components/FileUploader";
import TextInput from "@/components/TextInput";
import DocumentPreview from "@/components/DocumentPreview";
import QuickAnalysisForm, { QuickAnalysisData } from "@/components/QuickAnalysisForm";
import QuickAnalysisResults from "@/components/QuickAnalysisResults";
import { PolicyDocument } from "@/lib/chatpdf-types";
import { quickAnalysisEngine, QuickAnalysisResult } from "@/services/quickAnalysisEngine";

interface DocumentUploadSectionProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  documents: PolicyDocument[];
  onFileAdded: (document: PolicyDocument) => void;
  onTextAdded: (document: PolicyDocument) => void;
  onRemoveDocument: (id: string) => void;
}

const DocumentUploadSection = ({
  activeTab,
  setActiveTab,
  documents,
  onFileAdded,
  onTextAdded,
  onRemoveDocument
}: DocumentUploadSectionProps) => {
  const [quickAnalysisResult, setQuickAnalysisResult] = useState<QuickAnalysisResult | null>(null);
  const [isQuickAnalyzing, setIsQuickAnalyzing] = useState(false);

  const handleQuickAnalysis = async (data: QuickAnalysisData) => {
    setIsQuickAnalyzing(true);
    try {
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = quickAnalysisEngine.analyzePolicy(data);
      setQuickAnalysisResult(result);
      
      console.log('Quick analysis completed:', result);
    } catch (error) {
      console.error('Quick analysis failed:', error);
    } finally {
      setIsQuickAnalyzing(false);
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-card">
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Analyze Your Insurance
          </h3>
          <p className="text-muted-foreground text-sm">
            Choose your preferred analysis method
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="quick" className="text-sm">⚡ Quick Analysis</TabsTrigger>
            <TabsTrigger value="file" className="text-sm">📄 Upload PDF</TabsTrigger>
            <TabsTrigger value="text" className="text-sm">📝 Paste Text</TabsTrigger>
          </TabsList>
          
          <TabsContent value="quick" className="space-y-6">
            <QuickAnalysisForm 
              onAnalyze={handleQuickAnalysis}
              isAnalyzing={isQuickAnalyzing}
            />
            
            {quickAnalysisResult && (
              <div className="mt-6">
                <QuickAnalysisResults result={quickAnalysisResult} />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="file" className="space-y-6">
            <FileUploader onFileAdded={onFileAdded} />
            
            {documents.length > 0 && activeTab === "file" && (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-3 text-sm">Uploaded Document</h4>
                  <DocumentPreview 
                    document={documents[0]} 
                    onRemove={onRemoveDocument} 
                  />
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="text">
            <TextInput onTextAdded={onTextAdded} />
          </TabsContent>
        </Tabs>

        {/* Features List */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium text-sm mb-3 text-muted-foreground uppercase tracking-wide">
            Analysis Features
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-600">✓</span>
              <span>Instant Analysis (Quick Mode)</span>
            </div>
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
              <span>Interactive Chat (PDF/Text)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentUploadSection;
