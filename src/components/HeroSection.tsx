
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onUseSampleText: () => void;
}

const HeroSection = ({ onUseSampleText }: HeroSectionProps) => {
  return (
    <>
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span>🛡️</span>
              Trusted by 10,000+ Policy Holders
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6">
              AI-Powered Insurance Analysis
              <span className="block text-primary">Get Comprehensive Insights</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Upload your insurance policy document to get detailed analysis including coverage gaps, risk assessment, and personalized recommendations
            </p>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-8 bg-muted/30 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-80">
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg shadow-sm">
              <span className="text-emerald-500">🔒</span>
              <span className="text-sm font-medium">GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg shadow-sm">
              <span className="text-blue-500">🛡️</span>
              <span className="text-sm font-medium">Secure Processing</span>
            </div>
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg shadow-sm">
              <span className="text-purple-500">⚡</span>
              <span className="text-sm font-medium">AI-Powered Chat</span>
            </div>
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg shadow-sm">
              <span className="text-amber-500">🏆</span>
              <span className="text-sm font-medium">Industry Standard</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
