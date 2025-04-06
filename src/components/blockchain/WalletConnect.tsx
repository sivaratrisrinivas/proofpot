
import { Button } from "@/components/ui/button";
import { useWallet } from "@/lib/blockchain/WalletContext";
import { Wallet, LogOut, Loader2 } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";

export const WalletConnect = () => {
  const { account, connect, disconnect, isConnecting, isConnected } = useWallet();

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  };

  if (isConnected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="border-green-600 text-green-600">
            <Wallet className="mr-2 h-4 w-4" />
            {shortenAddress(account as string)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={copyAddress}>
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem onClick={disconnect}>
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button onClick={connect} disabled={isConnecting}>
      {isConnecting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </>
      )}
    </Button>
  );
};
