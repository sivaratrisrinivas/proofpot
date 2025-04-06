
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { WalletConnect } from "@/components/blockchain/WalletConnect";

const Header = () => {
  return (
    <header className="border-b bg-background sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold">
          ProofPot
        </Link>
        
        <div className="flex gap-3 items-center">
          <Link to="/create">
            <Button variant="outline" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Recipe
            </Button>
          </Link>
          <WalletConnect />
        </div>
      </div>
    </header>
  );
};

export default Header;
