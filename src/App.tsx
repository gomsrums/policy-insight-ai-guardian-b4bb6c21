
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import About from "./pages/About";
import Comparison from "./pages/Comparison";
import Auth from "./pages/Auth";
import CyberInsurance from "./pages/CyberInsurance";
import Admin from "./pages/Admin";

import ImpactFeatures from "./pages/ImpactFeatures";
import PolicyIntelligence from "./pages/PolicyIntelligence";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/comparison" element={<Comparison />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/cyber-insurance" element={<CyberInsurance />} />
            <Route path="/admin" element={<Admin />} />
            
            <Route path="/features" element={<ImpactFeatures />} />
            <Route path="/intelligence" element={<PolicyIntelligence />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
