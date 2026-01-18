
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import SimpleComparisonForm, { ComparisonData } from "@/components/SimpleComparisonForm";
import SimpleComparisonResults from "@/components/SimpleComparisonResults";
import ParameterWeightSelector from "@/components/ParameterWeightSelector";
import { PolicyComparisonCriteria, DEFAULT_PARAMETER_WEIGHTS } from "@/types/comparison";
import { simpleComparisonEngine } from "@/services/simpleComparisonEngine";
import FancyBackground from "@/components/FancyBackground";

const Comparison = () => {
  const [parameterWeights, setParameterWeights] = useState<PolicyComparisonCriteria>(DEFAULT_PARAMETER_WEIGHTS);
  const [selectedMarket, setSelectedMarket] = useState<'US' | 'UK' | 'India'>('US');
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const { isAuthenticated } = useAuth();

  const handleCompare = async (data: ComparisonData) => {
    setIsComparing(true);
    setComparisonData(data);
    
    try {
      const result = await simpleComparisonEngine.comparePolicy(data);
      setComparisonResult(result);
    } catch (error) {
      console.error('Comparison failed:', error);
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <FancyBackground>
      <Header />
      
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-insurance-blue-dark mb-2">
              Policy Comparison & Data Extraction
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Compare insurance policies using AI-powered analysis with customizable comparison parameters
            </p>
          </div>

          {/* Enhanced Algorithm Info Card */}
          <Card className="mb-8 bg-white/80 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔍 Advanced Comparison Algorithm with 7 Key Parameters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-insurance-blue-dark mb-2">Core Parameters</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Premium costs (40%)</li>
                    <li>• Coverage extent (30%)</li>
                    <li>• Deductible amounts (15%)</li>
                    <li>• Policy exclusions (5%)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-insurance-blue-dark mb-2">Quality Metrics</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Insurer financial ratings (5%)</li>
                    <li>• Claims processing speed (3%)</li>
                    <li>• Customer service scores (2%)</li>
                    <li>• Customizable weights</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-insurance-blue-dark mb-2">Market Coverage</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• United States (USD)</li>
                    <li>• United Kingdom (GBP)</li>
                    <li>• India (INR)</li>
                    <li>• Multi-currency support</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-insurance-blue-dark mb-2">Success Metrics</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Bias-free comparisons</li>
                    <li>• User satisfaction tracking</li>
                    <li>• Parameter usage analytics</li>
                    <li>• Accuracy validation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="comparison" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="comparison">Policy Comparison</TabsTrigger>
              <TabsTrigger value="parameters">Parameter Configuration</TabsTrigger>
            </TabsList>
            
            <TabsContent value="comparison">
              <div className="space-y-6">
                <SimpleComparisonForm onCompare={handleCompare} isComparing={isComparing} />
                {comparisonResult && comparisonData && (
                  <SimpleComparisonResults 
                    comparison={comparisonResult} 
                    originalData={comparisonData}
                  />
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="parameters">
              <div className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
                  <CardHeader>
                    <CardTitle>Market Selection</CardTitle>
                    <p className="text-sm text-gray-600">
                      Choose your target market for parameter optimization
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      {(['US', 'UK', 'India'] as const).map((market) => (
                        <button
                          key={market}
                          className={`flex-1 p-3 rounded-lg border transition-colors ${
                            selectedMarket === market 
                              ? 'bg-insurance-blue text-white border-insurance-blue' 
                              : 'bg-white hover:bg-gray-50 border-gray-300'
                          }`}
                          onClick={() => setSelectedMarket(market)}
                        >
                          {market === 'US' && '🇺🇸 United States (USD)'}
                          {market === 'UK' && '🇬🇧 United Kingdom (GBP)'}
                          {market === 'India' && '🇮🇳 India (INR)'}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <ParameterWeightSelector
                  weights={parameterWeights}
                  onWeightsChange={setParameterWeights}
                  market={selectedMarket}
                />
                
                <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
                  <CardHeader>
                    <CardTitle>Parameter Data Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-semibold mb-2">AI Policy Extraction</h4>
                        <ul className="space-y-1 text-gray-600">
                          <li>• Premium amounts and payment terms</li>
                          <li>• Coverage types and limits</li>
                          <li>• Deductible structures</li>
                          <li>• Policy exclusions and limitations</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">External Data Sources</h4>
                        <ul className="space-y-1 text-gray-600">
                          <li>• AM Best, S&P, Moody's ratings</li>
                          <li>• Industry claims processing reports</li>
                          <li>• Customer satisfaction surveys</li>
                          <li>• Regulatory compliance data</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </FancyBackground>
  );
};

export default Comparison;
