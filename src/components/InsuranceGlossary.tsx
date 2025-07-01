import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Book } from "lucide-react";

interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
  examples?: string[];
  relatedTerms?: string[];
}

const glossaryTerms: GlossaryTerm[] = [
  {
    term: "Third-Party Liability",
    definition: "Coverage that protects you if you're legally responsible for injury to other people or damage to their property.",
    category: "Coverage Types",
    examples: ["Damage to another car in an accident", "Injury to a pedestrian"],
    relatedTerms: ["Public Liability", "General Liability"]
  },
  {
    term: "Excess/Deductible", 
    definition: "The amount you pay towards a claim before your insurance company pays the rest.",
    category: "Policy Terms",
    examples: ["£200 excess on car insurance", "$500 deductible on home insurance"],
    relatedTerms: ["Premium", "Claim"]
  },
  {
    term: "Public Liability",
    definition: "Insurance that covers claims made by members of the public for injury or property damage caused by your business activities.",
    category: "Business Insurance",
    examples: ["Customer slip and fall in your store", "Damage to client's property during service"],
    relatedTerms: ["Professional Indemnity", "Employers Liability"]
  },
  {
    term: "Professional Indemnity",
    definition: "Coverage for claims arising from professional services, including errors, omissions, and negligent acts.",
    category: "Business Insurance",
    examples: ["Accounting error leading to client loss", "Design flaw in architectural plans"],
    relatedTerms: ["Public Liability", "Cyber Liability"]
  },
  {
    term: "Cyber Liability",
    definition: "Protection against losses from cyber attacks, data breaches, and digital incidents.",
    category: "Modern Coverage",
    examples: ["Ransomware attack", "Customer data breach", "System downtime"],
    relatedTerms: ["Data Protection", "Business Interruption"]
  },
  {
    term: "Business Interruption",
    definition: "Coverage for lost income and ongoing expenses when your business can't operate normally due to a covered event.",
    category: "Business Insurance",
    examples: ["Fire closes your shop", "Flood damages equipment", "Cyber attack stops operations"],
    relatedTerms: ["Loss of Income", "Additional Expenses"]
  },
  {
    term: "Peril",
    definition: "A specific risk or cause of loss covered by your insurance policy, such as fire, theft, or flood.",
    category: "Policy Terms",
    examples: ["Fire", "Theft", "Flood", "Storm damage"],
    relatedTerms: ["Coverage", "Exclusion"]
  },
  {
    term: "Exclusion",
    definition: "Specific conditions, circumstances, or losses that are not covered by your insurance policy.",
    category: "Policy Terms",
    examples: ["War and terrorism", "Normal wear and tear", "Intentional damage"],
    relatedTerms: ["Peril", "Coverage Limit"]
  },
  {
    term: "Sum Insured",
    definition: "The maximum amount your insurance company will pay for a covered claim.",
    category: "Policy Terms",
    examples: ["£200,000 buildings insurance", "$1M liability limit"],
    relatedTerms: ["Coverage Limit", "Excess"]
  },
  {
    term: "No Claims Discount",
    definition: "A reduction in your premium for each year you don't make a claim, rewarding safe driving or good risk management.",
    category: "Pricing",
    examples: ["5 years no claims = 60% discount", "Protected no claims bonus"],
    relatedTerms: ["Premium", "Bonus Protection"]
  }
];

const categories = ["All", "Coverage Types", "Policy Terms", "Business Insurance", "Modern Coverage", "Pricing"];

const InsuranceGlossary = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredTerms = glossaryTerms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || term.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Book className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Insurance Glossary</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Understand key insurance terms and concepts to make better policy decisions
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search terms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Filter */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto">
          {categories.map((category) => (
            <TabsTrigger 
              key={category} 
              value={category}
              className="text-xs p-2"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          <div className="grid gap-4">
            {filteredTerms.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No terms found matching your search criteria.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredTerms.map((term, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg text-foreground">
                          {term.term}
                        </CardTitle>
                        <Badge variant="secondary" className="mt-2">
                          {term.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base mb-4">
                      {term.definition}
                    </CardDescription>
                    
                    {term.examples && term.examples.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-sm text-foreground mb-2">Examples:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {term.examples.map((example, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground">
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {term.relatedTerms && term.relatedTerms.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm text-foreground mb-2">Related Terms:</h4>
                        <div className="flex flex-wrap gap-2">
                          {term.relatedTerms.map((relatedTerm, idx) => (
                            <Badge 
                              key={idx} 
                              variant="outline" 
                              className="text-xs cursor-pointer hover:bg-primary/10"
                              onClick={() => setSearchTerm(relatedTerm)}
                            >
                              {relatedTerm}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Educational Notice */}
      <Card className="bg-muted/30 border-primary/20">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="font-semibold text-foreground mb-2">
              💡 Need More Help?
            </h3>
            <p className="text-sm text-muted-foreground">
              These definitions are for educational purposes. Always consult with a licensed insurance professional 
              for advice specific to your situation and local regulations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InsuranceGlossary;