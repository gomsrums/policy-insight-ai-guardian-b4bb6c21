
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from 'lucide-react';
import { AnalysisResult } from "@/lib/chatpdf-types";

interface EnhancedCoverageGapAnalyzerProps {
  analysis: AnalysisResult;
  policyType?: string;
  region?: string;
}

const EnhancedCoverageGapAnalyzer = ({ 
  analysis, 
  policyType = "general",
  region = "UK"
}: EnhancedCoverageGapAnalyzerProps) => {
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Chat with Policy
        </CardTitle>
        <CardDescription>
          Your policy document has been processed and is ready for chat
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Use the chat feature to get instant answers about your policy terms, coverage limits, and exclusions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedCoverageGapAnalyzer;
