
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoginDialog from "@/components/LoginDialog";
import { LogOut, User } from "lucide-react";

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  return (
    <header className="border-b py-4 px-6 bg-white">
      <div className="container flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="font-bold text-2xl text-insurance-blue-dark">PolicyCheck</div>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-insurance-gray hover:text-insurance-blue transition-colors">
            Home
          </Link>
          <Link to="/about" className="text-insurance-gray hover:text-insurance-blue transition-colors">
            About
          </Link>
          <Link to="/comparison" className="text-insurance-gray hover:text-insurance-blue transition-colors">
            Comparison
          </Link>
          
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 text-insurance-gray">
                <User className="h-4 w-4" />
                {user?.name}
              </span>
              <Button
                onClick={logout}
                variant="outline"
                className="border-insurance-blue text-insurance-blue hover:bg-insurance-blue hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setShowLoginDialog(true)}
              variant="outline"
              className="border-insurance-blue text-insurance-blue hover:bg-insurance-blue hover:text-white"
            >
              Login
            </Button>
          )}
        </nav>
      </div>
      
      <LoginDialog
        isOpen={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
      />
    </header>
  );
};

export default Header;
