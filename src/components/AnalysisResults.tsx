
import { AnalysisResult } from "@/lib/chatpdf-types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

interface AnalysisResultsProps {
  analysis: AnalysisResult;
  isLoading?: boolean;
}

const AnalysisResults = ({ analysis, isLoading = false }: AnalysisResultsProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse-slow"></div>
        <div className="h-20 bg-gray-200 rounded animate-pulse-slow"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat with Your Policy
          </CardTitle>
          <CardDescription>
            Your policy document has been processed and is ready for interactive chat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Use the chat interface to ask questions about your policy document, coverage details, terms, and conditions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisResults;
