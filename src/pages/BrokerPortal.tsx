import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Building2, 
  Palette, 
  Users, 
  FileText, 
  Settings,
  Upload,
  Eye,
  Save,
  Link,
  Copy,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import FooterSection from '@/components/FooterSection';

interface BrandSettings {
  companyName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
}

interface ClientRecord {
  id: string;
  name: string;
  email: string;
  policiesAnalyzed: number;
  lastActivity: Date;
  riskScore: number;
}

const BrokerPortal: React.FC = () => {
  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
    companyName: '',
    logoUrl: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    tagline: '',
    contactEmail: '',
    contactPhone: ''
  });

  const [clients, setClients] = useState<ClientRecord[]>([]);

  const [whitelabelEnabled, setWhitelabelEnabled] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleBrandChange = (field: keyof BrandSettings, value: string) => {
    setBrandSettings(prev => ({ ...prev, [field]: value }));
  };

  const saveBrandSettings = () => {
    // In a real app, this would save to the database
    localStorage.setItem('brokerBrandSettings', JSON.stringify(brandSettings));
    toast.success('Brand settings saved successfully');
  };

  const generateWhitelabelLink = () => {
    const encodedSettings = btoa(JSON.stringify(brandSettings));
    const link = `${window.location.origin}?broker=${encodedSettings}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Whitelabel link copied to clipboard');
  };

  const previewWhitelabel = () => {
    const encodedSettings = btoa(JSON.stringify(brandSettings));
    window.open(`${window.location.origin}?broker=${encodedSettings}&preview=true`, '_blank');
  };

  useEffect(() => {
    const saved = localStorage.getItem('brokerBrandSettings');
    if (saved) {
      try {
        setBrandSettings(JSON.parse(saved));
      } catch (e) {
        // ignore parse errors
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            Broker Portal
          </h1>
          <p className="text-muted-foreground mt-2">
            White-label the platform for your clients and manage your brokerage
          </p>
        </div>

        <Tabs defaultValue="branding" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="branding">
              <Palette className="h-4 w-4 mr-2" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="clients">
              <Users className="h-4 w-4 mr-2" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="reports">
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  White-Label Customization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <h4 className="font-medium">Enable White-Label Mode</h4>
                    <p className="text-sm text-muted-foreground">
                      Customize the platform with your branding for client-facing use
                    </p>
                  </div>
                  <Switch 
                    checked={whitelabelEnabled} 
                    onCheckedChange={setWhitelabelEnabled}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input
                        value={brandSettings.companyName}
                        onChange={(e) => handleBrandChange('companyName', e.target.value)}
                        placeholder="Your Brokerage Name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tagline</Label>
                      <Input
                        value={brandSettings.tagline}
                        onChange={(e) => handleBrandChange('tagline', e.target.value)}
                        placeholder="Your trusted insurance partner"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Logo URL</Label>
                      <div className="flex gap-2">
                        <Input
                          value={brandSettings.logoUrl}
                          onChange={(e) => handleBrandChange('logoUrl', e.target.value)}
                          placeholder="https://your-logo-url.com/logo.png"
                        />
                        <Button variant="outline" size="icon">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Primary Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={brandSettings.primaryColor}
                            onChange={(e) => handleBrandChange('primaryColor', e.target.value)}
                            className="w-12 h-10 p-1 cursor-pointer"
                          />
                          <Input
                            value={brandSettings.primaryColor}
                            onChange={(e) => handleBrandChange('primaryColor', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Secondary Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={brandSettings.secondaryColor}
                            onChange={(e) => handleBrandChange('secondaryColor', e.target.value)}
                            className="w-12 h-10 p-1 cursor-pointer"
                          />
                          <Input
                            value={brandSettings.secondaryColor}
                            onChange={(e) => handleBrandChange('secondaryColor', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Contact Email</Label>
                      <Input
                        type="email"
                        value={brandSettings.contactEmail}
                        onChange={(e) => handleBrandChange('contactEmail', e.target.value)}
                        placeholder="contact@yourbrokerage.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Contact Phone</Label>
                      <Input
                        value={brandSettings.contactPhone}
                        onChange={(e) => handleBrandChange('contactPhone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    {/* Preview Card */}
                    <div className="p-4 rounded-lg border border-border/50 space-y-3">
                      <h4 className="text-sm font-medium text-muted-foreground">Preview</h4>
                      <div 
                        className="p-4 rounded-lg"
                        style={{ backgroundColor: brandSettings.primaryColor + '20' }}
                      >
                        <div className="flex items-center gap-3">
                          {brandSettings.logoUrl ? (
                            <img 
                              src={brandSettings.logoUrl} 
                              alt="Logo" 
                              className="h-10 w-10 object-contain"
                            />
                          ) : (
                            <div 
                              className="h-10 w-10 rounded flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: brandSettings.primaryColor }}
                            >
                              {brandSettings.companyName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h3 
                              className="font-bold"
                              style={{ color: brandSettings.primaryColor }}
                            >
                              {brandSettings.companyName}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {brandSettings.tagline}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-border/50">
                  <Button onClick={saveBrandSettings}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </Button>
                  <Button variant="outline" onClick={previewWhitelabel}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="secondary" onClick={generateWhitelabelLink}>
                    {copied ? (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    {copied ? 'Copied!' : 'Copy Client Link'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Client Management
                  </span>
                  <Button size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    Add Client
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 font-semibold">Client</th>
                        <th className="text-center p-3 font-semibold">Policies Analyzed</th>
                        <th className="text-center p-3 font-semibold">Risk Score</th>
                        <th className="text-center p-3 font-semibold">Last Activity</th>
                        <th className="text-right p-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.map(client => (
                        <tr key={client.id} className="border-b border-border/50 hover:bg-muted/20">
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{client.name}</p>
                              <p className="text-sm text-muted-foreground">{client.email}</p>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <Badge variant="outline">{client.policiesAnalyzed}</Badge>
                          </td>
                          <td className="p-3 text-center">
                            <Badge 
                              variant={client.riskScore >= 70 ? 'default' : client.riskScore >= 50 ? 'secondary' : 'destructive'}
                            >
                              {client.riskScore}/100
                            </Badge>
                          </td>
                          <td className="p-3 text-center text-sm text-muted-foreground">
                            {client.lastActivity.toLocaleDateString()}
                          </td>
                          <td className="p-3 text-right">
                            <Button variant="ghost" size="sm">View</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-4xl font-bold text-primary">{clients.length}</p>
                  <p className="text-muted-foreground">Total Clients</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-4xl font-bold text-primary">
                    {clients.reduce((sum, c) => sum + c.policiesAnalyzed, 0)}
                  </p>
                  <p className="text-muted-foreground">Policies Analyzed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-4xl font-bold text-primary">
                    {Math.round(clients.reduce((sum, c) => sum + c.riskScore, 0) / clients.length)}
                  </p>
                  <p className="text-muted-foreground">Avg Risk Score</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Generate Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Client Portfolio Summary
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Risk Analysis Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Coverage Gap Analysis
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Portal Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive alerts when clients analyze policies
                    </p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                  <div>
                    <h4 className="font-medium">Auto-generate Reports</h4>
                    <p className="text-sm text-muted-foreground">
                      Weekly summary reports for all clients
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                  <div>
                    <h4 className="font-medium">Custom Domain</h4>
                    <p className="text-sm text-muted-foreground">
                      Use your own domain for white-label portal
                    </p>
                  </div>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <FooterSection />
    </div>
  );
};

export default BrokerPortal;
