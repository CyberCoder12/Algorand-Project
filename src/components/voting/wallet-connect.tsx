'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, LogOut, Coins, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { useVotingStore } from '@/lib/voting-store';

export function WalletConnect() {
  const { wallet, connectWallet, disconnectWallet, isLoading } = useVotingStore();

  const formatAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!wallet.connected) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </CardTitle>
          <CardDescription>
            Connect your Algorand wallet to participate in voting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full" 
            onClick={() => connectWallet()}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4 mr-2" />
                Connect with Pera Wallet
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Demo mode: A simulated wallet will be connected
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-green-500" />
            Wallet Connected
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={disconnectWallet}
            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Disconnect
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground">Address</span>
          <code className="text-sm font-mono">{formatAddress(wallet.address)}</code>
        </div>

        {/* Token Balance */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Campus Token Balance</span>
          </div>
          <Badge variant="secondary" className="font-mono">
            {wallet.tokenBalance} CAMPUS
          </Badge>
        </div>

        {/* Eligibility Status */}
        <div className={`flex items-center gap-3 p-3 rounded-lg ${
          wallet.eligible 
            ? 'bg-green-500/10 border border-green-500/20' 
            : 'bg-red-500/10 border border-red-500/20'
        }`}>
          {wallet.eligible ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium text-green-600 dark:text-green-400">
                  Eligible to Vote
                </p>
                <p className="text-sm text-green-600/70 dark:text-green-400/70">
                  You meet the minimum token requirements
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium text-red-600 dark:text-red-400">
                  Not Eligible
                </p>
                <p className="text-sm text-red-600/70 dark:text-red-400/70">
                  You need at least 10 CAMPUS tokens to vote
                </p>
              </div>
            </>
          )}
        </div>

        {/* Verification */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>Identity verified on Algorand blockchain</span>
        </div>
      </CardContent>
    </Card>
  );
}
