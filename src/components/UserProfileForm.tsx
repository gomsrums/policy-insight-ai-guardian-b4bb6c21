import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, User, Home, Briefcase, Shield } from 'lucide-react';
import { UserProfile, HighValueItem } from '@/types/policyIntelligence';
import { nanoid } from 'nanoid';

interface UserProfileFormProps {
  onSubmit: (profile: UserProfile) => void;
  initialProfile?: Partial<UserProfile>;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ onSubmit, initialProfile }) => {
  const [profile, setProfile] = useState<UserProfile>({
    name: initialProfile?.name || '',
    location: initialProfile?.location || '',
    floodZone: initialProfile?.floodZone || '',
    propertyType: initialProfile?.propertyType || 'house',
    propertyValue: initialProfile?.propertyValue || 0,
    contentsValue: initialProfile?.contentsValue || 0,
    highValueItems: initialProfile?.highValueItems || [],
    workFromHome: initialProfile?.workFromHome || false,
    workFromHomeDays: initialProfile?.workFromHomeDays || 0,
    businessEquipmentValue: initialProfile?.businessEquipmentValue || 0,
    hasGardenStructures: initialProfile?.hasGardenStructures || false,
    gardenStructuresValue: initialProfile?.gardenStructuresValue || 0,
    hasPets: initialProfile?.hasPets || false,
    petTypes: initialProfile?.petTypes || [],
    hasLodgers: initialProfile?.hasLodgers || false,
    runsBusinessFromHome: initialProfile?.runsBusinessFromHome || false,
    hasSecuritySystem: initialProfile?.hasSecuritySystem || false,
    securityType: initialProfile?.securityType || []
  });

  const [newItem, setNewItem] = useState<Partial<HighValueItem>>({
    name: '',
    value: 0,
    category: 'other'
  });

  const addHighValueItem = () => {
    if (newItem.name && newItem.value && newItem.value > 0) {
      const item: HighValueItem = {
        id: nanoid(),
        name: newItem.name,
        value: newItem.value,
        category: newItem.category as HighValueItem['category']
      };
      setProfile(prev => ({
        ...prev,
        highValueItems: [...prev.highValueItems, item]
      }));
      setNewItem({ name: '', value: 0, category: 'other' });
    }
  };

  const removeHighValueItem = (id: string) => {
    setProfile(prev => ({
      ...prev,
      highValueItems: prev.highValueItems.filter(item => item.id !== id)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(profile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Details
          </CardTitle>
          <CardDescription>Tell us about yourself and your location</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              placeholder="John Smith"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Postcode/Location</Label>
            <Input
              id="location"
              value={profile.location}
              onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
              placeholder="SW1A 1AA"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="floodZone">Flood Zone (if known)</Label>
            <Select
              value={profile.floodZone}
              onValueChange={(value) => setProfile(prev => ({ ...prev, floodZone: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select flood zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not in flood zone</SelectItem>
                <SelectItem value="zone1">Zone 1 (Low risk)</SelectItem>
                <SelectItem value="zone2">Zone 2 (Medium risk)</SelectItem>
                <SelectItem value="zone3">Zone 3 (High risk)</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Property Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Property Details
          </CardTitle>
          <CardDescription>Information about your property and contents</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="propertyType">Property Type</Label>
            <Select
              value={profile.propertyType}
              onValueChange={(value) => setProfile(prev => ({ ...prev, propertyType: value as UserProfile['propertyType'] }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="flat">Flat/Apartment</SelectItem>
                <SelectItem value="bungalow">Bungalow</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="propertyValue">Property Value (£)</Label>
            <Input
              id="propertyValue"
              type="number"
              value={profile.propertyValue || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, propertyValue: Number(e.target.value) }))}
              placeholder="250000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contentsValue">Total Contents Value (£)</Label>
            <Input
              id="contentsValue"
              type="number"
              value={profile.contentsValue || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, contentsValue: Number(e.target.value) }))}
              placeholder="75000"
            />
          </div>
          <div className="space-y-2 flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="gardenStructures"
                checked={profile.hasGardenStructures}
                onCheckedChange={(checked) => setProfile(prev => ({ ...prev, hasGardenStructures: checked }))}
              />
              <Label htmlFor="gardenStructures">Garden Structures (shed, etc.)</Label>
            </div>
          </div>
          {profile.hasGardenStructures && (
            <div className="space-y-2">
              <Label htmlFor="gardenValue">Garden Structures Value (£)</Label>
              <Input
                id="gardenValue"
                type="number"
                value={profile.gardenStructuresValue || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, gardenStructuresValue: Number(e.target.value) }))}
                placeholder="8000"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* High Value Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            High Value Items
          </CardTitle>
          <CardDescription>Items worth over £1,000 that may need special coverage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Item Name</Label>
              <Input
                value={newItem.name}
                onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Rolex Watch"
              />
            </div>
            <div className="space-y-2">
              <Label>Value (£)</Label>
              <Input
                type="number"
                value={newItem.value || ''}
                onChange={(e) => setNewItem(prev => ({ ...prev, value: Number(e.target.value) }))}
                placeholder="3000"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={newItem.category}
                onValueChange={(value) => setNewItem(prev => ({ ...prev, category: value as HighValueItem['category'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jewelry">Jewelry/Watches</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="art">Art/Antiques</SelectItem>
                  <SelectItem value="collectibles">Collectibles</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex items-end">
              <Button type="button" onClick={addHighValueItem} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>

          {profile.highValueItems.length > 0 && (
            <div className="space-y-2">
              {profile.highValueItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{item.category}</Badge>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground">£{item.value.toLocaleString()}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeHighValueItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Work Situation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Work & Business
          </CardTitle>
          <CardDescription>Your work arrangements that may affect coverage</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="workFromHome"
                checked={profile.workFromHome}
                onCheckedChange={(checked) => setProfile(prev => ({ ...prev, workFromHome: checked }))}
              />
              <Label htmlFor="workFromHome">Work from home</Label>
            </div>
            {profile.workFromHome && (
              <>
                <div className="space-y-2">
                  <Label>Days per week working from home</Label>
                  <Input
                    type="number"
                    min="1"
                    max="7"
                    value={profile.workFromHomeDays || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, workFromHomeDays: Number(e.target.value) }))}
                    placeholder="3"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Business Equipment Value (£)</Label>
                  <Input
                    type="number"
                    value={profile.businessEquipmentValue || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, businessEquipmentValue: Number(e.target.value) }))}
                    placeholder="2500"
                  />
                </div>
              </>
            )}
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="runsBusinessFromHome"
                checked={profile.runsBusinessFromHome}
                onCheckedChange={(checked) => setProfile(prev => ({ ...prev, runsBusinessFromHome: checked }))}
              />
              <Label htmlFor="runsBusinessFromHome">Run a business from home</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="hasLodgers"
                checked={profile.hasLodgers}
                onCheckedChange={(checked) => setProfile(prev => ({ ...prev, hasLodgers: checked }))}
              />
              <Label htmlFor="hasLodgers">Have lodgers/tenants</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="hasPets"
                checked={profile.hasPets}
                onCheckedChange={(checked) => setProfile(prev => ({ ...prev, hasPets: checked }))}
              />
              <Label htmlFor="hasPets">Have pets</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="hasSecuritySystem"
                checked={profile.hasSecuritySystem}
                onCheckedChange={(checked) => setProfile(prev => ({ ...prev, hasSecuritySystem: checked }))}
              />
              <Label htmlFor="hasSecuritySystem">Security system installed</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full">
        Save Profile & Analyze Policy
      </Button>
    </form>
  );
};

export default UserProfileForm;
