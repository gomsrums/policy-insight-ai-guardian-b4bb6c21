import React from 'react';
import Header from '@/components/Header';
import FooterSection from '@/components/FooterSection';
import TruePolicyIntelligence from '@/components/TruePolicyIntelligence';

const PolicyIntelligence: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <TruePolicyIntelligence />
      </main>
      <FooterSection />
    </div>
  );
};

export default PolicyIntelligence;
