
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BusinessProfile } from "@/lib/chatpdf-types";

interface BusinessProfileFormProps {
  onProfileSubmit: (profile: BusinessProfile) => void;
  isLoading?: boolean;
}

const BusinessProfileForm = ({ onProfileSubmit, isLoading = false }: BusinessProfileFormProps) => {
  const [profile, setProfile] = useState<BusinessProfile>({
    type: "retail",
    size: "small",
    industry: "general",
    employees: 10,
    revenue: "< $1M",
  });

  const handleSubmit = () => {
    onProfileSubmit(profile);
  };

  const businessTypes = [
    { value: "retail", label: "Retail" },
    { value: "service", label: "Service" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "technology", label: "Technology" },
    { value: "healthcare", label: "Healthcare" },
    { value: "construction", label: "Construction" },
    { value: "food", label: "Food & Beverage" },
    { value: "professional", label: "Professional" },
  ];

  const businessSizes = [
    { value: "micro", label: "Micro (1-9 employees)" },
    { value: "small", label: "Small (10-49 employees)" },
    { value: "medium", label: "Medium (50-249 employees)" },
    { value: "large", label: "Large (250+ employees)" },
  ];

  const revenueRanges = [
    { value: "< $1M", label: "Less than $1M" },
    { value: "$1M - $5M", label: "$1M - $5M" },
    { value: "$5M - $10M", label: "$5M - $10M" },
    { value: "$10M - $50M", label: "$10M - $50M" },
    { value: "$50M+", label: "More than $50M" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Profile</CardTitle>
        <CardDescription>
          Provide details about your business to get tailored policy benchmarks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business-type">Business Type</Label>
              <Select
                value={profile.type}
                onValueChange={(value) =>
                  setProfile({ ...profile, type: value })
                }
                disabled={isLoading}
              >
                <SelectTrigger id="business-type">
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-size">Business Size</Label>
              <Select
                value={profile.size}
                onValueChange={(value) =>
                  setProfile({ ...profile, size: value })
                }
                disabled={isLoading}
              >
                <SelectTrigger id="business-size">
                  <SelectValue placeholder="Select business size" />
                </SelectTrigger>
                <SelectContent>
                  {businessSizes.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employees">Number of Employees</Label>
              <Input
                id="employees"
                type="number"
                min={1}
                value={profile.employees}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    employees: parseInt(e.target.value, 10) || 0,
                  })
                }
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="revenue">Annual Revenue</Label>
              <Select
                value={profile.revenue}
                onValueChange={(value) =>
                  setProfile({ ...profile, revenue: value })
                }
                disabled={isLoading}
              >
                <SelectTrigger id="revenue">
                  <SelectValue placeholder="Select revenue range" />
                </SelectTrigger>
                <SelectContent>
                  {revenueRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              placeholder="e.g. Retail, Technology, Consulting"
              value={profile.industry}
              onChange={(e) =>
                setProfile({ ...profile, industry: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={isLoading} 
            className="bg-insurance-blue hover:bg-insurance-blue-dark w-full"
          >
            Compare with Industry Benchmarks
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessProfileForm;
