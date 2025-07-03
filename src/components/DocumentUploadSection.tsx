
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import FileUploader from "@/components/FileUploader";
import TextInput from "@/components/TextInput";
import DocumentPreview from "@/components/DocumentPreview";
import { PolicyDocument } from "@/lib/chatpdf-types";

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
  return (
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
  );
};

export default DocumentUploadSection;
