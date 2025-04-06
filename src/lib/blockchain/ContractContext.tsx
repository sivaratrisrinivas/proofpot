
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { RecipeContract } from '@/types/contracts';
import { MockRecipeContract } from './mockRecipeContract';
import { useWallet } from './WalletContext';

interface ContractContextType {
  recipeContract: RecipeContract | null;
  isInitializing: boolean;
  mintRecipe: (title: string, description: string) => Promise<{ tokenId: string, txHash: string } | null>;
  getTokenIdForRecipe: (recipeId: string) => Promise<string | null>;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

export const useContract = (): ContractContextType => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error('useContract must be used within a ContractProvider');
  }
  return context;
};

interface ContractProviderProps {
  children: ReactNode;
}

// This is a simple mock storage to associate recipe IDs with token IDs
// In a real app, this would be stored in a database
const recipeTokenMap: Record<string, string> = {};

export const ContractProvider = ({ children }: ContractProviderProps) => {
  const { account, isConnected } = useWallet();
  const [recipeContract, setRecipeContract] = useState<RecipeContract | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Initialize contract when wallet is connected
  useEffect(() => {
    const initializeContract = async () => {
      if (isConnected) {
        setIsInitializing(true);
        try {
          // For now, we're using the mock implementation
          // In a real app, we would connect to the actual contract on the blockchain
          const contractInstance = new MockRecipeContract();
          setRecipeContract(contractInstance);
        } catch (error) {
          console.error('Error initializing contract:', error);
          toast({
            title: "Contract initialization failed",
            description: "Failed to initialize smart contract. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsInitializing(false);
        }
      } else {
        setRecipeContract(null);
      }
    };

    initializeContract();
  }, [isConnected]);

  // Wrapper function for minting a recipe
  const mintRecipe = async (title: string, description: string) => {
    if (!recipeContract || !account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to mint a recipe.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const result = await recipeContract.mintRecipe(title, description, account);
      
      // In a real app, we would store this association in a database
      // For this demo, we're using a simple in-memory object
      // This would allow us to look up the token ID for a recipe ID
      const recipeId = `recipe-${Date.now()}`; // Simulating a recipe ID
      recipeTokenMap[recipeId] = result.tokenId;
      
      toast({
        title: "Recipe minted",
        description: `Recipe "${title}" has been minted as an NFT.`,
      });
      return result;
    } catch (error) {
      console.error('Error minting recipe:', error);
      toast({
        title: "Minting failed",
        description: "Failed to mint your recipe. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Function to get the token ID for a recipe
  const getTokenIdForRecipe = async (recipeId: string): Promise<string | null> => {
    // In a real app, we would query a database to get the token ID for a recipe ID
    // For this demo, we're using a simple in-memory object
    return recipeTokenMap[recipeId] || null;
  };

  const value = {
    recipeContract,
    isInitializing,
    mintRecipe,
    getTokenIdForRecipe,
  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
};
