import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Scale, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Trophy,
  TrendingUp,
  TrendingDown,
  FileText,
  Shield,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { comparePolicies, PolicyComparisonResult } from '@/services/policy-api';
import { toast } from 'sonner';

interface PolicyInput {
  name: string;
  content: string;
}

export const SideBySideComparison: React.FC = () => {
  const [policy1, setPolicy1] = useState<PolicyInput>({ name: 'Policy A', content: '' });
  const [policy2, setPolicy2] = useState<PolicyInput>({ name: 'Policy B', content: '' });
  const [isComparing, setIsComparing] = useState(false);
  const [result, setResult] = useState<PolicyComparisonResult | null>(null);

  const handleCompare = async () => {
    if (!policy1.content.trim() || !policy2.content.trim()) {
      toast.error('Please provide content for both policies');
      return;
    }

    setIsComparing(true);
    try {
      const comparisonResult = await comparePolicies(policy1, policy2);
      setResult(comparisonResult);
      toast.success('Comparison completed!');
    } catch (error) {
      console.error('Comparison error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to compare policies');
    } finally {
      setIsComparing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status?.toLowerCase();
    if (normalizedStatus === 'covered') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (normalizedStatus === 'partial') return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase();
    if (normalizedStatus === 'covered') return 'bg-green-500/10 text-green-600 border-green-500/20';
    if (normalizedStatus === 'partial') return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    return 'bg-red-500/10 text-red-600 border-red-500/20';
  };

  const getBetterPolicyBadge = (better: string) => {
    if (better === 'policy1') return <Badge className="bg-blue-500/20 text-blue-600 text-xs">← Better</Badge>;
    if (better === 'policy2') return <Badge className="bg-purple-500/20 text-purple-600 text-xs">Better →</Badge>;
    return <Badge variant="outline" className="text-xs">Equal</Badge>;
  };

  const resetComparison = () => {
    setResult(null);
    setPolicy1({ name: 'Policy A', content: '' });
    setPolicy2({ name: 'Policy B', content: '' });
  };

  if (result) {
    return (
      <div className="space-y-6">
        {/* Winner Banner */}
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <div>
                  <h3 className="text-xl font-bold">
                    {result.comparison.winner === 'tie' 
                      ? 'Both policies are equally matched' 
                      : `Recommended: ${result.comparison.winnerName}`}
                  </h3>
                  <p className="text-muted-foreground">{result.comparison.summary}</p>
                </div>
              </div>
              {result.comparison.scoreDifference > 0 && (
                <Badge className="bg-primary/20 text-primary text-lg px-4 py-2">
                  +{result.comparison.scoreDifference} points
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Score Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { policy: result.policy1, label: policy1.name, isWinner: result.comparison.winner === 'policy1', color: 'blue' },
            { policy: result.policy2, label: policy2.name, isWinner: result.comparison.winner === 'policy2', color: 'purple' }
          ].map(({ policy, label, isWinner, color }) => (
            <Card key={label} className={`${isWinner ? 'border-2 border-green-500/50 shadow-lg shadow-green-500/10' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className={`h-5 w-5 text-${color}-500`} />
                    {label}
                    {isWinner && <Badge className="bg-green-500/20 text-green-600 ml-2">Winner</Badge>}
                  </CardTitle>
                  <Badge variant="outline" className={policy.riskLevel === 'Low' ? 'border-green-500 text-green-600' : policy.riskLevel === 'High' ? 'border-red-500 text-red-600' : 'border-yellow-500 text-yellow-600'}>
                    {policy.riskLevel} Risk
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Overall Score</span>
                    <span className="font-bold text-lg">{policy.overallScore}/100</span>
                  </div>
                  <Progress value={policy.overallScore} className="h-3" />
                </div>

                {policy.premium && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Annual Premium</span>
                    </div>
                    <span className="font-semibold">
                      {policy.premium.currency} {policy.premium.annual?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    Strengths
                  </h4>
                  <ul className="space-y-1">
                    {policy.strengths?.slice(0, 3).map((strength, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    Weaknesses
                  </h4>
                  <ul className="space-y-1">
                    {policy.weaknesses?.slice(0, 3).map((weakness, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <XCircle className="h-3 w-3 text-red-500 mt-1 flex-shrink-0" />
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Coverage Comparison Table */}
        {result.comparison.coverageComparison && result.comparison.coverageComparison.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Coverage Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-semibold">Coverage Type</th>
                      <th className="text-center p-3 font-semibold text-blue-600">{policy1.name}</th>
                      <th className="text-center p-3 font-semibold">Better</th>
                      <th className="text-center p-3 font-semibold text-purple-600">{policy2.name}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.comparison.coverageComparison.map((row, index) => (
                      <tr key={index} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-3 font-medium">{row.type}</td>
                        <td className="p-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Badge className={getStatusColor(row.policy1.status)}>
                              {row.policy1.status}
                            </Badge>
                            {row.policy1.limit && (
                              <span className="text-xs text-muted-foreground">{row.policy1.limit}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          {getBetterPolicyBadge(row.betterPolicy)}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Badge className={getStatusColor(row.policy2.status)}>
                              {row.policy2.status}
                            </Badge>
                            {row.policy2.limit && (
                              <span className="text-xs text-muted-foreground">{row.policy2.limit}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cost Analysis */}
        {result.comparison.costAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Cost Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-1">Price Difference</h4>
                  <p className="text-sm text-muted-foreground">{result.comparison.costAnalysis.priceDifference}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-1">Value for Money</h4>
                  <p className="text-sm text-muted-foreground">{result.comparison.costAnalysis.valueForMoney}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {result.comparison.recommendations && result.comparison.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-primary" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {result.comparison.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <Badge className={
                      rec.priority === 'High' ? 'bg-red-500/20 text-red-600' :
                      rec.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-600' :
                      'bg-green-500/20 text-green-600'
                    }>
                      {rec.priority}
                    </Badge>
                    <span className="text-sm">{rec.advice}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Detailed Analysis */}
        {result.comparison.detailedAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{result.comparison.detailedAnalysis}</p>
            </CardContent>
          </Card>
        )}

        <Button onClick={resetComparison} className="w-full" variant="outline">
          Compare Different Policies
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          Side-by-Side Policy Comparison
        </CardTitle>
        <CardDescription>
          Compare two insurance policies using AI to identify the best option for your needs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Policy 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <Label className="font-semibold">First Policy</Label>
            </div>
            <Input
              value={policy1.name}
              onChange={(e) => setPolicy1({ ...policy1, name: e.target.value })}
              placeholder="Policy name"
              className="h-9"
            />
            <Textarea
              value={policy1.content}
              onChange={(e) => setPolicy1({ ...policy1, content: e.target.value })}
              placeholder="Paste your first policy text here..."
              rows={10}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {policy1.content.length} characters
            </p>
          </div>

          {/* Policy 2 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-500" />
              <Label className="font-semibold">Second Policy</Label>
            </div>
            <Input
              value={policy2.name}
              onChange={(e) => setPolicy2({ ...policy2, name: e.target.value })}
              placeholder="Policy name"
              className="h-9"
            />
            <Textarea
              value={policy2.content}
              onChange={(e) => setPolicy2({ ...policy2, content: e.target.value })}
              placeholder="Paste your second policy text here..."
              rows={10}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {policy2.content.length} characters
            </p>
          </div>
        </div>

        <Separator />

        <Button 
          onClick={handleCompare} 
          disabled={isComparing || !policy1.content.trim() || !policy2.content.trim()}
          className="w-full"
          size="lg"
        >
          {isComparing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing Policies...
            </>
          ) : (
            <>
              <Scale className="h-4 w-4 mr-2" />
              Compare Policies
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
