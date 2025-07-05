
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FileUploader from "@/components/FileUploader";
import { PolicyDocument } from "@/lib/chatpdf-types";
import { policyDataManager } from "@/services/policyDataManager";
import { ExtractedPolicyData } from "@/types/policyExtraction";

const PolicyExtractionDemo = () => {
  const [selectedMarket, setSelectedMarket] = useState<'US' | 'UK' | 'India'>('UK');
  const [selectedPolicyType, setSelectedPolicyType] = useState<'auto' | 'health' | 'home'>('auto');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedPolicyData | null>(null);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [uploadedDocument, setUploadedDocument] = useState<PolicyDocument | null>(null);
  const { toast } = useToast();

  const handleDocumentUpload = (document: PolicyDocument) => {
    setUploadedDocument(document);
    setExtractedData(null);
    setValidationWarnings([]);
  };

  const handleExtractData = async () => {
    if (!uploadedDocument) {
      toast({
        title: "No Document",
        description: "Please upload a policy document first.",
        variant: "destructive",
      });
      return;
    }

    setIsExtracting(true);
    
    try {
      toast({
        title: "Extracting Policy Data",
        description: "Using ChatPDF AI to extract structured data from your policy...",
      });

      const result = await policyDataManager.processPolicy(
        uploadedDocument,
        selectedMarket,
        selectedPolicyType
      );

      if (result.success && result.data) {
        setExtractedData(result.data);
        setValidationWarnings(result.validationWarnings);
        
        toast({
          title: "Extraction Complete",
          description: `Successfully extracted policy data with ${result.validationWarnings.length} warnings.`,
        });
      } else {
        throw new Error(result.error || "Extraction failed");
      }
    } catch (error) {
      console.error("Extraction error:", error);
      toast({
        title: "Extraction Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const generateTestData = () => {
    const testData = policyDataManager.generateTestTemplate(selectedMarket, selectedPolicyType);
    setExtractedData(testData);
    setValidationWarnings([]);
    
    toast({
      title: "Test Data Generated",
      description: `Generated sample ${selectedMarket} ${selectedPolicyType} policy data.`,
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbols = { USD: '$', GBP: '£', INR: '₹' };
    return `${symbols[currency as keyof typeof symbols] || ''}${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Policy Data Extraction Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Market</label>
              <Select value={selectedMarket} onValueChange={(value: 'US' | 'UK' | 'India') => setSelectedMarket(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                  <SelectItem value="India">India</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Policy Type</label>
              <Select value={selectedPolicyType} onValueChange={(value: 'auto' | 'health' | 'home') => setSelectedPolicyType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto Insurance</SelectItem>
                  <SelectItem value="health">Health Insurance</SelectItem>
                  <SelectItem value="home">Home Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button onClick={generateTestData} variant="outline" className="w-full">
                Generate Test Data
              </Button>
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4">
            <FileUploader onFileAdded={handleDocumentUpload} />
            {uploadedDocument && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-700">
                  Document uploaded: {uploadedDocument.name}
                </p>
              </div>
            )}
          </div>

          <Button 
            onClick={handleExtractData}
            disabled={!uploadedDocument || isExtracting}
            className="w-full"
          >
            {isExtracting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Extracting Data with ChatPDF AI...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Extract Policy Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {validationWarnings.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="h-5 w-5" />
              Validation Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {validationWarnings.map((warning, index) => (
                <li key={index} className="text-sm text-orange-600">• {warning}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {extractedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Extracted Policy Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="premium">Premium</TabsTrigger>
                <TabsTrigger value="coverage">Coverage</TabsTrigger>
                <TabsTrigger value="terms">Terms</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Policy Number</label>
                    <p className="font-mono">{extractedData.policyNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Insurer</label>
                    <p>{extractedData.insurerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Type</label>
                    <Badge variant="outline">{extractedData.policyType}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Market</label>
                    <Badge variant="outline">{extractedData.market}</Badge>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="premium" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Annual Premium</label>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(extractedData.premium.annual, extractedData.premium.currency)}
                    </p>
                  </div>
                  {extractedData.premium.monthly && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Monthly Premium</label>
                      <p className="text-xl font-semibold">
                        {formatCurrency(extractedData.premium.monthly, extractedData.premium.currency)}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Frequency</label>
                  <Badge variant="secondary">{extractedData.premium.paymentFrequency}</Badge>
                </div>
              </TabsContent>
              
              <TabsContent value="coverage" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(extractedData.coverage).map(([type, amount]) => (
                    amount && (
                      <div key={type}>
                        <label className="text-sm font-medium text-gray-500 capitalize">
                          {type.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <p className="font-semibold">
                          {formatCurrency(amount, extractedData.premium.currency)}
                        </p>
                      </div>
                    )
                  ))}
                </div>
                
                <div className="mt-6">
                  <label className="text-sm font-medium text-gray-500">Deductibles</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    {Object.entries(extractedData.deductibles).map(([type, amount]) => (
                      amount && (
                        <div key={type} className="p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-600 capitalize">{type}</p>
                          <p className="font-semibold">
                            {formatCurrency(amount, extractedData.premium.currency)}
                          </p>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="terms" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Policy Duration</label>
                    <p>{extractedData.terms.policyPeriod.duration} months</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Renewal Type</label>
                    <Badge variant="outline">{extractedData.terms.renewalType}</Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Exclusions</label>
                  <ul className="mt-2 space-y-1">
                    {extractedData.exclusions.slice(0, 5).map((exclusion, index) => (
                      <li key={index} className="text-sm text-red-600">• {exclusion}</li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="features" className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Included Features</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {extractedData.features.map((feature, index) => (
                      <Badge key={index} variant="secondary">{feature}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Available Discounts</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {extractedData.discounts.map((discount, index) => (
                      <Badge key={index} variant="outline" className="text-green-600">
                        {discount}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Extraction Metadata</label>
                  <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                    <p>Confidence: {Math.round(extractedData.extractionMetadata.confidence * 100)}%</p>
                    <p>Source: {extractedData.extractionMetadata.source}</p>
                    <p>Status: <Badge variant={extractedData.extractionMetadata.validationStatus === 'validated' ? 'default' : 'secondary'}>
                      {extractedData.extractionMetadata.validationStatus}
                    </Badge></p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PolicyExtractionDemo;
