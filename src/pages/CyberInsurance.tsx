import React from 'react';
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import CyberInsuranceAnalyzer from "@/components/CyberInsuranceAnalyzer";
import { InsuranceChatbot } from "@/components/InsuranceChatbot";

const CyberInsurance = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Cyber Insurance Risk Analyzer
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Comprehensive cyber security risk assessment and insurance analysis specifically designed for online platforms and digital businesses
            </p>
          </div>
          
          <CyberInsuranceAnalyzer />
        </div>
      </main>
      
      <FooterSection />
      <InsuranceChatbot />
    </div>
  );
};

export default CyberInsurance;