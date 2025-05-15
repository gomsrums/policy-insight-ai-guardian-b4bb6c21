
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Header = () => {
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
          <Button variant="outline" className="border-insurance-blue text-insurance-blue hover:bg-insurance-blue hover:text-white">
            Contact
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
