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

  const mockThreats = [
    { type: "Phishing Attempts", count: 23, trend: "up" },
    { type: "Malware Detection", count: 5, trend: "down" },
    { type: "Suspicious Logins", count: 12, trend: "up" },
    { type: "Data Breach Attempts", count: 2, trend: "stable" }
  ];

  const mockRecommendations = [
    "Implement multi-factor authentication across all systems",
    "Update endpoint protection to latest version",
    "Conduct security awareness training for employees",
    "Review and update backup recovery procedures"
  ];

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
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="assessment">🔍 Risk Assessment</TabsTrigger>
              <TabsTrigger value="dashboard">📊 Cyber Health Score</TabsTrigger>
              <TabsTrigger value="threats">⚠️ Threat Intelligence</TabsTrigger>
              <TabsTrigger value="coverage">🛡️ Coverage Options</TabsTrigger>
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Cyber Health Score Dashboard
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">85</div>
                        <div className="text-sm text-green-700">Security Score</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">92</div>
                        <div className="text-sm text-blue-700">Compliance</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">78</div>
                        <div className="text-sm text-yellow-700">Incident Response</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">88</div>
                        <div className="text-sm text-purple-700">Data Protection</div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold">Recent Security Events</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                          <span className="text-sm">Security patch applied to cloud infrastructure</span>
                          <Badge variant="secondary">2 hours ago</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
                          <span className="text-sm">Unusual login attempt detected and blocked</span>
                          <Badge variant="secondary">6 hours ago</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockRecommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 border rounded">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                          <span className="text-sm">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="threats">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Real-Time Threat Intelligence
                    </CardTitle>
                    <CardDescription>
                      AI-powered monitoring of dark web and breach databases
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockThreats.map((threat, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded">
                          <div>
                            <div className="font-medium">{threat.type}</div>
                            <div className="text-sm text-muted-foreground">Last 24 hours</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold">{threat.count}</span>
                            <TrendingUp className={`h-4 w-4 ${
                              threat.trend === 'up' ? 'text-red-500' : 
                              threat.trend === 'down' ? 'text-green-500' : 'text-gray-500'
                            }`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Fraud Detection AI</CardTitle>
                    <CardDescription>
                      Advanced pattern recognition for anomaly detection
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded">
                        <h4 className="font-medium text-green-800">System Status: Healthy</h4>
                        <p className="text-sm text-green-600 mt-1">
                          No suspicious patterns detected in the last 7 days
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">AI Monitoring:</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Login patterns</span>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                          <div className="flex justify-between">
                            <span>Data access patterns</span>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                          <div className="flex justify-between">
                            <span>Network traffic analysis</span>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                          <div className="flex justify-between">
                            <span>Email security monitoring</span>
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="coverage">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Starter Plan */}
                <Card>
                  <CardHeader>
                    <CardTitle>Startup Shield</CardTitle>
                    <CardDescription>Perfect for early-stage startups</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">$299/mo</div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Up to $1M coverage
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        24/7 incident response
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Basic AI threat monitoring
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Cyber health dashboard
                      </li>
                    </ul>
                    <Button className="w-full mt-6">Get Started</Button>
                  </CardContent>
                </Card>

                {/* Growth Plan */}
                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle>Growth Guard</CardTitle>
                    <CardDescription>For scaling startups</CardDescription>
                    <Badge className="w-fit">Most Popular</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">$599/mo</div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Up to $5M coverage
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Advanced AI fraud detection
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Real-time threat intelligence
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Compliance assistance
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Business interruption coverage
                      </li>
                    </ul>
                    <Button className="w-full mt-6">Get Started</Button>
                  </CardContent>
                </Card>

                {/* Enterprise Plan */}
                <Card>
                  <CardHeader>
                    <CardTitle>Enterprise Fortress</CardTitle>
                    <CardDescription>For established tech companies</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">$1,299/mo</div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Up to $25M coverage
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Dedicated security team
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Custom AI models
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        White-label solutions
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Regulatory compliance suite
                      </li>
                    </ul>
                    <Button className="w-full mt-6">Contact Sales</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default CyberInsurance;