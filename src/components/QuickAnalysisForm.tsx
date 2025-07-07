
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export interface QuickAnalysisData {
  policyType: string;
  country: string;
  monthlyPremium: number;
  coverageAmount: number;
  deductible: number;
  additionalDetails: string;
}

interface QuickAnalysisFormProps {
  onAnalyze: (data: QuickAnalysisData) => void;
  isAnalyzing: boolean;
}

// Define proper error types with string messages
interface FormErrors {
  policyType?: string;
  country?: string;
  monthlyPremium?: string;
  coverageAmount?: string;
  deductible?: string;
  additionalDetails?: string;
}

const QuickAnalysisForm = ({ onAnalyze, isAnalyzing }: QuickAnalysisFormProps) => {
  const [formData, setFormData] = useState<QuickAnalysisData>({
    policyType: "",
    country: "",
    monthlyPremium: 0,
    coverageAmount: 0,
    deductible: 0,
    additionalDetails: ""
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (!formData.policyType) newErrors.policyType = "Policy type is required";
    if (!formData.country) newErrors.country = "Country is required";
    if (formData.monthlyPremium <= 0) newErrors.monthlyPremium = "Premium must be greater than 0";
    if (formData.coverageAmount <= 0) newErrors.coverageAmount = "Coverage amount must be greater than 0";
    if (formData.deductible < 0) newErrors.deductible = "Deductible cannot be negative";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onAnalyze(formData);
    }
  };

  const updateFormData = (field: keyof QuickAnalysisData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Insurance Analysis</CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter your policy details for instant AI-powered insights
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="policyType">Policy Type *</Label>
              <Select 
                value={formData.policyType} 
                onValueChange={(value) => updateFormData('policyType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your insurance type" />
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
                onValueChange={(value) => updateFormData('country', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your country" />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthlyPremium">Monthly Premium ($) *</Label>
              <Input
                id="monthlyPremium"
                type="number"
                min="0"
                step="0.01"
                placeholder="150.00"
                value={formData.monthlyPremium || ""}
                onChange={(e) => updateFormData('monthlyPremium', parseFloat(e.target.value) || 0)}
              />
              {errors.monthlyPremium && <p className="text-sm text-red-500">{errors.monthlyPremium}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverageAmount">Coverage Amount ($) *</Label>
              <Input
                id="coverageAmount"
                type="number"
                min="0"
                placeholder="100000"
                value={formData.coverageAmount || ""}
                onChange={(e) => updateFormData('coverageAmount', parseFloat(e.target.value) || 0)}
              />
              {errors.coverageAmount && <p className="text-sm text-red-500">{errors.coverageAmount}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deductible">Deductible ($) *</Label>
            <Input
              id="deductible"
              type="number"
              min="0"
              placeholder="500"
              value={formData.deductible || ""}
              onChange={(e) => updateFormData('deductible', parseFloat(e.target.value) || 0)}
            />
            {errors.deductible && <p className="text-sm text-red-500">{errors.deductible}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalDetails">Additional Details (Optional)</Label>
            <Textarea
              id="additionalDetails"
              placeholder="Any specific concerns or questions about your policy..."
              value={formData.additionalDetails}
              onChange={(e) => updateFormData('additionalDetails', e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Insurance'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuickAnalysisForm;
