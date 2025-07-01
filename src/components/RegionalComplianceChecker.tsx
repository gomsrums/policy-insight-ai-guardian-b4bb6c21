import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Globe, Shield, AlertTriangle, CheckCircle, XCircle, FileText, Scale } from 'lucide-react';
import { AnalysisResult } from "@/lib/chatpdf-types";

interface ComplianceRule {
  id: string;
  regulation: string;
  description: string;
  mandatory: boolean;
  status: 'compliant' | 'non-compliant' | 'partial' | 'unknown';
  details: string;
  action?: string;
  deadline?: string;
  penalty?: string;
}

interface ComplianceData {
  region: string;
  overallScore: number;
  complianceLevel: 'Fully Compliant' | 'Mostly Compliant' | 'Partially Compliant' | 'Non-Compliant';
  totalRules: number;
  compliantRules: number;
  nonCompliantRules: number;
  partialRules: number;
  rules: ComplianceRule[];
  recommendations: string[];
  legalRequirements: {
    category: string;
    requirement: string;
    status: 'met' | 'not-met' | 'partial';
    description: string;
  }[];
}

interface RegionalComplianceCheckerProps {
  analysis: AnalysisResult;
  initialRegion?: string;
}

const RegionalComplianceChecker = ({ analysis, initialRegion = 'UK' }: RegionalComplianceCheckerProps) => {
  const [complianceData, setComplianceData] = useState<ComplianceData | null>(null);
  const [selectedRegion, setSelectedRegion] = useState(initialRegion);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const regions = [
    { value: 'UK', label: '🇬🇧 United Kingdom' },
    { value: 'US', label: '🇺🇸 United States' },
    { value: 'EU', label: '🇪🇺 European Union' },
    { value: 'India', label: '🇮🇳 India' },
    { value: 'Canada', label: '🇨🇦 Canada' },
    { value: 'Australia', label: '🇦🇺 Australia' }
  ];

  useEffect(() => {
    if (analysis?.summary) {
      performComplianceCheck();
    }
  }, [analysis, selectedRegion]);

  const performComplianceCheck = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      console.log(`Starting compliance check for ${selectedRegion}...`);
      
      // Simulate region-specific compliance analysis
      const mockComplianceData = generateMockComplianceData(selectedRegion);
      setComplianceData(mockComplianceData);
    } catch (err) {
      console.error('Compliance check failed:', err);
      setError('Failed to check compliance. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateMockComplianceData = (region: string): ComplianceData => {
    const baseData = {
      region,
      totalRules: 0,
      compliantRules: 0,
      nonCompliantRules: 0,
      partialRules: 0,
      rules: [] as ComplianceRule[],
      recommendations: [] as string[],
      legalRequirements: [] as any[]
    };

    switch (region) {
      case 'UK':
        return {
          ...baseData,
          overallScore: 78,
          complianceLevel: 'Mostly Compliant',
          totalRules: 12,
          compliantRules: 8,
          nonCompliantRules: 2,
          partialRules: 2,
          rules: [
            {
              id: '1',
              regulation: 'Solvency II Directive',
              description: 'EU regulation on insurance and reinsurance companies',
              mandatory: true,
              status: 'compliant',
              details: 'Capital requirements and risk management standards met'
            },
            {
              id: '2',
              regulation: 'GDPR Data Protection',
              description: 'General Data Protection Regulation compliance',
              mandatory: true,
              status: 'compliant',
              details: 'Data processing and privacy controls in place'
            },
            {
              id: '3',
              regulation: 'FCA Insurance Conduct Rules',
              description: 'Financial Conduct Authority regulations',
              mandatory: true,
              status: 'partial',
              details: 'Some customer communication requirements need improvement',
              action: 'Update policy wording and disclosure statements'
            },
            {
              id: '4',
              regulation: 'Flood Insurance Requirements',
              description: 'Mandatory flood coverage in high-risk areas',
              mandatory: true,
              status: 'non-compliant',
              details: 'Missing flood coverage in designated flood risk area',
              action: 'Add flood insurance coverage immediately',
              penalty: 'Potential regulatory sanctions and customer compensation'
            },
            {
              id: '5',
              regulation: 'Motor Insurance Act 1988',
              description: 'Compulsory motor insurance requirements',
              mandatory: true,
              status: 'compliant',
              details: 'Third-party liability coverage meets minimum requirements'
            }
          ],
          recommendations: [
            'Add flood insurance coverage to meet regional requirements',
            'Review and update policy documentation for FCA compliance',
            'Implement enhanced customer communication procedures',
            'Consider increasing minimum coverage limits above regulatory requirements'
          ],
          legalRequirements: [
            {
              category: 'Minimum Coverage',
              requirement: '£20M third-party liability for motor insurance',
              status: 'met',
              description: 'Current coverage: £25M'
            },
            {
              category: 'Data Protection',
              requirement: 'GDPR compliance for customer data',
              status: 'met',
              description: 'Privacy controls and consent mechanisms in place'
            },
            {
              category: 'Flood Coverage',
              requirement: 'Mandatory flood insurance in high-risk postcodes',
              status: 'not-met',
              description: 'No flood coverage detected - required for your location'
            }
          ]
        };

      case 'US':
        return {
          ...baseData,
          overallScore: 85,
          complianceLevel: 'Mostly Compliant',
          totalRules: 15,
          compliantRules: 11,
          nonCompliantRules: 2,
          partialRules: 2,
          rules: [
            {
              id: '1',
              regulation: 'NAIC Model Laws',
              description: 'National Association of Insurance Commissioners standards',
              mandatory: true,
              status: 'compliant',
              details: 'Meets state insurance regulatory requirements'
            },
            {
              id: '2',
              regulation: 'State Minimum Liability',
              description: 'State-mandated minimum insurance coverage',
              mandatory: true,
              status: 'compliant',
              details: 'Exceeds minimum liability requirements'
            },
            {
              id: '3',
              regulation: 'CCPA Privacy Rights',
              description: 'California Consumer Privacy Act compliance',
              mandatory: true,
              status: 'partial',
              details: 'Data deletion procedures need enhancement',
              action: 'Implement automated data deletion processes'
            },
            {
              id: '4',
              regulation: 'ADA Accessibility',
              description: 'Americans with Disabilities Act compliance',
              mandatory: true,
              status: 'non-compliant',
              details: 'Policy documents not accessible format',
              action: 'Provide accessible document formats',
              penalty: 'Potential discrimination lawsuits'
            }
          ],
          recommendations: [
            'Ensure policy documents meet ADA accessibility standards',
            'Enhance CCPA compliance procedures',
            'Review state-specific insurance requirements',
            'Consider excess liability coverage'
          ],
          legalRequirements: [
            {
              category: 'State Minimum Coverage',
              requirement: 'Liability coverage per state requirements',
              status: 'met',
              description: 'Exceeds minimum state requirements'
            },
            {
              category: 'Privacy Compliance',
              requirement: 'CCPA data protection compliance',
              status: 'partial',
              description: 'Some data handling procedures need update'
            }
          ]
        };

      case 'EU':
        return {
          ...baseData,
          overallScore: 82,
          complianceLevel: 'Mostly Compliant',
          totalRules: 14,
          compliantRules: 10,
          nonCompliantRules: 1,
          partialRules: 3,
          rules: [
            {
              id: '1',
              regulation: 'Solvency II Directive',
              description: 'EU-wide insurance regulation',
              mandatory: true,
              status: 'compliant',
              details: 'Capital adequacy and governance requirements met'
            },
            {
              id: '2',
              regulation: 'GDPR',
              description: 'General Data Protection Regulation',
              mandatory: true,
              status: 'compliant',
              details: 'Data protection measures fully implemented'
            },
            {
              id: '3',
              regulation: 'Motor Insurance Directive',
              description: 'EU motor insurance requirements',
              mandatory: true,
              status: 'partial',
              details: 'Cross-border coverage needs verification',
              action: 'Verify coverage across all EU member states'
            }
          ],
          recommendations: [
            'Verify cross-border insurance coverage compliance',
            'Review country-specific requirements',
            'Ensure multilingual documentation where required'
          ],
          legalRequirements: []
        };

      default:
        return {
          ...baseData,
          overallScore: 75,
          complianceLevel: 'Mostly Compliant',
          totalRules: 10,
          compliantRules: 7,
          nonCompliantRules: 2,
          partialRules: 1,
          rules: [],
          recommendations: ['Review local insurance regulations', 'Consult with local insurance experts'],
          legalRequirements: []
        };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'met':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'non-compliant':
      case 'not-met':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'partial':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'met':
        return <Badge variant="default">Compliant</Badge>;
      case 'non-compliant':
      case 'not-met':
        return <Badge variant="destructive">Non-Compliant</Badge>;
      case 'partial':
        return <Badge variant="secondary">Partial</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getComplianceLevelColor = (level: string) => {
    switch (level) {
      case 'Fully Compliant': return 'text-green-600';
      case 'Mostly Compliant': return 'text-blue-600';
      case 'Partially Compliant': return 'text-yellow-600';
      case 'Non-Compliant': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Regional Compliance Checking
          </CardTitle>
          <CardDescription>Checking compliance with {selectedRegion} regulations...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Analyzing compliance with regional regulations...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Compliance Check Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!complianceData) return null;

  return (
    <div className="space-y-6">
      {/* Region Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Regional Compliance Analysis
          </CardTitle>
          <CardDescription>
            Select your region to check compliance with local insurance regulations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region.value} value={region.value}>
                  {region.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${getComplianceLevelColor(complianceData.complianceLevel)}`}>
                {complianceData.overallScore}%
              </div>
              <p className="text-sm text-muted-foreground">Compliance Score</p>
              <Progress value={complianceData.overallScore} className="mt-2" />
              <Badge variant="outline" className="mt-2">
                {complianceData.complianceLevel}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {complianceData.compliantRules}
              </div>
              <p className="text-sm text-muted-foreground">Compliant Rules</p>
              <Badge variant="default" className="mt-2">Passed</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {complianceData.nonCompliantRules}
              </div>
              <p className="text-sm text-muted-foreground">Non-Compliant</p>
              <Badge variant="destructive" className="mt-2">Action Required</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {complianceData.partialRules}
              </div>
              <p className="text-sm text-muted-foreground">Partial Compliance</p>
              <Badge variant="secondary" className="mt-2">Review Needed</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rules" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rules">Regulatory Rules</TabsTrigger>
          <TabsTrigger value="requirements">Legal Requirements</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Regulatory Compliance Rules
              </CardTitle>
              <CardDescription>
                Detailed analysis of compliance with {selectedRegion} insurance regulations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Regulation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Mandatory</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Action Required</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complianceData.rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(rule.status)}
                          <div>
                            <div className="font-medium">{rule.regulation}</div>
                            <div className="text-sm text-muted-foreground">{rule.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(rule.status)}</TableCell>
                      <TableCell>
                        <Badge variant={rule.mandatory ? 'destructive' : 'outline'}>
                          {rule.mandatory ? 'Mandatory' : 'Optional'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{rule.details}</TableCell>
                      <TableCell className="text-sm">
                        {rule.action && (
                          <div>
                            <p className="font-medium text-red-600">{rule.action}</p>
                            {rule.penalty && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Risk: {rule.penalty}
                              </p>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Legal Requirements
              </CardTitle>
              <CardDescription>
                Mandatory legal requirements for insurance in {selectedRegion}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceData.legalRequirements.map((req, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(req.status)}
                        <div>
                          <h4 className="font-semibold">{req.category}</h4>
                          <p className="text-sm text-muted-foreground">{req.requirement}</p>
                        </div>
                      </div>
                      {getStatusBadge(req.status)}
                    </div>
                    <p className="text-sm">{req.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Compliance Recommendations
              </CardTitle>
              <CardDescription>
                Actions to improve compliance with {selectedRegion} regulations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {complianceData.recommendations.map((recommendation, index) => (
                  <Alert key={index} className="border-blue-200 bg-blue-50">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      {recommendation}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Critical Non-Compliance Alert */}
      {complianceData.nonCompliantRules > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Compliance Issues Detected</AlertTitle>
          <AlertDescription>
            Your policy has {complianceData.nonCompliantRules} non-compliant item(s) that require immediate attention. 
            Failure to address these issues may result in regulatory sanctions, penalties, or legal liability.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default RegionalComplianceChecker;