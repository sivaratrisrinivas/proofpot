
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';

interface WalletContextType {
  account: string | null;
  chainId: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
  isConnected: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const isConnected = !!account;

  // Check if ethereum is available
  const hasEthereum = () => {
    return typeof window !== 'undefined' && window.ethereum !== undefined;
  };

  // Connect wallet
  const connect = async () => {
    if (!hasEthereum()) {
      toast({
        title: "MetaMask not detected",
        description: "Please install MetaMask browser extension and refresh the page.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsConnecting(true);
      const ethereum = window.ethereum;
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        
        const chainIdHex = await ethereum.request({ method: 'eth_chainId' });
        setChainId(chainIdHex);
        
        toast({
          title: "Wallet connected",
          description: `Connected to ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`,
        });
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection failed",
        description: "Failed to connect to your wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    setAccount(null);
    setChainId(null);
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  // Setup event listeners for wallet changes
  useEffect(() => {
    if (!hasEthereum()) return;

    const ethereum = window.ethereum;

    // Handle account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected their wallet
        setAccount(null);
        toast({
          title: "Wallet disconnected",
          description: "Your wallet has been disconnected.",
        });
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
        toast({
          title: "Account changed",
          description: `Connected to ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`,
        });
      }
    };

    // Handle chain changes
    const handleChainChanged = (chainIdHex: string) => {
      setChainId(chainIdHex);
      toast({
        title: "Network changed",
        description: "The blockchain network has changed.",
      });
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    // Check if already connected
    ethereum.request({ method: 'eth_accounts' })
      .then((accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          ethereum.request({ method: 'eth_chainId' })
            .then((chainIdHex: string) => setChainId(chainIdHex));
        }
      })
      .catch((err: Error) => console.error('Error checking accounts:', err));

    // Cleanup
    return () => {
      if (ethereum.removeListener) {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [account]);

  const value = {
    account,
    chainId,
    connect,
    disconnect,
    isConnecting,
    isConnected,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
