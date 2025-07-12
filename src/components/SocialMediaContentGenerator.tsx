import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Send, Linkedin, Instagram, Twitter, Loader2 } from 'lucide-react';

interface SocialMediaPost {
  platform: string;
  content: string;
  hashtags: string[];
  imageUrl?: string;
}

const SocialMediaContentGenerator: React.FC = () => {
  const [makeWebhookUrl, setMakeWebhookUrl] = useState('');
  const [contentTopic, setContentTopic] = useState('');
  const [contentType, setContentType] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState<SocialMediaPost[]>([]);

  const socialMediaAccounts = {
    linkedin: 'https://www.linkedin.com/company/107737830',
    instagram: 'https://www.instagram.com/analyse_your_insurance_policy/',
    twitter: 'https://x.com/aiinsurancetool'
  };

  const contentTypes = [
    'Educational Post',
    'Product Feature',
    'Industry News',
    'Tips & Tricks',
    'Case Study',
    'Company Update',
    'Thought Leadership',
    'Customer Success Story'
  ];

  const targetAudiences = [
    'Insurance Brokers',
    'Small Business Owners',
    'Enterprise Clients',
    'Insurance Professionals',
    'Risk Managers',
    'General Public',
    'Tech Enthusiasts'
  ];

  const handleGenerateContent = async () => {
    if (!makeWebhookUrl) {
      toast({
        title: "Error",
        description: "Please enter your Make.com webhook URL",
        variant: "destructive",
      });
      return;
    }

    if (!contentTopic || !contentType || !targetAudience) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const payload = {
        topic: contentTopic,
        contentType,
        targetAudience,
        additionalContext,
        platforms: ['linkedin', 'instagram', 'twitter'],
        socialMediaAccounts,
        companyInfo: {
          name: 'AI Insurance Tool',
          description: 'AI-powered insurance policy analysis and comparison platform',
          industry: 'InsurTech',
          services: ['Policy Analysis', 'Risk Assessment', 'Compliance Checking', 'Coverage Gap Analysis']
        },
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substring(7)
      };

      console.log('Sending content generation request to Make.com:', payload);

      const response = await fetch(makeWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(payload),
      });

      // Since we're using no-cors, we can't read the response
      // For demo purposes, let's generate mock content
      setTimeout(() => {
        const mockPosts: SocialMediaPost[] = [
          {
            platform: 'LinkedIn',
            content: `🔍 ${contentTopic}\n\nAs insurance professionals, understanding ${contentTopic.toLowerCase()} is crucial for better risk assessment. Our AI-powered platform helps brokers analyze policies more efficiently.\n\n✅ Automated risk scoring\n✅ Compliance checking\n✅ Coverage gap identification\n\nReady to transform your insurance analysis process?`,
            hashtags: ['#InsurTech', '#RiskAssessment', '#AIInsurance', '#PolicyAnalysis']
          },
          {
            platform: 'Instagram',
            content: `💡 ${contentTopic}\n\nSimplifying insurance analysis with AI ✨\n\n${contentTopic} made easy with our smart platform 🚀\n\n👆 Link in bio to learn more`,
            hashtags: ['#InsurTech', '#AI', '#Insurance', '#TechForGood', '#Innovation']
          },
          {
            platform: 'Twitter',
            content: `🔥 ${contentTopic}\n\nOur AI platform is revolutionizing how insurance brokers handle ${contentTopic.toLowerCase()}.\n\n⚡ Faster analysis\n⚡ Better accuracy\n⚡ Smarter decisions\n\nTry it today! 👇`,
            hashtags: ['#InsurTech', '#AI', '#Insurance']
          }
        ];

        setGeneratedPosts(mockPosts);
        setIsGenerating(false);

        toast({
          title: "Content Generated!",
          description: "Your social media posts have been generated successfully.",
        });
      }, 3000);

    } catch (error) {
      console.error('Error generating content:', error);
      setIsGenerating(false);
      toast({
        title: "Error",
        description: "Failed to generate content. Please check your webhook URL and try again.",
        variant: "destructive",
      });
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin':
        return <Linkedin className="h-5 w-5 text-blue-600" />;
      case 'instagram':
        return <Instagram className="h-5 w-5 text-pink-600" />;
      case 'twitter':
        return <Twitter className="h-5 w-5 text-blue-400" />;
      default:
        return <Send className="h-5 w-5" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-6 w-6" />
            Social Media Content Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Make.com Webhook Configuration */}
          <div className="space-y-2">
            <Label htmlFor="webhook">Make.com Webhook URL</Label>
            <Input
              id="webhook"
              placeholder="https://hook.eu2.make.com/your-webhook-id"
              value={makeWebhookUrl}
              onChange={(e) => setMakeWebhookUrl(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Enter your Make.com webhook URL to trigger content generation
            </p>
          </div>

          {/* Content Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Content Topic *</Label>
              <Input
                id="topic"
                placeholder="e.g., Cyber Insurance Trends 2024"
                value={contentTopic}
                onChange={(e) => setContentTopic(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Content Type *</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Audience *</Label>
              <Select value={targetAudience} onValueChange={setTargetAudience}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target audience" />
                </SelectTrigger>
                <SelectContent>
                  {targetAudiences.map((audience) => (
                    <SelectItem key={audience} value={audience}>
                      {audience}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Additional Context</Label>
            <Textarea
              id="context"
              placeholder="Any specific points, statistics, or context you want to include..."
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              rows={3}
            />
          </div>

          {/* Social Media Accounts */}
          <div className="space-y-2">
            <Label>Connected Social Media Accounts</Label>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-blue-600" />
                LinkedIn Company
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-pink-600" />
                Instagram Business
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2">
                <Twitter className="h-4 w-4 text-blue-400" />
                Twitter/X Account
              </Badge>
            </div>
          </div>

          <Button 
            onClick={handleGenerateContent} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Generate Social Media Posts
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Content */}
      {generatedPosts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Generated Content</h3>
          {generatedPosts.map((post, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  {getPlatformIcon(post.platform)}
                  {post.platform}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="whitespace-pre-line text-sm">{post.content}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {post.hashtags.map((hashtag, hashIndex) => (
                    <Badge key={hashIndex} variant="secondary" className="text-xs">
                      {hashtag}
                    </Badge>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Copy to Clipboard
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SocialMediaContentGenerator;