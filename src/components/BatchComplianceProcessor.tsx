
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileUploader } from "./FileUploader";
import { useToast } from "@/hooks/use-toast";
import { Upload, Play, Download, FileText, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface BatchDocument {
  id: string;
  name: string;
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  complianceScore?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  issuesCount?: number;
}

interface BatchComplianceProcessorProps {
  region: string;
  onAnalysisComplete: (results: any[]) => void;
}

const BatchComplianceProcessor: React.FC<BatchComplianceProcessorProps> = ({ region, onAnalysisComplete }) => {
  const [documents, setDocuments] = useState<BatchDocument[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleMultipleUpload = (files: FileList) => {
    const newDocuments: BatchDocument[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      file,
      status: 'pending'
    }));
    
    setDocuments(prev => [...prev, ...newDocuments]);
    toast({
      title: "Documents Added",
      description: `${files.length} documents added for batch processing.`,
    });
  };

  const processBatch = async () => {
    if (!region) {
      toast({
        title: "No Region Selected",
        description: "Please select a region before processing.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    const results = [];

    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      
      // Update document status
      setDocuments(prev => prev.map(d => 
        d.id === doc.id ? { ...d, status: 'processing' } : d
      ));

      try {
        // Simulate processing (replace with actual analysis)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock compliance results - replace with actual analysis
        const mockResult = {
          complianceScore: Math.floor(Math.random() * 40) + 60, // 60-100
          riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
          issuesCount: Math.floor(Math.random() * 5),
        };

        setDocuments(prev => prev.map(d => 
          d.id === doc.id ? { 
            ...d, 
            status: 'completed',
            ...mockResult
          } : d
        ));

        results.push({ document: doc.name, ...mockResult });
        
      } catch (error) {
        setDocuments(prev => prev.map(d => 
          d.id === doc.id ? { ...d, status: 'error' } : d
        ));
      }

      setProgress(((i + 1) / documents.length) * 100);
    }

    setIsProcessing(false);
    onAnalysisComplete(results);
    
    toast({
      title: "Batch Processing Complete",
      description: `Processed ${documents.length} documents successfully.`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Batch Compliance Processing
        </CardTitle>
        <CardDescription>
          Upload multiple policy documents for automated compliance analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => e.target.files && handleMultipleUpload(e.target.files)}
            className="hidden"
            id="batch-upload"
          />
          <label htmlFor="batch-upload" className="cursor-pointer">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium">Drop files here or click to upload</p>
            <p className="text-sm text-gray-500">Supports PDF, DOC, DOCX, TXT files</p>
          </label>
        </div>

        {documents.length > 0 && (
          <>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">{documents.length} documents queued</p>
              <div className="flex gap-2">
                <Button
                  onClick={processBatch}
                  disabled={isProcessing || !region}
                  className="bg-insurance-blue hover:bg-insurance-blue-dark"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Start Batch Analysis'}
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Results
                </Button>
              </div>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing documents...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Compliance Score</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Issues</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(doc.status)}
                        <span className="capitalize">{doc.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {doc.complianceScore ? `${doc.complianceScore}%` : '-'}
                    </TableCell>
                    <TableCell>
                      {doc.riskLevel ? (
                        <Badge className={getRiskBadgeColor(doc.riskLevel)}>
                          {doc.riskLevel.toUpperCase()}
                        </Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {doc.issuesCount !== undefined ? doc.issuesCount : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BatchComplianceProcessor;
