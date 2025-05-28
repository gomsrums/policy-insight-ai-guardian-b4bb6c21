
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    policyType: "business",
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

  const ageRanges = [
    { value: "18-25", label: "18-25" },
    { value: "26-35", label: "26-35" },
    { value: "36-45", label: "36-45" },
    { value: "46-55", label: "46-55" },
    { value: "56-65", label: "56-65" },
    { value: "65+", label: "65+" },
  ];

  const locations = [
    { value: "urban", label: "Urban" },
    { value: "suburban", label: "Suburban" },
    { value: "rural", label: "Rural" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Provide details to get tailored policy benchmarks and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs 
          value={profile.policyType} 
          onValueChange={(value) => setProfile({ ...profile, policyType: value as "business" | "individual" })}
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="business">Business Policy</TabsTrigger>
            <TabsTrigger value="individual">Individual Policy</TabsTrigger>
          </TabsList>

          <TabsContent value="business" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business-type">Business Type</Label>
                <Select
                  value={profile.type}
                  onValueChange={(value) => setProfile({ ...profile, type: value })}
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
                  onValueChange={(value) => setProfile({ ...profile, size: value })}
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
                  onChange={(e) => setProfile({ ...profile, employees: parseInt(e.target.value, 10) || 0 })}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="revenue">Annual Revenue</Label>
                <Select
                  value={profile.revenue}
                  onValueChange={(value) => setProfile({ ...profile, revenue: value })}
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
                onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </TabsContent>

          <TabsContent value="individual" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age Range</Label>
                <Select
                  value={profile.individualDetails?.age?.toString() || ""}
                  onValueChange={(value) => setProfile({ 
                    ...profile, 
                    individualDetails: { 
                      ...profile.individualDetails, 
                      age: parseInt(value) || 25,
                      location: profile.individualDetails?.location || "suburban",
                      familySize: profile.individualDetails?.familySize || 1
                    } 
                  })}
                  disabled={isLoading}
                >
                  <SelectTrigger id="age">
                    <SelectValue placeholder="Select age range" />
                  </SelectTrigger>
                  <SelectContent>
                    {ageRanges.map((age) => (
                      <SelectItem key={age.value} value={age.value.split('-')[0]}>
                        {age.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location Type</Label>
                <Select
                  value={profile.individualDetails?.location || "suburban"}
                  onValueChange={(value) => setProfile({ 
                    ...profile, 
                    individualDetails: { 
                      ...profile.individualDetails, 
                      location: value,
                      age: profile.individualDetails?.age || 25,
                      familySize: profile.individualDetails?.familySize || 1
                    } 
                  })}
                  disabled={isLoading}
                >
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select location type" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.value} value={location.value}>
                        {location.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="familySize">Family Size</Label>
                <Input
                  id="familySize"
                  type="number"
                  min={1}
                  value={profile.individualDetails?.familySize || 1}
                  onChange={(e) => setProfile({ 
                    ...profile, 
                    individualDetails: { 
                      ...profile.individualDetails, 
                      familySize: parseInt(e.target.value, 10) || 1,
                      age: profile.individualDetails?.age || 25,
                      location: profile.individualDetails?.location || "suburban"
                    } 
                  })}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="income">Annual Income</Label>
                <Select
                  value={profile.revenue}
                  onValueChange={(value) => setProfile({ ...profile, revenue: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger id="income">
                    <SelectValue placeholder="Select income range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="< $50K">Less than $50K</SelectItem>
                    <SelectItem value="$50K - $100K">$50K - $100K</SelectItem>
                    <SelectItem value="$100K - $200K">$100K - $200K</SelectItem>
                    <SelectItem value="$200K+">More than $200K</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Button 
          onClick={handleSubmit} 
          disabled={isLoading} 
          className="bg-insurance-blue hover:bg-insurance-blue-dark w-full mt-6"
        >
          Compare with Industry Benchmarks
        </Button>
      </CardContent>
    </Card>
  );
};

export default BusinessProfileForm;
