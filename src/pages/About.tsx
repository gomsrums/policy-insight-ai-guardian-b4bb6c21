import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import step1Upload from "@/assets/step1-upload.jpg";
import step2Analysis from "@/assets/step2-analysis.jpg";
import step3Review from "@/assets/step3-review.jpg";
import step4Decisions from "@/assets/step4-decisions.jpg";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-insurance-blue-dark mb-6">About Know your Insurance</h1>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Our Mission is </CardTitle>
              <CardDescription>Bringing transparency to insurance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Know your Insurance was created with a simple mission: to help consumers better understand their insurance coverage and make informed decisions. 
                We believe that many people are either underinsured in critical areas or overpaying for coverage they don't need.
              </p>
              <p>
                Our AI-powered analysis tool helps identify potential gaps in your insurance coverage and areas where you might be able to save money, 
                giving you the information you need to optimize your policies.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                {/* First Row */}
                <div className="flex flex-col items-center text-center">
                  <img src={step1Upload} alt="Step 1: Upload Document" className="w-20 h-20 object-cover rounded-lg mb-3" />
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mb-2">1</div>
                  <h3 className="font-semibold mb-1 text-sm">Upload Policy</h3>
                  <p className="text-xs text-muted-foreground">Upload your insurance policy document</p>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <img src={step2Analysis} alt="Step 2: AI Analysis" className="w-20 h-20 object-cover rounded-lg mb-3" />
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mb-2">2</div>
                  <h3 className="font-semibold mb-1 text-sm">AI Analysis</h3>
                  <p className="text-xs text-muted-foreground">Our AI analyzes your coverage</p>
                </div>
                
                {/* Second Row */}
                <div className="flex flex-col items-center text-center">
                  <img src={step3Review} alt="Step 3: Review Results" className="w-20 h-20 object-cover rounded-lg mb-3" />
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mb-2">3</div>
                  <h3 className="font-semibold mb-1 text-sm">Review Analysis</h3>
                  <p className="text-xs text-muted-foreground">Review gaps and recommendations</p>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <img src={step4Decisions} alt="Step 4: Make Decisions" className="w-20 h-20 object-cover rounded-lg mb-3" />
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mb-2">4</div>
                  <h3 className="font-semibold mb-1 text-sm">Make Decisions</h3>
                  <p className="text-xs text-muted-foreground">Use recommendations wisely</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mb-8"></div>
          
          <Card className="mb-6">
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
          
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                We take your privacy seriously. All documents uploaded to Know your Insurance are processed securely and we do not store your policy documents
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
            © {new Date().getFullYear()} Know your Insurance. This tool is for informational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default About;