
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, Loader2 } from "lucide-react";
import EmailSubscription from "@/components/EmailSubscription";
import { analytics } from "@/services/analytics";

const Header = () => {
  const { user, profile, signOut, isAuthenticated, loading } = useAuth();

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
          <div className="font-bold text-2xl text-insurance-blue-dark">PolicyCheck</div>
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
            to="/brokers" 
            className="text-insurance-gray hover:text-insurance-blue transition-colors"
            onClick={() => handleNavClick('brokers')}
          >
            Brokers
          </Link>
          
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
              <EmailSubscription />
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
