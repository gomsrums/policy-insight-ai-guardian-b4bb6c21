
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onUseSampleText: () => void;
}

const HeroSection = ({ onUseSampleText }: HeroSectionProps) => {
  return (
    <>
      {/* Hero Section */}
      <section className="professional-gradient py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <span>🛡️</span>
              Trusted by 10,000+ Policy Holders
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              AI-Powered Insurance Analysis
              <span className="block accent-gradient bg-clip-text text-transparent">Get Comprehensive Insights</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Upload your insurance policy document to get detailed analysis including coverage gaps, risk assessment, and personalized recommendations
            </p>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-8 bg-card/50 backdrop-blur-sm border-b border-border/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-80">
            <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-lg">
              <span className="text-emerald-500">🔒</span>
              <span className="text-sm font-medium">GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-lg">
              <span className="text-blue-500">🛡️</span>
              <span className="text-sm font-medium">Secure Processing</span>
            </div>
            <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-lg">
              <span className="text-purple-500">⚡</span>
              <span className="text-sm font-medium">AI-Powered Chat</span>
            </div>
            <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-lg">
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
