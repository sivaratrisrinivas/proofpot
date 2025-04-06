
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/lib/blockchain/WalletContext";
import { useContract } from "@/lib/blockchain/ContractContext";
import { Loader2, FileCheck } from "lucide-react";

interface RecipeBlockchainDetailsProps {
  recipeId: string;
  title: string;
  tokenId?: string;
}

export const RecipeBlockchainDetails = ({ recipeId, title, tokenId }: RecipeBlockchainDetailsProps) => {
  const { isConnected, account } = useWallet();
  const { recipeContract } = useContract();
  const [owner, setOwner] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getOwnerDetails = async () => {
      if (isConnected && recipeContract && tokenId) {
        setIsLoading(true);
        try {
          const ownerAddress = await recipeContract.getRecipeOwner(tokenId);
          setOwner(ownerAddress);
        } catch (error) {
          console.error("Error fetching owner:", error);
          setOwner(null);
        } finally {
          setIsLoading(false);
        }
      }
    };

    getOwnerDetails();
  }, [isConnected, recipeContract, tokenId]);

  if (!isConnected) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">Blockchain Verification</CardTitle>
          <CardDescription>Connect your wallet to see blockchain details</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Blockchain Verification</CardTitle>
        <CardDescription>
          {tokenId 
            ? "This recipe has been registered on the blockchain" 
            : "This recipe is not yet registered on the blockchain"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tokenId ? (
          <div className="space-y-2">
            <div className="flex items-center">
              <FileCheck className="mr-2 h-4 w-4 text-green-500" />
              <span className="text-sm">Recipe verified on blockchain</span>
            </div>
            <Badge variant="outline" className="mr-2">
              Token ID: {tokenId.substring(0, 8)}...
            </Badge>
            {isLoading ? (
              <div className="flex items-center mt-2">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span className="text-sm">Loading owner details...</span>
              </div>
            ) : owner ? (
              <div className="mt-2">
                <span className="text-sm block">Owner: </span>
                <span className="text-xs font-mono">
                  {owner.substring(0, 6)}...{owner.substring(38)}
                </span>
                {owner.toLowerCase() === account?.toLowerCase() && (
                  <Badge className="mt-2 bg-green-600">You own this recipe</Badge>
                )}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            This recipe hasn't been minted as an NFT yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
