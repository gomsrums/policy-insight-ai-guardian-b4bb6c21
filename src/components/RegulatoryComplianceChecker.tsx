import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CheckCircle, XCircle, FileText, MapPin, Loader2 } from 'lucide-react';

interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  region: string;
  category: string;
  mandatory: boolean;
  status?: 'compliant' | 'non-compliant' | 'partial';
  notes?: string;
}

interface RegulatoryComplianceCheckerProps {
  analysisData?: {
    gaps?: string[];
    coverage_analysis?: Array<{
      type: string;
      status: string;
    }>;
  };
}

const REGULATORY_REQUIREMENTS: ComplianceRequirement[] = [
  // US Requirements
  { id: 'us-liability', name: 'General Liability Coverage', description: 'Most states require businesses to carry liability insurance', region: 'US', category: 'Business', mandatory: true },
  { id: 'us-workers', name: 'Workers Compensation', description: 'Required for businesses with employees in most states', region: 'US', category: 'Business', mandatory: true },
  { id: 'us-auto', name: 'Commercial Auto Insurance', description: 'Required for business vehicles', region: 'US', category: 'Auto', mandatory: true },
  { id: 'us-hipaa', name: 'HIPAA Compliance Coverage', description: 'Required for healthcare-related businesses', region: 'US', category: 'Healthcare', mandatory: true },
  { id: 'us-cyber', name: 'Cyber Liability Insurance', description: 'Recommended for data-handling businesses', region: 'US', category: 'Technology', mandatory: false },
  
  // EU Requirements
  { id: 'eu-gdpr', name: 'GDPR Data Protection Coverage', description: 'Required for businesses handling EU personal data', region: 'EU', category: 'Technology', mandatory: true },
  { id: 'eu-liability', name: 'Professional Indemnity', description: 'Required for professional services', region: 'EU', category: 'Business', mandatory: true },
  { id: 'eu-product', name: 'Product Liability Insurance', description: 'Required for manufacturers and importers', region: 'EU', category: 'Manufacturing', mandatory: true },
  
  // UK Requirements
  { id: 'uk-employer', name: 'Employers Liability', description: 'Legally required for UK employers', region: 'UK', category: 'Business', mandatory: true },
  { id: 'uk-motor', name: 'Motor Insurance', description: 'Required for all vehicles', region: 'UK', category: 'Auto', mandatory: true },
  { id: 'uk-pi', name: 'Professional Indemnity', description: 'Required for regulated professions', region: 'UK', category: 'Professional', mandatory: true },
  
  // India Requirements
  { id: 'in-motor', name: 'Third Party Motor Insurance', description: 'Mandatory under Motor Vehicles Act', region: 'India', category: 'Auto', mandatory: true },
  { id: 'in-health', name: 'Health Insurance (Ayushman Bharat)', description: 'Government health scheme compliance', region: 'India', category: 'Healthcare', mandatory: false },
  { id: 'in-fire', name: 'Fire Insurance', description: 'Required for commercial properties', region: 'India', category: 'Property', mandatory: true },
];

export const RegulatoryComplianceChecker: React.FC<RegulatoryComplianceCheckerProps> = ({ analysisData }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [complianceResults, setComplianceResults] = useState<ComplianceRequirement[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const regions = ['US', 'EU', 'UK', 'India'];
  const categories = ['all', 'Business', 'Auto', 'Healthcare', 'Technology', 'Property', 'Professional', 'Manufacturing'];

  const checkCompliance = () => {
    if (!selectedRegion) return;
    
    setIsChecking(true);
    
    setTimeout(() => {
      const filteredRequirements = REGULATORY_REQUIREMENTS.filter(r => 
        r.region === selectedRegion && 
        (selectedCategory === 'all' || r.category === selectedCategory)
      );

      // Check each requirement against the analysis data
      const results = filteredRequirements.map(req => {
        let status: 'compliant' | 'non-compliant' | 'partial' = 'non-compliant';
        let notes = '';

        const coverageAnalysis = analysisData?.coverage_analysis || [];
        const gaps = analysisData?.gaps || [];

        // Check if there's related coverage
        const relatedCoverage = coverageAnalysis.find(c => 
          c.type.toLowerCase().includes(req.name.toLowerCase().split(' ')[0]) ||
          req.name.toLowerCase().includes(c.type.toLowerCase().split(' ')[0])
        );

        // Check if it's mentioned in gaps
        const inGaps = gaps.some(g => 
          g.toLowerCase().includes(req.name.toLowerCase().split(' ')[0])
        );

        if (relatedCoverage) {
          if (relatedCoverage.status === 'Covered') {
            status = 'compliant';
            notes = 'Coverage detected in policy';
          } else if (relatedCoverage.status === 'Partial') {
            status = 'partial';
            notes = 'Partial coverage - review limits';
          }
        } else if (inGaps) {
          status = 'non-compliant';
          notes = 'Identified as a gap in coverage';
        } else if (!req.mandatory) {
          status = 'partial';
          notes = 'Optional coverage - consider adding';
        }

        return { ...req, status, notes };
      });

      setComplianceResults(results);
      setIsChecking(false);
    }, 1000);
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'partial': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'non-compliant': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status?: string, mandatory?: boolean) => {
    if (!status) return null;
    const variant = status === 'compliant' ? 'default' : status === 'partial' ? 'secondary' : 'destructive';
    return (
      <div className="flex gap-2">
        <Badge variant={variant}>
          {status === 'compliant' ? 'Compliant' : status === 'partial' ? 'Partial' : 'Non-Compliant'}
        </Badge>
        {mandatory && <Badge variant="outline">Mandatory</Badge>}
      </div>
    );
  };

  const complianceScore = complianceResults.length > 0
    ? Math.round((complianceResults.filter(r => r.status === 'compliant').length / complianceResults.length) * 100)
    : 0;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Regulatory Compliance Checker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Region Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Select Region
            </label>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Choose region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category Filter</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button 
              onClick={checkCompliance} 
              disabled={!selectedRegion || isChecking}
              className="w-full"
            >
              {isChecking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                'Check Compliance'
              )}
            </Button>
          </div>
        </div>

        {/* Results */}
        {complianceResults.length > 0 && (
          <>
            {/* Compliance Score */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Compliance Score</span>
                <span className={`text-2xl font-bold ${
                  complianceScore >= 80 ? 'text-green-500' : 
                  complianceScore >= 50 ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {complianceScore}%
                </span>
              </div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    complianceScore >= 80 ? 'bg-green-500' : 
                    complianceScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${complianceScore}%` }}
                />
              </div>
            </div>

            {/* Requirements List */}
            <div className="space-y-3">
              {complianceResults.map(req => (
                <div 
                  key={req.id} 
                  className={`p-4 rounded-lg border ${
                    req.status === 'compliant' ? 'border-green-500/30 bg-green-500/5' :
                    req.status === 'partial' ? 'border-yellow-500/30 bg-yellow-500/5' :
                    'border-red-500/30 bg-red-500/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(req.status)}
                      <div>
                        <h4 className="font-medium">{req.name}</h4>
                        <p className="text-sm text-muted-foreground">{req.description}</p>
                        {req.notes && (
                          <p className="text-sm mt-1 text-primary">{req.notes}</p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(req.status, req.mandatory)}
                  </div>
                </div>
              ))}
            </div>

            {/* Alerts for Non-Compliant */}
            {complianceResults.filter(r => r.status === 'non-compliant' && r.mandatory).length > 0 && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="flex items-center gap-2 text-red-500 font-semibold mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  Compliance Alert
                </div>
                <p className="text-sm">
                  You have {complianceResults.filter(r => r.status === 'non-compliant' && r.mandatory).length} mandatory 
                  requirements that are not met. This may expose you to legal and financial risks.
                </p>
              </div>
            )}
          </>
        )}

        {!analysisData && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Upload and analyze a policy first for accurate compliance checking
          </p>
        )}
      </CardContent>
    </Card>
  );
};
