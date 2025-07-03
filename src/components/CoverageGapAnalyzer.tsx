
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from 'lucide-react';
import { AnalysisResult } from "@/lib/chatpdf-types";

interface CoverageGapAnalyzerProps {
  analysis: AnalysisResult;
  policyType?: string;
  region?: string;
}

const CoverageGapAnalyzer = ({ 
  analysis, 
  policyType = "general", 
  region = "UK" 
}: CoverageGapAnalyzerProps) => {
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Chat with Policy
        </CardTitle>
        <CardDescription>
          Your policy is ready for interactive analysis through chat
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Ask questions about your policy coverage, gaps, and recommendations using the chat interface.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoverageGapAnalyzer;
