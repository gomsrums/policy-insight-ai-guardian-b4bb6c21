import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Scale, 
  FileText, 
  Calculator, 
  Activity,
  Sparkles
} from 'lucide-react';
import Header from '@/components/Header';
import FooterSection from '@/components/FooterSection';
import { RiskScoringEngine } from '@/components/RiskScoringEngine';
import { PolicyComparisonTool } from '@/components/PolicyComparisonTool';
import { RegulatoryComplianceChecker } from '@/components/RegulatoryComplianceChecker';
import { CostBenefitAnalyzer } from '@/components/CostBenefitAnalyzer';
import { ClaimPredictionEngine } from '@/components/ClaimPredictionEngine';

const ImpactFeatures: React.FC = () => {
  const [analysisData, setAnalysisData] = useState<any>(null);

  // You can pass analysis data from uploaded documents
  // For now, we'll use mock data or let users analyze within each tool

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <Badge variant="outline" className="mb-4">
            <Sparkles className="h-3 w-3 mr-1" />
            Advanced Analytics
          </Badge>
          <h1 className="text-4xl font-bold mb-4">
            Insurance Intelligence Suite
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powerful tools to analyze policies, predict claims, ensure compliance, 
            and make data-driven insurance decisions.
          </p>
        </div>

        <Tabs defaultValue="risk-scoring" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2 h-auto p-2">
            <TabsTrigger value="risk-scoring" className="flex items-center gap-2 py-3">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Risk Score</span>
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2 py-3">
              <Scale className="h-4 w-4" />
              <span className="hidden sm:inline">Compare</span>
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-2 py-3">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Compliance</span>
            </TabsTrigger>
            <TabsTrigger value="cost-benefit" className="flex items-center gap-2 py-3">
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">Cost-Benefit</span>
            </TabsTrigger>
            <TabsTrigger value="claims" className="flex items-center gap-2 py-3">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Claims</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="risk-scoring">
            <RiskScoringEngine analysisData={analysisData} />
          </TabsContent>

          <TabsContent value="comparison">
            <PolicyComparisonTool />
          </TabsContent>

          <TabsContent value="compliance">
            <RegulatoryComplianceChecker analysisData={analysisData} />
          </TabsContent>

          <TabsContent value="cost-benefit">
            <CostBenefitAnalyzer analysisData={analysisData} />
          </TabsContent>

          <TabsContent value="claims">
            <ClaimPredictionEngine analysisData={analysisData} />
          </TabsContent>
        </Tabs>

        {/* Feature Overview Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
            <Shield className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Automated Risk Scoring</h3>
            <p className="text-sm text-muted-foreground">
              Get a numerical score (1-100) based on coverage gaps, risk factors, 
              and industry benchmarks with actionable insights.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
            <Scale className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Policy Comparison</h3>
            <p className="text-sm text-muted-foreground">
              Compare up to 4 policies side-by-side. See coverage differences, 
              limits, and get AI-powered recommendations.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
            <FileText className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Compliance Checker</h3>
            <p className="text-sm text-muted-foreground">
              Check policies against regulatory requirements for US, EU, UK, 
              and India. Get alerts for non-compliance issues.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
            <Calculator className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Cost-Benefit Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Calculate if your coverage limits justify premiums. Find potential 
              savings and optimize your insurance spend.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
            <Activity className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Claim Prediction</h3>
            <p className="text-sm text-muted-foreground">
              Estimate likelihood of common claims based on policy gaps. 
              See uninsured risk exposure and mitigation strategies.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-primary/50 bg-primary/5 backdrop-blur-sm">
            <Sparkles className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Pro Tip</h3>
            <p className="text-sm text-muted-foreground">
              Upload and analyze your policy on the home page first, then return 
              here for deeper analysis with pre-loaded data.
            </p>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default ImpactFeatures;
