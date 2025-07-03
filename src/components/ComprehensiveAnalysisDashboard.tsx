
import { AnalysisResult } from "@/lib/chatpdf-types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

interface ComprehensiveAnalysisDashboardProps {
  analysis: AnalysisResult;
  userContext: {
    location: string;
    propertyType: string;
    businessType: string;
    industry: string;
  };
}

const ComprehensiveAnalysisDashboard = ({ 
  analysis, 
  userContext 
}: ComprehensiveAnalysisDashboardProps) => {
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat with Your Policy
          </CardTitle>
          <CardDescription>
            Your policy has been uploaded and analyzed. You can now chat with it to get answers about your coverage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Use the chat interface on the right to ask questions about your policy document.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprehensiveAnalysisDashboard;
