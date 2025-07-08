import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Scale } from "lucide-react";

export interface ComparisonData {
  policyType: string;
  country: string;
  policy1: {
    provider: string;
    monthlyPremium: number;
    coverageAmount: number;
    deductible: number;
    details: string;
  };
  policy2: {
    provider: string;
    monthlyPremium: number;
    coverageAmount: number;
    deductible: number;
    details: string;
  };
}

interface SimpleComparisonFormProps {
  onCompare: (data: ComparisonData) => void;
  isComparing: boolean;
}

interface FormErrors {
  policyType?: string;
  country?: string;
  policy1?: {
    provider?: string;
    monthlyPremium?: string;
    coverageAmount?: string;
    deductible?: string;
  };
  policy2?: {
    provider?: string;
    monthlyPremium?: string;
    coverageAmount?: string;
    deductible?: string;
  };
}

const SimpleComparisonForm = ({ onCompare, isComparing }: SimpleComparisonFormProps) => {
  const [formData, setFormData] = useState<ComparisonData>({
    policyType: "",
    country: "",
    policy1: {
      provider: "",
      monthlyPremium: 0,
      coverageAmount: 0,
      deductible: 0,
      details: ""
    },
    policy2: {
      provider: "",
      monthlyPremium: 0,
      coverageAmount: 0,
      deductible: 0,
      details: ""
    }
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = () => {
    const newErrors: FormErrors = { policy1: {}, policy2: {} };
    
    if (!formData.policyType) newErrors.policyType = "Policy type is required";
    if (!formData.country) newErrors.country = "Country is required";
    
    // Policy 1 validation
    if (!formData.policy1.provider) newErrors.policy1!.provider = "Provider name is required";
    if (formData.policy1.monthlyPremium <= 0) newErrors.policy1!.monthlyPremium = "Premium must be greater than 0";
    if (formData.policy1.coverageAmount <= 0) newErrors.policy1!.coverageAmount = "Coverage amount must be greater than 0";
    if (formData.policy1.deductible < 0) newErrors.policy1!.deductible = "Deductible cannot be negative";
    
    // Policy 2 validation
    if (!formData.policy2.provider) newErrors.policy2!.provider = "Provider name is required";
    if (formData.policy2.monthlyPremium <= 0) newErrors.policy2!.monthlyPremium = "Premium must be greater than 0";
    if (formData.policy2.coverageAmount <= 0) newErrors.policy2!.coverageAmount = "Coverage amount must be greater than 0";
    if (formData.policy2.deductible < 0) newErrors.policy2!.deductible = "Deductible cannot be negative";
    
    setErrors(newErrors);
    return !newErrors.policyType && !newErrors.country && 
           Object.keys(newErrors.policy1 || {}).length === 0 && 
           Object.keys(newErrors.policy2 || {}).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onCompare(formData);
    }
  };

  const updateBasicData = (field: 'policyType' | 'country', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const updatePolicyData = (policyNumber: 1 | 2, field: string, value: string | number) => {
    const policyKey = `policy${policyNumber}` as 'policy1' | 'policy2';
    setFormData(prev => ({
      ...prev,
      [policyKey]: {
        ...prev[policyKey],
        [field]: value
      }
    }));
    
    // Clear errors
    if (errors[policyKey]?.[field as keyof typeof errors.policy1]) {
      setErrors(prev => ({
        ...prev,
        [policyKey]: {
          ...prev[policyKey],
          [field]: undefined
        }
      }));
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Compare Insurance Policies
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter details for two policies to compare them side by side
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="policyType">Policy Type *</Label>
              <Select 
                value={formData.policyType} 
                onValueChange={(value) => updateBasicData('policyType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select insurance type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto Insurance</SelectItem>
                  <SelectItem value="home">Home Insurance</SelectItem>
                  <SelectItem value="health">Health Insurance</SelectItem>
                  <SelectItem value="life">Life Insurance</SelectItem>
                </SelectContent>
              </Select>
              {errors.policyType && <p className="text-sm text-red-500">{errors.policyType}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Select 
                value={formData.country} 
                onValueChange={(value) => updateBasicData('country', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">🇺🇸 United States</SelectItem>
                  <SelectItem value="UK">🇬🇧 United Kingdom</SelectItem>
                  <SelectItem value="CA">🇨🇦 Canada</SelectItem>
                  <SelectItem value="AU">🇦🇺 Australia</SelectItem>
                  <SelectItem value="DE">🇩🇪 Germany</SelectItem>
                  <SelectItem value="FR">🇫🇷 France</SelectItem>
                  <SelectItem value="IN">🇮🇳 India</SelectItem>
                  <SelectItem value="JP">🇯🇵 Japan</SelectItem>
                  <SelectItem value="SG">🇸🇬 Singapore</SelectItem>
                </SelectContent>
              </Select>
              {errors.country && <p className="text-sm text-red-500">{errors.country}</p>}
            </div>
          </div>

          {/* Policy Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Policy 1 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Policy A</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Insurance Provider *</Label>
                  <Input
                    placeholder="e.g., State Farm, Allstate"
                    value={formData.policy1.provider}
                    onChange={(e) => updatePolicyData(1, 'provider', e.target.value)}
                  />
                  {errors.policy1?.provider && <p className="text-sm text-red-500">{errors.policy1.provider}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Monthly Premium ($) *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="150.00"
                    value={formData.policy1.monthlyPremium || ""}
                    onChange={(e) => updatePolicyData(1, 'monthlyPremium', parseFloat(e.target.value) || 0)}
                  />
                  {errors.policy1?.monthlyPremium && <p className="text-sm text-red-500">{errors.policy1.monthlyPremium}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Coverage Amount ($) *</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="100000"
                    value={formData.policy1.coverageAmount || ""}
                    onChange={(e) => updatePolicyData(1, 'coverageAmount', parseFloat(e.target.value) || 0)}
                  />
                  {errors.policy1?.coverageAmount && <p className="text-sm text-red-500">{errors.policy1.coverageAmount}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Deductible ($) *</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="500"
                    value={formData.policy1.deductible || ""}
                    onChange={(e) => updatePolicyData(1, 'deductible', parseFloat(e.target.value) || 0)}
                  />
                  {errors.policy1?.deductible && <p className="text-sm text-red-500">{errors.policy1.deductible}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Additional Details</Label>
                  <Textarea
                    placeholder="Special features, exclusions, etc."
                    value={formData.policy1.details}
                    onChange={(e) => updatePolicyData(1, 'details', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Policy 2 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Policy B</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Insurance Provider *</Label>
                  <Input
                    placeholder="e.g., GEICO, Progressive"
                    value={formData.policy2.provider}
                    onChange={(e) => updatePolicyData(2, 'provider', e.target.value)}
                  />
                  {errors.policy2?.provider && <p className="text-sm text-red-500">{errors.policy2.provider}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Monthly Premium ($) *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="140.00"
                    value={formData.policy2.monthlyPremium || ""}
                    onChange={(e) => updatePolicyData(2, 'monthlyPremium', parseFloat(e.target.value) || 0)}
                  />
                  {errors.policy2?.monthlyPremium && <p className="text-sm text-red-500">{errors.policy2.monthlyPremium}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Coverage Amount ($) *</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="120000"
                    value={formData.policy2.coverageAmount || ""}
                    onChange={(e) => updatePolicyData(2, 'coverageAmount', parseFloat(e.target.value) || 0)}
                  />
                  {errors.policy2?.coverageAmount && <p className="text-sm text-red-500">{errors.policy2.coverageAmount}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Deductible ($) *</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="750"
                    value={formData.policy2.deductible || ""}
                    onChange={(e) => updatePolicyData(2, 'deductible', parseFloat(e.target.value) || 0)}
                  />
                  {errors.policy2?.deductible && <p className="text-sm text-red-500">{errors.policy2.deductible}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Additional Details</Label>
                  <Textarea
                    placeholder="Special features, exclusions, etc."
                    value={formData.policy2.details}
                    onChange={(e) => updatePolicyData(2, 'details', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isComparing}
          >
            {isComparing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Comparing Policies...
              </>
            ) : (
              <>
                <Scale className="mr-2 h-4 w-4" />
                Compare Policies
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SimpleComparisonForm;