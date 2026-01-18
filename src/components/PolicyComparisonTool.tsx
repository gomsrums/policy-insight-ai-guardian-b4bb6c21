import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scale, Plus, Trash2, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PolicyData {
  id: string;
  name: string;
  content: string;
  analysis?: {
    summary?: string;
    gaps?: string[];
    coverage_analysis?: Array<{
      type: string;
      status: string;
      limit?: string;
    }>;
    risk_assessment?: {
      overall_risk_level?: string;
    };
  };
}

interface ComparisonResult {
  policies: PolicyData[];
  coverageComparison: Array<{
    type: string;
    policies: Array<{ name: string; status: string; limit?: string }>;
  }>;
  winner: string;
  summary: string;
}

export const PolicyComparisonTool: React.FC = () => {
  const [policies, setPolicies] = useState<PolicyData[]>([
    { id: '1', name: 'Policy A', content: '' },
    { id: '2', name: 'Policy B', content: '' }
  ]);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);

  const addPolicy = () => {
    if (policies.length >= 4) {
      toast.error('Maximum 4 policies can be compared');
      return;
    }
    const newId = String(Date.now());
    setPolicies([...policies, { 
      id: newId, 
      name: `Policy ${String.fromCharCode(65 + policies.length)}`, 
      content: '' 
    }]);
  };

  const removePolicy = (id: string) => {
    if (policies.length <= 2) {
      toast.error('At least 2 policies required for comparison');
      return;
    }
    setPolicies(policies.filter(p => p.id !== id));
  };

  const updatePolicy = (id: string, field: 'name' | 'content', value: string) => {
    setPolicies(policies.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const analyzePolicy = async (policy: PolicyData): Promise<PolicyData> => {
    if (!policy.content.trim()) {
      return policy;
    }

    const { data, error } = await supabase.functions.invoke('analyze-policy', {
      body: {
        document_content: policy.content,
        document_name: policy.name
      }
    });

    if (error) throw error;
    return { ...policy, analysis: data };
  };

  const comparePolicies = async () => {
    const validPolicies = policies.filter(p => p.content.trim());
    if (validPolicies.length < 2) {
      toast.error('Please add content for at least 2 policies');
      return;
    }

    setIsComparing(true);
    try {
      // Analyze all policies
      const analyzedPolicies = await Promise.all(
        validPolicies.map(p => analyzePolicy(p))
      );

      // Build coverage comparison
      const allCoverageTypes = new Set<string>();
      analyzedPolicies.forEach(p => {
        p.analysis?.coverage_analysis?.forEach(c => allCoverageTypes.add(c.type));
      });

      const coverageComparison = Array.from(allCoverageTypes).map(type => ({
        type,
        policies: analyzedPolicies.map(p => {
          const coverage = p.analysis?.coverage_analysis?.find(c => c.type === type);
          return {
            name: p.name,
            status: coverage?.status || 'Not Covered',
            limit: coverage?.limit
          };
        })
      }));

      // Calculate winner based on coverage and risk
      const scores = analyzedPolicies.map(p => {
        const coveredCount = p.analysis?.coverage_analysis?.filter(c => c.status === 'Covered').length || 0;
        const gapsCount = p.analysis?.gaps?.length || 0;
        const riskLevel = p.analysis?.risk_assessment?.overall_risk_level?.toLowerCase();
        const riskScore = riskLevel === 'low' ? 30 : riskLevel === 'medium' ? 15 : 0;
        return { name: p.name, score: coveredCount * 10 - gapsCount * 5 + riskScore };
      });

      const winner = scores.reduce((a, b) => a.score > b.score ? a : b).name;

      setComparisonResult({
        policies: analyzedPolicies,
        coverageComparison,
        winner,
        summary: `Based on coverage breadth, gaps analysis, and risk assessment, ${winner} offers the best overall protection.`
      });

      toast.success('Comparison completed!');
    } catch (error) {
      console.error('Comparison error:', error);
      toast.error('Failed to compare policies');
    } finally {
      setIsComparing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Covered') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === 'Partial') return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          Policy Comparison Tool
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="input" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="input">Input Policies</TabsTrigger>
            <TabsTrigger value="results" disabled={!comparisonResult}>Results</TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-4">
            {policies.map((policy, index) => (
              <div key={policy.id} className="p-4 rounded-lg border border-border/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Input
                      value={policy.name}
                      onChange={(e) => updatePolicy(policy.id, 'name', e.target.value)}
                      className="w-40 h-8"
                    />
                    <Badge variant="outline">Policy {index + 1}</Badge>
                  </div>
                  {policies.length > 2 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removePolicy(policy.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <Textarea
                  placeholder="Paste policy text or key details here..."
                  value={policy.content}
                  onChange={(e) => updatePolicy(policy.id, 'content', e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>
            ))}

            <div className="flex gap-2">
              <Button variant="outline" onClick={addPolicy} disabled={policies.length >= 4}>
                <Plus className="h-4 w-4 mr-2" />
                Add Policy
              </Button>
              <Button onClick={comparePolicies} disabled={isComparing} className="flex-1">
                {isComparing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Comparing...
                  </>
                ) : (
                  <>
                    <Scale className="h-4 w-4 mr-2" />
                    Compare Policies
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {comparisonResult && (
              <>
                {/* Winner Banner */}
                <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-semibold">Recommended: {comparisonResult.winner}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{comparisonResult.summary}</p>
                </div>

                {/* Coverage Comparison Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 font-semibold">Coverage Type</th>
                        {comparisonResult.policies.map(p => (
                          <th key={p.id} className="text-center p-3 font-semibold">
                            {p.name}
                            {p.name === comparisonResult.winner && (
                              <Badge className="ml-2" variant="default">Best</Badge>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonResult.coverageComparison.map((row, index) => (
                        <tr key={index} className="border-b border-border/50">
                          <td className="p-3 font-medium">{row.type}</td>
                          {row.policies.map((policy, pIndex) => (
                            <td key={pIndex} className="p-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {getStatusIcon(policy.status)}
                                <span className="text-sm">{policy.status}</span>
                              </div>
                              {policy.limit && (
                                <div className="text-xs text-muted-foreground">{policy.limit}</div>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {comparisonResult.policies.map(policy => (
                    <Card key={policy.id} className={policy.name === comparisonResult.winner ? 'border-green-500/50' : ''}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {policy.name}
                          {policy.name === comparisonResult.winner && (
                            <Badge variant="default">Winner</Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Risk Level:</span>
                          <Badge variant="outline">
                            {policy.analysis?.risk_assessment?.overall_risk_level || 'Unknown'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Gaps Identified:</span>
                          <span>{policy.analysis?.gaps?.length || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Coverage Items:</span>
                          <span>{policy.analysis?.coverage_analysis?.length || 0}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button variant="outline" onClick={() => setComparisonResult(null)} className="w-full">
                  New Comparison
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
