
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-insurance-blue-dark mb-6">About PolicyCheck</h1>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
              <CardDescription>Bringing transparency to insurance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                PolicyCheck was created with a simple mission: to help consumers better understand their insurance coverage and make informed decisions. 
                We believe that many people are either underinsured in critical areas or overpaying for coverage they don't need.
              </p>
              <p>
                Our AI-powered analysis tool helps identify potential gaps in your insurance coverage and areas where you might be able to save money, 
                giving you the information you need to optimize your policies.
              </p>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 list-decimal pl-5">
                  <li>Upload your insurance policy document or paste the text</li>
                  <li>Our AI analyzes your coverage details</li>
                  <li>Review the analysis highlighting coverage gaps and potential overpayments</li>
                  <li>Use our recommendations to make informed decisions</li>
                </ol>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>We Support All Types</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Our system can analyze various insurance policies:</p>
                <ul className="space-y-2 list-disc pl-5 mt-2">
                  <li>Health Insurance</li>
                  <li>Auto Insurance</li>
                  <li>Homeowners/Renters Insurance</li>
                  <li>Life Insurance</li>
                  <li>Disability Insurance</li>
                  <li>Travel Insurance</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                We take your privacy seriously. All documents uploaded to PolicyCheck are processed securely and we do not store your policy documents
                after analysis is complete. Your data is encrypted during transmission and processing.
              </p>
              <p>
                Our analysis is powered by advanced AI that extracts and analyzes the key information from your policy without human intervention,
                ensuring your personal information remains confidential.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <footer className="mt-12 py-6 border-t bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} PolicyCheck. This tool is for informational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default About;
