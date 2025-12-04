import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  User, 
  BarChart3, 
  Upload,
  Loader2,
  Brain,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import UserProfileForm from './UserProfileForm';
import PolicyIntelligenceDashboard from './PolicyIntelligenceDashboard';
import FileUploader from './FileUploader';
import { policyIntelligenceEngine } from '@/services/policyIntelligenceEngine';
import { UserProfile, PolicyIntelligenceReport } from '@/types/policyIntelligence';
import { PolicyDocument } from '@/lib/chatpdf-types';

const TruePolicyIntelligence: React.FC = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [policyText, setPolicyText] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [report, setReport] = useState<PolicyIntelligenceReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<PolicyDocument | null>(null);

  const handleDocumentUpload = (document: PolicyDocument) => {
    setUploadedDocument(document);
    if (document.content) {
      setPolicyText(document.content);
    }
    toast.success('Document uploaded successfully');
    setActiveTab('profile');
  };

  const handleProfileSubmit = async (profile: UserProfile) => {
    setUserProfile(profile);
    
    if (!policyText) {
      toast.error('Please upload a policy document first');
      setActiveTab('upload');
      return;
    }

    setIsAnalyzing(true);
    try {
      const intelligenceReport = await policyIntelligenceEngine.generateReport(profile, policyText);
      setReport(intelligenceReport);
      setActiveTab('results');
      toast.success('Policy analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze policy. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePastePolicy = () => {
    if (policyText.length > 100) {
      toast.success('Policy text saved');
      setActiveTab('profile');
    } else {
      toast.error('Please paste your full policy document');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          True Policy Intelligence
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          AI that actually reads and understands every clause, exclusion, limit, and condition — 
          then maps it against your actual life situation to identify real coverage gaps.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center ${activeTab === 'upload' || policyText ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${policyText ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {policyText ? <CheckCircle className="h-5 w-5" /> : '1'}
            </div>
            <span className="ml-2 font-medium">Upload Policy</span>
          </div>
          <div className="w-12 h-0.5 bg-muted" />
          <div className={`flex items-center ${activeTab === 'profile' || userProfile ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${userProfile ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {userProfile ? <CheckCircle className="h-5 w-5" /> : '2'}
            </div>
            <span className="ml-2 font-medium">Your Profile</span>
          </div>
          <div className="w-12 h-0.5 bg-muted" />
          <div className={`flex items-center ${activeTab === 'results' ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${report ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {report ? <CheckCircle className="h-5 w-5" /> : '3'}
            </div>
            <span className="ml-2 font-medium">Intelligence Report</span>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Policy
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2" disabled={!policyText}>
            <User className="h-4 w-4" />
            Your Profile
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2" disabled={!report}>
            <BarChart3 className="h-4 w-4" />
            Intelligence Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload Your Policy Document
              </CardTitle>
              <CardDescription>
                Upload your insurance policy PDF for AI-powered analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploader onDocumentUploaded={handleDocumentUpload} />
            </CardContent>
          </Card>

          <div className="text-center text-muted-foreground">OR</div>

          <Card>
            <CardHeader>
              <CardTitle>Paste Policy Text</CardTitle>
              <CardDescription>
                Copy and paste your policy document text directly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="policyText">Policy Text</Label>
                <Textarea
                  id="policyText"
                  value={policyText}
                  onChange={(e) => setPolicyText(e.target.value)}
                  placeholder="Paste your full policy document here..."
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>
              <Button onClick={handlePastePolicy} disabled={policyText.length < 100}>
                Continue with Pasted Text
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          {isAnalyzing ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">Analyzing Your Policy</h3>
                    <p className="text-muted-foreground">
                      AI is reading through your policy document, extracting 200+ data points, 
                      and matching against your profile...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Alert className="mb-6">
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  Tell us about your situation so we can identify gaps between what you need and what your policy actually covers.
                </AlertDescription>
              </Alert>
              <UserProfileForm onSubmit={handleProfileSubmit} initialProfile={userProfile || undefined} />
            </>
          )}
        </TabsContent>

        <TabsContent value="results" className="mt-6">
          {report && <PolicyIntelligenceDashboard report={report} />}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TruePolicyIntelligence;
