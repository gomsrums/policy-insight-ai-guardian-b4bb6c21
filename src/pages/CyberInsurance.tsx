import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { Shield, AlertTriangle, CheckCircle, Zap, Brain, Eye, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const CyberInsurance = () => {
  const { isAuthenticated } = useAuth();
  const [companyData, setCompanyData] = useState({
    name: "",
    employees: "",
    revenue: "",
    industry: "",
    cloudProviders: "",
    securityTools: ""
  });
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!isAuthenticated) {
      alert("Please sign in to access cyber insurance analysis");
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const score = Math.floor(Math.random() * 40) + 60; // 60-100 range
      setRiskScore(score);
      setIsAnalyzing(false);
    }, 2000);
  };

  const getRiskLevel = (score: number) => {
    if (score >= 85) return { level: "Low", color: "bg-green-500", textColor: "text-green-700" };
    if (score >= 70) return { level: "Medium", color: "bg-yellow-500", textColor: "text-yellow-700" };
    return { level: "High", color: "bg-red-500", textColor: "text-red-700" };
  };


  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-12 w-12 text-primary mr-3" />
              <Brain className="h-10 w-10 text-secondary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              AI-Powered Cyber Insurance for Tech Startups
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Affordable, intelligent cyber protection with real-time risk assessment and automated underwriting
            </p>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="assessment" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="assessment">🔍 Risk Assessment</TabsTrigger>
              <TabsTrigger value="dashboard">📊 Cyber Health Score</TabsTrigger>
              <TabsTrigger value="threats">⚠️ Threat Intelligence</TabsTrigger>
            </TabsList>

            <TabsContent value="assessment">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      AI-Powered Risk Assessment
                    </CardTitle>
                    <CardDescription>
                      Our AI analyzes your startup's digital infrastructure to provide accurate risk scoring
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="company">Company Name</Label>
                        <Input
                          id="company"
                          value={companyData.name}
                          onChange={(e) => setCompanyData(prev => ({...prev, name: e.target.value}))}
                          placeholder="Your startup name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="employees">Employees</Label>
                        <Input
                          id="employees"
                          value={companyData.employees}
                          onChange={(e) => setCompanyData(prev => ({...prev, employees: e.target.value}))}
                          placeholder="e.g., 10-50"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="revenue">Annual Revenue</Label>
                        <Input
                          id="revenue"
                          value={companyData.revenue}
                          onChange={(e) => setCompanyData(prev => ({...prev, revenue: e.target.value}))}
                          placeholder="e.g., $1M-$5M"
                        />
                      </div>
                      <div>
                        <Label htmlFor="industry">Industry</Label>
                        <Input
                          id="industry"
                          value={companyData.industry}
                          onChange={(e) => setCompanyData(prev => ({...prev, industry: e.target.value}))}
                          placeholder="e.g., SaaS, Fintech"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="cloud">Cloud Providers</Label>
                      <Input
                        id="cloud"
                        value={companyData.cloudProviders}
                        onChange={(e) => setCompanyData(prev => ({...prev, cloudProviders: e.target.value}))}
                        placeholder="e.g., AWS, Google Cloud, Azure"
                      />
                    </div>

                    <div>
                      <Label htmlFor="security">Security Tools</Label>
                      <Input
                        id="security"
                        value={companyData.securityTools}
                        onChange={(e) => setCompanyData(prev => ({...prev, securityTools: e.target.value}))}
                        placeholder="e.g., Okta, CrowdStrike, Splunk"
                      />
                    </div>

                    <Button 
                      onClick={handleAnalyze} 
                      className="w-full"
                      disabled={isAnalyzing || !companyData.name}
                    >
                      {isAnalyzing ? (
                        <>
                          <Brain className="mr-2 h-4 w-4 animate-spin" />
                          AI Analyzing...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-4 w-4" />
                          Generate AI Risk Assessment
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {riskScore && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Risk Assessment Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold mb-2">{riskScore}/100</div>
                        <Badge className={`${getRiskLevel(riskScore).color} text-white`}>
                          {getRiskLevel(riskScore).level} Risk
                        </Badge>
                      </div>
                      
                      <Progress value={riskScore} className="w-full" />
                      
                      <div className="space-y-3">
                        <h4 className="font-semibold">AI Analysis Summary:</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Strong cloud security configuration detected</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <span>Employee security training needs improvement</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Multi-factor authentication properly implemented</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <h4 className="font-semibold mb-2">Estimated Monthly Premium:</h4>
                        <div className="text-2xl font-bold text-primary">
                          ${Math.floor((100 - riskScore) * 50 + 200)}/month
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Based on AI risk analysis and industry benchmarks
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="dashboard">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Cyber Health Score Dashboard
                  </CardTitle>
                  <CardDescription>
                    Real-time monitoring and assessment coming soon
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="text-muted-foreground mb-4">
                      This feature will be available once API integrations are configured
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Connect to cloud security APIs to enable real-time health monitoring
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="threats">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Real-Time Threat Intelligence
                  </CardTitle>
                  <CardDescription>
                    Dark web monitoring and threat detection coming soon
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="text-muted-foreground mb-4">
                      This feature will be available once threat intelligence APIs are configured
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Connect to security feeds and breach databases for real-time monitoring
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default CyberInsurance;