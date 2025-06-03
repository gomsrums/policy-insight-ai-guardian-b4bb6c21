
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBrokerAuth } from "@/contexts/BrokerAuthContext";
import ComplianceChecker from "@/components/ComplianceChecker";
import Header from "@/components/Header";
import { Building2, Shield, FileCheck, Users, ArrowRight } from "lucide-react";

const Brokers = () => {
  const { broker, isAuthenticated, signOut } = useBrokerAuth();

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <Building2 className="h-12 w-12 text-insurance-blue-dark" />
              </div>
              <h1 className="text-4xl font-bold text-insurance-blue-dark mb-4">
                Insurance Broker Portal
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Ensure regulatory compliance and reduce risks with our advanced policy analysis tools
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardHeader>
                  <Shield className="h-8 w-8 text-insurance-blue mb-2" />
                  <CardTitle>Regulatory Compliance</CardTitle>
                  <CardDescription>
                    Automatically check policies against regional regulations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Real-time regulation database</li>
                    <li>• Automated compliance scoring</li>
                    <li>• Risk level assessment</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <FileCheck className="h-8 w-8 text-insurance-blue mb-2" />
                  <CardTitle>Policy Analysis</CardTitle>
                  <CardDescription>
                    Deep analysis of policy terms and conditions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Coverage gap identification</li>
                    <li>• Non-compliant clause detection</li>
                    <li>• Ambiguous term flagging</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="h-8 w-8 text-insurance-blue mb-2" />
                  <CardTitle>Client Protection</CardTitle>
                  <CardDescription>
                    Protect your clients and your business
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Reduce legal risks</li>
                    <li>• Improve client satisfaction</li>
                    <li>• Professional recommendations</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* CTA Section */}
            <Card className="bg-insurance-blue text-white">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-insurance-blue-light mb-6">
                  Join hundreds of brokers already using our compliance tools
                </p>
                <Link to="/broker-auth">
                  <Button size="lg" variant="secondary" className="bg-white text-insurance-blue hover:bg-gray-100">
                    Sign Up Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Dashboard Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-insurance-blue-dark">
                Welcome, {broker?.company_name}
              </h1>
              <p className="text-gray-600">
                Regulatory Compliance Dashboard
              </p>
            </div>
            <Button 
              onClick={signOut}
              variant="outline"
              className="border-insurance-blue text-insurance-blue hover:bg-insurance-blue hover:text-white"
            >
              Sign Out
            </Button>
          </div>

          {/* Main Content */}
          <ComplianceChecker />
        </div>
      </div>
    </>
  );
};

export default Brokers;
