
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, RotateCcw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PolicyComparisonCriteria, DEFAULT_PARAMETER_WEIGHTS, COMPARISON_PARAMETERS, ParameterKey } from "@/types/comparison";

interface ParameterWeightSelectorProps {
  weights: PolicyComparisonCriteria;
  onWeightsChange: (weights: PolicyComparisonCriteria) => void;
  market: 'US' | 'UK' | 'India';
}

const ParameterWeightSelector: React.FC<ParameterWeightSelectorProps> = ({
  weights,
  onWeightsChange,
  market
}) => {
  const [localWeights, setLocalWeights] = useState<PolicyComparisonCriteria>(weights);
  
  const totalWeight = Object.values(localWeights).reduce((sum, weight) => sum + weight, 0);
  
  const handleWeightChange = (parameter: ParameterKey, value: number[]) => {
    const newWeights = {
      ...localWeights,
      [parameter]: value[0]
    };
    setLocalWeights(newWeights);
    onWeightsChange(newWeights);
  };
  
  const resetToDefaults = () => {
    setLocalWeights(DEFAULT_PARAMETER_WEIGHTS);
    onWeightsChange(DEFAULT_PARAMETER_WEIGHTS);
  };
  
  const getImportanceBadge = (weight: number) => {
    if (weight >= 30) return { variant: "destructive" as const, label: "Critical" };
    if (weight >= 15) return { variant: "default" as const, label: "High" };
    if (weight >= 5) return { variant: "secondary" as const, label: "Medium" };
    return { variant: "outline" as const, label: "Low" };
  };

  return (
    <TooltipProvider>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Comparison Parameter Weights</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Adjust the importance of each factor in policy comparison for {market} market
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm">Total Weight: </span>
              <Badge variant={totalWeight === 100 ? "default" : "destructive"}>
                {totalWeight}%
              </Badge>
              {totalWeight !== 100 && (
                <span className="text-xs text-amber-600">
                  (Weights should total 100%)
                </span>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Defaults
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {(Object.keys(COMPARISON_PARAMETERS) as ParameterKey[]).map((parameterKey) => {
            const parameter = COMPARISON_PARAMETERS[parameterKey];
            const weight = localWeights[parameterKey];
            const importanceBadge = getImportanceBadge(weight);
            
            return (
              <div key={parameterKey} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Label className="font-medium">{parameter.name}</Label>
                    <Badge variant={importanceBadge.variant}>
                      {importanceBadge.label}
                    </Badge>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="max-w-xs">
                          <p className="font-medium">{parameter.description}</p>
                          <p className="text-xs mt-1">Source: {parameter.dataSource}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="font-semibold text-lg min-w-[3rem] text-right">
                    {weight}%
                  </span>
                </div>
                
                <Slider
                  value={[weight]}
                  onValueChange={(value) => handleWeightChange(parameterKey, value)}
                  max={50}
                  min={0}
                  step={1}
                  className="w-full"
                />
                
                <p className="text-xs text-gray-500">
                  {parameter.description}
                </p>
              </div>
            );
          })}
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Parameter Guidelines</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Premium (40%):</strong> Cost is typically the primary concern for most users</li>
              <li>• <strong>Coverage (30%):</strong> Extent of protection is crucial for peace of mind</li>
              <li>• <strong>Deductible (15%):</strong> Out-of-pocket costs significantly affect value</li>
              <li>• <strong>Exclusions (5%):</strong> Understanding what's not covered is important</li>
              <li>• <strong>Insurer Rating (5%):</strong> Financial stability ensures claim payments</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default ParameterWeightSelector;
