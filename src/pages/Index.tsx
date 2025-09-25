import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTrialAccess } from "@/hooks/useTrialAccess";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import LocalDocumentAnalyzer from "@/components/LocalDocumentAnalyzer";
import AnalysisResultsSection from "@/components/AnalysisResultsSection";
import FooterSection from "@/components/FooterSection";
import LoginDialog from "@/components/LoginDialog";
import { InsuranceChatbot } from "@/components/InsuranceChatbot";
import SocialMediaContentGenerator from "@/components/SocialMediaContentGenerator";
import { Card } from "@/components/ui/card";
import { FileText, BarChart3, Shield, MessageCircle } from "lucide-react";
import { PolicyDocument, AnalysisResult } from "@/lib/chatpdf-types";
import { uploadDocumentForAnalysis, sendChatMessage } from "@/services/chatpdf-api";
import { saveAnalysisResultHistory, getAnalysisResultsHistory } from "@/services/history";
import { analytics } from "@/services/analytics";

const Index = () => {
  const [documents, setDocuments] = useState<PolicyDocument[]>([]);
  const [activeTab, setActiveTab] = useState("file");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { canUseFeature, useFeature } = useTrialAccess();

  // Track page view on component mount
  useEffect(() => {
    analytics.trackPageView('home');
  }, []);

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

  const requireAuth = (action: () => void, feature: 'documentUpload' | 'quickAnalysis' | 'chatMessages') => {
    if (!isAuthenticated && !canUseFeature(feature)) {
      setShowLoginDialog(true);
      analytics.trackEvent('auth_required', { action: feature });
      return;
    }
    
    if (!isAuthenticated) {
      // Use trial access
      useFeature(feature);
    }
    
    action();
  };

  const handleFileAdded = (newDocument: PolicyDocument) => {
    requireAuth(() => {
      setDocuments([newDocument]);
      analytics.trackDocumentUpload('file');
      analyzeDocumentForChat(newDocument);
    }, 'documentUpload');
  };

  const handleTextAdded = (newDocument: PolicyDocument) => {
    requireAuth(() => {
      setDocuments([newDocument]);
      analytics.trackDocumentUpload('text');
      analyzeDocumentForChat(newDocument);
    }, 'documentUpload');
  };

  const handleUseSampleText = () => {
    requireAuth(() => {
      const sampleDocument: PolicyDocument = {
        id: `sample-${Date.now()}`,
        name: "Sample Home Insurance Policy",
        type: "text",
        content: samplePolicyText,
        status: "ready"
      };
      setDocuments([sampleDocument]);
      analytics.trackDocumentUpload('sample');
      analyzeDocumentForChat(sampleDocument);
    }, 'documentUpload');
  };

  const handleRemoveDocument = (id: string) => {
    const documentToRemove = documents.find(doc => doc.id === id);
    setDocuments(documents.filter(doc => doc.id !== id));
    
    if (documentToRemove?.previewUrl) {
      URL.revokeObjectURL(documentToRemove.previewUrl);
    }
    
    setAnalysisResult(null);
    setShowAnalysis(false);
    analytics.trackEvent('document_removed');
  };

  const analyzeDocumentForChat = async (document: PolicyDocument) => {
    if (!document) return;
    
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setShowAnalysis(false);
    
    try {
      console.log("Processing document for analysis:", document.name);
      analytics.trackAnalysisRequest('policy_analysis');
      
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
      
      analytics.trackEvent('analysis_completed', { 
        document_type: document.type,
        risk_level: result.risk_assessment?.overall_risk_level 
      });
      
      toast({
        title: "Analysis Complete",
        description: "Your policy has been analyzed and is ready for review.",
      });

    } catch (error) {
      console.error("Error processing document:", error);
      analytics.trackEvent('analysis_failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      
      let errorMessage = "There was an error analyzing your document. Please try again.";
      
      if (error instanceof Error) {
        console.log("Error message:", error.message);
        
        if (error.message.includes("authentication failed") || error.message.includes("401")) {
          errorMessage = "❌ ChatPDF API authentication failed. The API key may be invalid, expired, or lack proper permissions. Please check the API key configuration.";
        } else if (error.message.includes("rate limit") || error.message.includes("429")) {
          errorMessage = "⏳ ChatPDF API rate limit exceeded. Please wait a moment and try again.";
        } else if (error.message.includes("file too large") || error.message.includes("413")) {
          errorMessage = "📄 File is too large for ChatPDF. Please try a smaller file (max 32MB).";
        } else if (error.message.includes("network") || error.message.includes("fetch")) {
          errorMessage = "🌐 Network error. Please check your internet connection and try again.";
        } else if (error.message.includes("Invalid analysis result")) {
          errorMessage = "⚠️ ChatPDF returned an invalid response. Please try again.";
        } else if (error.message.includes("No source ID")) {
          errorMessage = "🔍 ChatPDF failed to process the document. Please try again.";
        } else if (error.message.includes("No content returned")) {
          errorMessage = "📝 ChatPDF did not return analysis content. Please try again.";
        } else {
          errorMessage = `🤖 ChatPDF Error: ${error.message}`;
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
    if (!isAuthenticated && !canUseFeature('chatMessages')) {
      setShowLoginDialog(true);
      analytics.trackEvent('auth_required', { action: 'chat_message' });
      return "Please sign in to continue chatting about your policy.";
    }
    
    if (!isAuthenticated) {
      useFeature('chatMessages');
    }

    setIsChatting(true);
    analytics.trackChatMessage(message.length);
    
    try {
      const documentId = analysisResult?.document_id;
      
      if (!documentId) {
        // Provide intelligent responses based on the question asked
        const question = message.toLowerCase();
        
        if (question.includes('deductible')) {
          return `**Insurance Deductible Explained:**

A deductible is the amount of money you must pay out-of-pocket before your insurance coverage begins to pay for covered expenses.

**How it works:**
• If you have a $500 deductible and file a $2,000 claim
• You pay the first $500
• Your insurance covers the remaining $1,500

**Types of deductibles:**
• **Per-incident:** You pay the deductible for each separate claim
• **Annual:** You pay the deductible once per policy year
• **Percentage:** Some policies use a percentage of the claim amount

**Higher vs Lower deductibles:**
• Higher deductible = Lower monthly premiums
• Lower deductible = Higher monthly premiums

**Common deductible amounts:**
• Auto insurance: $250 - $1,000
• Home insurance: $500 - $2,500
• Health insurance: $1,000 - $5,000+

Would you like to know about deductibles for a specific type of insurance?`;
        }
        
        if (question.includes('premium')) {
          return `**Insurance Premium Explained:**

A premium is the amount you pay to keep your insurance policy active, typically paid monthly, quarterly, or annually.

**What affects your premium:**
• Your risk profile (age, location, driving record, etc.)
• Coverage amount and type
• Deductible amount (higher deductible = lower premium)
• Claims history
• Credit score (in some states)

**Ways to lower premiums:**
• Increase your deductible
• Bundle multiple policies
• Maintain good credit
• Take advantage of discounts
• Shop around annually

**Average premiums:**
• Auto insurance: $1,500 - $2,000/year
• Home insurance: $1,200 - $1,500/year
• Life insurance: Varies widely by age and coverage

Your premium is separate from your deductible - you pay premiums to maintain coverage, and deductibles when you file a claim.`;
        }
        
        if (question.includes('coverage') || question.includes('limit')) {
          return `**Insurance Coverage Limits Explained:**

Coverage limits are the maximum amounts your insurance company will pay for covered claims.

**Types of limits:**
• **Per-incident limit:** Maximum for a single claim
• **Annual limit:** Maximum per policy year
• **Lifetime limit:** Maximum over the life of the policy

**Common coverage types:**
• **Liability coverage:** Covers damage you cause to others
• **Property coverage:** Covers your own property/belongings
• **Medical coverage:** Covers medical expenses

**Example coverage limits:**
• Auto liability: $100,000/$300,000/$100,000
• Home dwelling: $250,000 - $500,000+
• Personal property: 50-70% of dwelling coverage

**Important:** If your claim exceeds your coverage limit, you're responsible for the difference. It's crucial to have adequate coverage limits based on your assets and potential risks.`;
        }
        
        if (question.includes('claim')) {
          return `**Insurance Claims Process:**

A claim is a formal request to your insurance company for payment of a covered loss.

**How to file a claim:**
1. **Report immediately:** Contact your insurer ASAP
2. **Document everything:** Take photos, keep receipts
3. **File police report:** If applicable (theft, accidents)
4. **Meet with adjuster:** They'll assess the damage
5. **Review settlement:** Accept or negotiate the offer

**Types of claims:**
• **First-party:** You claim against your own policy
• **Third-party:** Someone claims against your policy

**What affects claim approval:**
• Whether the incident is covered
• If premiums are up to date
• Accuracy of information provided
• Policy limits and deductibles

**Timeline:**
• Simple claims: 1-2 weeks
• Complex claims: 30-60 days
• Disputed claims: Can take months

**Tips for successful claims:**
• Keep detailed records
• Be honest and accurate
• Follow up regularly
• Know your policy coverage`;
        }
        
        // General response for other questions
        return `I'm here to help with your insurance questions! 

**Popular topics I can explain:**
• **Deductibles** - How much you pay before insurance kicks in
• **Premiums** - Your insurance payment amounts
• **Coverage limits** - Maximum amounts your insurance pays
• **Claims process** - How to file and what to expect

Try asking me about any of these topics specifically, like "What is a deductible?" or "How do insurance claims work?"

For detailed analysis of your specific policy, please upload your policy document above.`;
      }
      
      const response = await sendChatMessage(documentId, message);
      analytics.trackEvent('chat_response_received', { response_length: response.length });
      return response;
    } catch (error) {
      console.error("Error sending message:", error);
      analytics.trackEvent('chat_error', { error: error instanceof Error ? error.message : 'Unknown error' });
      
      if (error instanceof Error) {
        if (error.message.includes("authentication failed") || error.message.includes("401")) {
          return "❌ ChatPDF API authentication failed. Please check the API configuration.";
        } else {
          return `🤖 ChatPDF Error: ${error.message}`;
        }
      }
      
      return "Sorry, there was an error processing your message. Please try again.";
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <HeroSection onUseSampleText={handleUseSampleText} />

      {/* Features Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Insurance Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive AI-powered insurance solutions for all your needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="flex items-center mb-4">
                <FileText className="h-8 w-8 text-primary mr-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold">Policy Analysis</h3>
              </div>
              <p className="text-muted-foreground">
                Upload your insurance policy and get detailed analysis with gap identification and recommendations.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => window.location.href = '/comparison'}>
              <div className="flex items-center mb-4">
                <BarChart3 className="h-8 w-8 text-primary mr-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold">Policy Comparison</h3>
              </div>
              <p className="text-muted-foreground">
                Compare multiple insurance policies side by side to find the best coverage for your needs.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => window.location.href = '/cyber-insurance'}>
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 text-primary mr-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold">Cyber Insurance</h3>
              </div>
              <p className="text-muted-foreground">
                AI-powered cyber insurance risk assessment for startups with instant quotes and real-time analysis.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="flex items-center mb-4">
                <MessageCircle className="h-8 w-8 text-primary mr-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold">AI Assistant</h3>
              </div>
              <p className="text-muted-foreground">
                Chat with our AI assistant to get instant answers about your insurance policies and coverage.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <main className="container mx-auto py-8 md:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-1 space-y-6">
              <LocalDocumentAnalyzer />
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
      
      <SocialMediaContentGenerator />
      
      <FooterSection />
      
      <InsuranceChatbot />
      
      <LoginDialog 
        isOpen={showLoginDialog} 
        onClose={() => setShowLoginDialog(false)}
        onSuccess={() => setShowLoginDialog(false)}
      />
    </div>
  );
};

export default Index;
