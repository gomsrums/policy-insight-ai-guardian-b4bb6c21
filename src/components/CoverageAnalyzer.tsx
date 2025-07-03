
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from 'lucide-react';
import { AnalysisResult } from "@/lib/chatpdf-types";

interface CoverageAnalyzerProps {
  analysis: AnalysisResult;
  userContext?: {
    location?: string;
    propertyType?: string;
    businessType?: string;
  };
}

const CoverageAnalyzer = ({ analysis, userContext }: CoverageAnalyzerProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Chat with Policy
        </CardTitle>
        <CardDescription>
          Your policy document is ready for interactive chat
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Use the chat interface to ask questions about your policy coverage, terms, and conditions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoverageAnalyzer;
