
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { BrokerAuthProvider } from "@/contexts/BrokerAuthContext";
import Index from "./pages/Index";
import About from "./pages/About";
import Comparison from "./pages/Comparison";
import Auth from "./pages/Auth";
import Brokers from "./pages/Brokers";
import BrokerAuth from "./pages/BrokerAuth";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrokerAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/comparison" element={<Comparison />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/brokers" element={<Brokers />} />
              <Route path="/broker-auth" element={<BrokerAuth />} />
              <Route path="/admin" element={<Admin />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </BrokerAuthProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
