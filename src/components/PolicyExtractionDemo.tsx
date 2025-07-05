
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, FileText, AlertCircle, CheckCircle, Scale } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import FileUploader from "@/components/FileUploader";
import { PolicyDocument } from "@/lib/chatpdf-types";
import { policyDataManager } from "@/services/policyDataManager";
import { ExtractedPolicyData } from "@/types/policyExtraction";
import { comparisonPipeline } from "@/services/comparisonDataPipeline";
import { UserCriteria, DEFAULT_PARAMETER_WEIGHTS } from "@/types/comparison";
import { nanoid } from "nanoid";

const PolicyExtractionDemo = () => {
  const [selectedMarket, setSelectedMarket] = useState<'US' | 'UK' | 'India'>('UK');
  const [selectedPolicyType, setSelectedPolicyType] = useState<'auto' | 'health' | 'home'>('auto');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [extractedData1, setExtractedData1] = useState<ExtractedPolicyData | null>(null);
  const [extractedData2, setExtractedData2] = useState<ExtractedPolicyData | null>(null);
  const [validationWarnings1, setValidationWarnings1] = useState<string[]>([]);
  const [validationWarnings2, setValidationWarnings2] = useState<string[]>([]);
  const [uploadedDocument1, setUploadedDocument1] = useState<PolicyDocument | null>(null);
  const [uploadedDocument2, setUploadedDocument2] = useState<PolicyDocument | null>(null);
  const [policyText1, setPolicyText1] = useState("");
  const [policyText2, setPolicyText2] = useState("");
  const [activeInputTab, setActiveInputTab] = useState("upload");
  const [comparisonResults, setComparisonResults] = useState<any>(null);
  const { toast } = useToast();

  const handleDocument1Upload = (document: PolicyDocument) => {
    setUploadedDocument1(document);
    setExtractedData1(null);
    setValidationWarnings1([]);
  };

  const handleDocument2Upload = (document: PolicyDocument) => {
    setUploadedDocument2(document);
    setExtractedData2(null);
    setValidationWarnings2([]);
  };

  const createPDFFromText = async (text: string, filename: string): Promise<File> => {
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length ${text.length + 100}
>>
stream
BT
/F1 12 Tf
50 750 Td
(${text.replace(/\n/g, ') Tj 0 -14 Td (')}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000173 00000 n 
0000000301 00000 n 
0000000380 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
456
%%EOF`;

    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    return new File([blob], filename, { type: 'application/pdf' });
  };

  const handleExtractData = async (policyNumber: 1 | 2) => {
    let document: PolicyDocument | null = null;
    
    if (activeInputTab === "upload") {
      document = policyNumber === 1 ? uploadedDocument1 : uploadedDocument2;
      if (!document) {
        toast({
          title: "No Document",
          description: `Please upload policy document ${policyNumber} first.`,
          variant: "destructive",
        });
        return;
      }
    } else {
      const text = policyNumber === 1 ? policyText1 : policyText2;
      if (!text.trim()) {
        toast({
          title: "No Text",
          description: `Please paste policy text ${policyNumber} first.`,
          variant: "destructive",
        });
        return;
      }
      
      // Convert text to document
      const pdfFile = await createPDFFromText(text, `policy-${policyNumber}.pdf`);
      document = {
        id: nanoid(),
        name: `Policy ${policyNumber}`,
        type: "file",
        file: pdfFile,
        status: "processing",
      };
    }

    setIsExtracting(true);
    
    try {
      toast({
        title: "Extracting Policy Data",
        description: `Using ChatPDF AI to extract structured data from policy ${policyNumber}...`,
      });

      const result = await policyDataManager.processPolicy(
        document,
        selectedMarket,
        selectedPolicyType
      );

      if (result.success && result.data) {
        if (policyNumber === 1) {
          setExtractedData1(result.data);
          setValidationWarnings1(result.validationWarnings);
        } else {
          setExtractedData2(result.data);
          setValidationWarnings2(result.validationWarnings);
        }
        
        toast({
          title: "Extraction Complete",
          description: `Successfully extracted policy ${policyNumber} data with ${result.validationWarnings.length} warnings.`,
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

  const handleComparePolicies = async () => {
    if (!extractedData1 && !extractedData2) {
      // Generate test data if no extraction was successful
      const testData1 = policyDataManager.generateTestTemplate(selectedMarket, selectedPolicyType);
      const testData2 = policyDataManager.generateTestTemplate(selectedMarket, selectedPolicyType);
      
      // Modify test data slightly for comparison
      testData2.premium.annual = testData1.premium.annual * 1.2;
      testData2.insurerName = "Test Insurance Company B";
      
      setExtractedData1(testData1);
      setExtractedData2(testData2);
    }

    setIsComparing(true);
    
    try {
      // Create documents for comparison
      const documents: PolicyDocument[] = [];
      
      if (activeInputTab === "upload") {
        if (uploadedDocument1) documents.push(uploadedDocument1);
        if (uploadedDocument2) documents.push(uploadedDocument2);
      } else {
        if (policyText1.trim()) {
          const pdfFile1 = await createPDFFromText(policyText1, "policy-1.pdf");
          documents.push({
            id: nanoid(),
            name: "Policy A",
            type: "file",
            file: pdfFile1,
            status: "processing",
          });
        }
        if (policyText2.trim()) {
          const pdfFile2 = await createPDFFromText(policyText2, "policy-2.pdf");
          documents.push({
            id: nanoid(),
            name: "Policy B", 
            type: "file",
            file: pdfFile2,
            status: "processing",
          });
        }
      }

      // Create user criteria for comparison
      const userCriteria: UserCriteria = {
        budget: { min: 0, max: 10000, currency: selectedMarket === 'US' ? 'USD' : selectedMarket === 'UK' ? 'GBP' : 'INR' },
        priorities: DEFAULT_PARAMETER_WEIGHTS,
        insuranceType: selectedPolicyType,
        market: selectedMarket
      };

      // Run the comparison pipeline
      const pipelineResult = await comparisonPipeline.processDocumentsAndCompare(
        documents,
        userCriteria
      );

      if (pipelineResult.success && pipelineResult.results) {
        setComparisonResults(pipelineResult.results);
        
        toast({
          title: "Comparison Complete",
          description: `Analyzed ${pipelineResult.results.length} policies using transparent scoring algorithm.`,
        });
      } else {
        throw new Error(pipelineResult.error || "Comparison failed");
      }
    } catch (error) {
      console.error("Comparison error:", error);
      toast({
        title: "Comparison Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsComparing(false);
    }
  };

  const generateTestData = () => {
    const testData1 = policyDataManager.generateTestTemplate(selectedMarket, selectedPolicyType);
    const testData2 = policyDataManager.generateTestTemplate(selectedMarket, selectedPolicyType);
    
    // Modify second policy for comparison
    testData2.premium.annual = testData1.premium.annual * 1.15;
    testData2.insurerName = "Royal Sundaram General Insurance Co. Limited";
    testData2.policyNumber = "RSI-2024-002";
    
    setExtractedData1(testData1);
    setExtractedData2(testData2);
    setValidationWarnings1([]);
    setValidationWarnings2([]);
    
    toast({
      title: "Test Data Generated",
      description: `Generated sample ${selectedMarket} ${selectedPolicyType} policy data for comparison.`,
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbols = { USD: '$', GBP: '£', INR: '₹' };
    return `${symbols[currency as keyof typeof symbols] || ''}${amount.toLocaleString()}`;
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case "High": return "destructive";
      case "Medium": return "secondary";
      case "Low": return "default";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Policy Data Extraction & Comparison
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

          <Tabs value={activeInputTab} onValueChange={setActiveInputTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="upload">📄 Upload Documents</TabsTrigger>
              <TabsTrigger value="text">📝 Paste Text</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Policy Document 1</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FileUploader onFileAdded={handleDocument1Upload} />
                    {uploadedDocument1 && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-700">
                          Document uploaded: {uploadedDocument1.name}
                        </p>
                      </div>
                    )}
                    <Button 
                      onClick={() => handleExtractData(1)}
                      disabled={!uploadedDocument1 || isExtracting}
                      className="w-full mt-4"
                      variant="outline"
                    >
                      {isExtracting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Extracting...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Extract Policy 1 Data
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Policy Document 2</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FileUploader onFileAdded={handleDocument2Upload} />
                    {uploadedDocument2 && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-700">
                          Document uploaded: {uploadedDocument2.name}
                        </p>
                      </div>
                    )}
                    <Button 
                      onClick={() => handleExtractData(2)}
                      disabled={!uploadedDocument2 || isExtracting}
                      className="w-full mt-4"
                      variant="outline"
                    >
                      {isExtracting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Extracting...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Extract Policy 2 Data
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="text" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Policy Text 1</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Paste your first policy text here..."
                      value={policyText1}
                      onChange={(e) => setPolicyText1(e.target.value)}
                      className="min-h-[200px]"
                      disabled={isExtracting}
                    />
                    <Button 
                      onClick={() => handleExtractData(1)}
                      disabled={!policyText1.trim() || isExtracting}
                      className="w-full mt-4"
                      variant="outline"
                    >
                      {isExtracting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Extracting...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          Extract Policy 1 Data
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Policy Text 2</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Paste your second policy text here..."
                      value={policyText2}
                      onChange={(e) => setPolicyText2(e.target.value)}
                      className="min-h-[200px]"
                      disabled={isExtracting}
                    />
                    <Button 
                      onClick={() => handleExtractData(2)}
                      disabled={!policyText2.trim() || isExtracting}
                      className="w-full mt-4"
                      variant="outline"
                    >
                      {isExtracting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Extracting...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          Extract Policy 2 Data
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Compare Button */}
          <div className="text-center mt-6">
            <Button 
              onClick={handleComparePolicies}
              disabled={isComparing}
              className="bg-insurance-blue hover:bg-insurance-blue-dark px-8 py-3"
              size="lg"
            >
              {isComparing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Comparing Policies...
                </>
              ) : (
                <>
                  <Scale className="mr-2 h-4 w-4" />
                  Compare Policies
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Validation Warnings */}
      {(validationWarnings1.length > 0 || validationWarnings2.length > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="h-5 w-5" />
              Validation Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {validationWarnings1.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-orange-700 mb-2">Policy 1:</h4>
                <ul className="space-y-1">
                  {validationWarnings1.map((warning, index) => (
                    <li key={index} className="text-sm text-orange-600">• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
            {validationWarnings2.length > 0 && (
              <div>
                <h4 className="font-medium text-orange-700 mb-2">Policy 2:</h4>
                <ul className="space-y-1">
                  {validationWarnings2.map((warning, index) => (
                    <li key={index} className="text-sm text-orange-600">• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Comparison Results */}
      {comparisonResults && comparisonResults.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Policy Comparison Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parameter</TableHead>
                  <TableHead>{comparisonResults[0].policy.name}</TableHead>
                  <TableHead>{comparisonResults[1].policy.name}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Overall Score</TableCell>
                  <TableCell>
                    <span className="font-semibold text-green-600">
                      {comparisonResults[0].score.toFixed(1)}/10
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-green-600">
                      {comparisonResults[1].score.toFixed(1)}/10
                    </span>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Annual Premium</TableCell>
                  <TableCell>
                    {formatCurrency(comparisonResults[0].policy.premium.annual, comparisonResults[0].policy.premium.currency)}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(comparisonResults[1].policy.premium.annual, comparisonResults[1].policy.premium.currency)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Recommendation</TableCell>
                  <TableCell>
                    <Badge variant={comparisonResults[0].rankPosition === 1 ? "default" : "secondary"}>
                      {comparisonResults[0].recommendation}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={comparisonResults[1].rankPosition === 1 ? "default" : "secondary"}>
                      {comparisonResults[1].recommendation}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Strengths</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {comparisonResults[0].strengths.slice(0, 3).map((strength: string, index: number) => (
                        <Badge key={index} variant="outline" className="mr-1 mb-1 text-green-600">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {comparisonResults[1].strengths.slice(0, 3).map((strength: string, index: number) => (
                        <Badge key={index} variant="outline" className="mr-1 mb-1 text-green-600">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Weaknesses</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {comparisonResults[0].weaknesses.slice(0, 3).map((weakness: string, index: number) => (
                        <Badge key={index} variant="outline" className="mr-1 mb-1 text-red-600">
                          {weakness}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {comparisonResults[1].weaknesses.slice(0, 3).map((weakness: string, index: number) => (
                        <Badge key={index} variant="outline" className="mr-1 mb-1 text-red-600">
                          {weakness}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Extracted Data Display */}
      {(extractedData1 || extractedData2) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Extracted Policy Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {extractedData1 && (
                <div>
                  <h3 className="font-semibold mb-4">Policy 1: {extractedData1.insurerName}</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Annual Premium</label>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(extractedData1.premium.annual, extractedData1.premium.currency)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Policy Number</label>
                      <p className="font-mono">{extractedData1.policyNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Type</label>
                      <Badge variant="outline">{extractedData1.policyType}</Badge>
                    </div>
                  </div>
                </div>
              )}
              
              {extractedData2 && (
                <div>
                  <h3 className="font-semibold mb-4">Policy 2: {extractedData2.insurerName}</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Annual Premium</label>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(extractedData2.premium.annual, extractedData2.premium.currency)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Policy Number</label>
                      <p className="font-mono">{extractedData2.policyNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Type</label>
                      <Badge variant="outline">{extractedData2.policyType}</Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PolicyExtractionDemo;
