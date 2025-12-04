
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, Loader2, Shield, Brain } from "lucide-react";
import { analytics } from "@/services/analytics";

const Header = () => {
  const { user, profile, signOut, isAuthenticated, isAdmin, loading } = useAuth();

  const handleSignOut = async () => {
    analytics.trackEvent('sign_out_clicked');
    await signOut();
  };

  const handleNavClick = (section: string) => {
    analytics.trackEvent('navigation_click', { section });
  };

  return (
    <header className="border-b py-4 px-6 bg-white">
      <div className="container flex justify-between items-center">
        <Link 
          to="/" 
          className="flex items-center gap-2"
          onClick={() => handleNavClick('logo')}
        >
          <div className="font-bold text-2xl text-insurance-blue-dark">Know Your Insurance</div>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/" 
            className="text-insurance-gray hover:text-insurance-blue transition-colors"
            onClick={() => handleNavClick('home')}
          >
            Home
          </Link>
          <Link 
            to="/about" 
            className="text-insurance-gray hover:text-insurance-blue transition-colors"
            onClick={() => handleNavClick('about')}
          >
            About
          </Link>
          <Link 
            to="/comparison" 
            className="text-insurance-gray hover:text-insurance-blue transition-colors"
            onClick={() => handleNavClick('comparison')}
          >
            Comparison
          </Link>
          <Link 
            to="/intelligence" 
            className="text-insurance-gray hover:text-insurance-blue transition-colors flex items-center gap-1"
            onClick={() => handleNavClick('intelligence')}
          >
            <Brain className="h-4 w-4" />
            Intelligence
          </Link>
          <Link 
            to="/features" 
            className="text-insurance-gray hover:text-insurance-blue transition-colors"
            onClick={() => handleNavClick('features')}
          >
            Analytics
          </Link>
          <Link 
            to="/broker" 
            className="text-insurance-gray hover:text-insurance-blue transition-colors"
            onClick={() => handleNavClick('broker')}
          >
            Broker Portal
          </Link>
          
          {/* Admin Link - Only visible to admin */}
          {isAuthenticated && isAdmin && (
            <Link 
              to="/admin" 
              className="text-insurance-gray hover:text-insurance-blue transition-colors flex items-center gap-1"
              onClick={() => handleNavClick('admin')}
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}
          
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-gray-500">Loading...</span>
            </div>
          ) : isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 text-insurance-gray">
                <User className="h-4 w-4" />
                {profile?.name || user?.email?.split('@')[0]}
                {isAdmin && <Shield className="h-3 w-3 text-insurance-blue" />}
              </span>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="border-insurance-blue text-insurance-blue hover:bg-insurance-blue hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Button
                asChild
                variant="outline"
                className="border-insurance-blue text-insurance-blue hover:bg-insurance-blue hover:text-white"
                onClick={() => analytics.trackEvent('sign_in_clicked')}
              >
                <Link to="/auth">Sign In</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
