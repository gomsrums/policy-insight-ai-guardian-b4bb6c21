import { useState, useCallback } from "react";
import { useTrialAccess } from "@/hooks/useTrialAccess";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import QuickAnalysisForm, { QuickAnalysisData } from "./QuickAnalysisForm";
import QuickAnalysisResults from "./QuickAnalysisResults";
import { quickAnalysisEngine, QuickAnalysisResult } from "@/services/quickAnalysisEngine";
import { PolicyDocument } from "@/lib/chatpdf-types";

interface DocumentUploadSectionProps {
  onFileAdded?: (document: PolicyDocument) => void;
}

const DocumentUploadSection = ({ onFileAdded }: DocumentUploadSectionProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<QuickAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [quickAnalysisData, setQuickAnalysisData] = useState<QuickAnalysisData | null>(null);
  const { canUseFeature, useFeature, getRemainingUses, isAuthenticated } = useTrialAccess();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const fileArray = Array.from(files);
      
      // Validate file types
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      const invalidFiles = fileArray.filter(file => !allowedTypes.includes(file.type));
      
      if (invalidFiles.length > 0) {
        throw new Error(`Invalid file types: ${invalidFiles.map(f => f.name).join(', ')}. Only PDF and image files are allowed.`);
      }

      // Validate file sizes (max 10MB per file)
      const oversizedFiles = fileArray.filter(file => file.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        throw new Error(`Files too large: ${oversizedFiles.map(f => f.name).join(', ')}. Maximum size is 10MB per file.`);
      }

      setUploadedFiles(prev => [...prev, ...fileArray]);
      
      // Automatically trigger analysis for the first uploaded file
      if (onFileAdded && fileArray.length > 0) {
        const document: PolicyDocument = {
          id: `doc-${Date.now()}`,
          name: fileArray[0].name,
          type: "file",
          file: fileArray[0],
          status: "ready"
        };
        onFileAdded(document);
      }
      
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleQuickAnalysis = useCallback(async (data: QuickAnalysisData) => {
    if (!isAuthenticated && !canUseFeature('quickAnalysis')) {
      // This will be handled by the parent component's auth flow
      return;
    }

    if (!isAuthenticated) {
      useFeature('quickAnalysis');
    }

    setIsAnalyzing(true);
    setQuickAnalysisData(data);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = await quickAnalysisEngine.analyzePolicy(data);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      // Handle error appropriately
    } finally {
      setIsAnalyzing(false);
    }
  }, [canUseFeature, useFeature, isAuthenticated]);

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDocumentAnalysis = async () => {
    if (uploadedFiles.length === 0 || !onFileAdded) return;
    
    const file = uploadedFiles[0]; // Analyze the first uploaded file
    const document: PolicyDocument = {
      id: `doc-${Date.now()}`,
      name: file.name,
      type: "file",
      file: file,
      status: "ready"
    };
    
    onFileAdded(document);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Insurance Document Analysis
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Upload your insurance documents or get quick analysis of your policy details
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="quick-analysis" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="quick-analysis">Quick Analysis</TabsTrigger>
              <TabsTrigger value="document-upload">Document Upload</TabsTrigger>
            </TabsList>
            
            <TabsContent value="quick-analysis" className="space-y-6">
              <QuickAnalysisForm 
                onAnalyze={handleQuickAnalysis} 
                isAnalyzing={isAnalyzing}
              />
              
              {analysisResult && (
                <QuickAnalysisResults 
                  result={analysisResult} 
                  country={quickAnalysisData?.country}
                />
              )}
            </TabsContent>

            <TabsContent value="document-upload" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upload Insurance Documents</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Upload PDF files or images of your insurance policies for detailed analysis
                  </p>
                  {!isAuthenticated && (
                    <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded mt-2">
                      Trial: {getRemainingUses('documentUpload')} free document analysis remaining. Sign in for unlimited access.
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                    <div className="space-y-2">
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <span className="text-lg font-medium">Choose files to upload</span>
                        <p className="text-sm text-muted-foreground mt-1">
                          PDF, JPG, PNG files up to 10MB each
                        </p>
                      </Label>
                      <Input
                        id="file-upload"
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button 
                        variant="outline" 
                        disabled={isUploading || (!isAuthenticated && !canUseFeature('documentUpload'))}
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : !isAuthenticated && !canUseFeature('documentUpload') ? (
                          'Sign in to Continue'
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Select Files
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {uploadError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{uploadError}</AlertDescription>
                    </Alert>
                  )}

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Uploaded Files:</h3>
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(file.size / 1024 / 1024).toFixed(1)} MB)
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      
                      <Button 
                        className="w-full mt-4" 
                        disabled={uploadedFiles.length === 0 || !onFileAdded}
                        onClick={handleDocumentAnalysis}
                      >
                        Analyze Documents
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentUploadSection;
